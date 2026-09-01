import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { testIDs } from '@/lib/testIDs';
import { colors, spacing, typography } from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

/** Bar height matches UINavigationBar so the compact title lines up with it. */
const BAR_HEIGHT = 44;

/**
 * The header shrinks rather than empties: at rest a large avatar, name and job
 * title; collapsed, a small avatar and name remain under the bar and only the
 * job title is dropped. These are the measured endpoints of that transition.
 */
const AVATAR_MAX = 96;
const AVATAR_MIN = 40;
const NAME_MAX = typography.largeTitle.fontSize;
const NAME_MIN = 22;
const SUBTITLE_HEIGHT = typography.heading.lineHeight;

export const HEADER_MAX_HEIGHT = 256;
export const HEADER_MIN_HEIGHT = 128;
const COLLAPSE_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export type UserDetailHeaderProps = {
  /** Scroll offset of the screen's scroll view, written on the UI thread. */
  scrollY: SharedValue<number>;
  fullName: string;
  headline: string;
  avatarUrl: string;
  /** Title of the screen being returned to, as iOS labels its back button. */
  backTitle: string;
  onBack: () => void;
};

/**
 * Collapsible header.
 *
 * Every interpolation runs inside `useAnimatedStyle`, so the collapse is driven
 * on the UI thread and stays smooth regardless of what JS is doing.
 *
 * Avatar and name are animated through their dimensions and font size rather
 * than a `scale` transform: a transform would leave the original layout box
 * behind, so the surrounding content could not close up as the header shrinks.
 */
export function UserDetailHeader({
  scrollY,
  fullName,
  headline,
  avatarUrl,
  backTitle,
  onBack,
}: UserDetailHeaderProps) {
  const insets = useSafeAreaInsets();

  const containerStyle = useAnimatedStyle(() => ({
    height:
      interpolate(
        scrollY.value,
        [0, COLLAPSE_RANGE],
        [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
        Extrapolation.CLAMP,
      ) + insets.top,
  }));

  const avatarStyle = useAnimatedStyle(() => {
    const size = interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [AVATAR_MAX, AVATAR_MIN],
      Extrapolation.CLAMP,
    );
    return { width: size, height: size };
  });

  const nameStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [NAME_MAX, NAME_MIN],
      Extrapolation.CLAMP,
    ),
    lineHeight: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [typography.largeTitle.lineHeight, 28],
      Extrapolation.CLAMP,
    ),
  }));

  // The job title goes first and fastest — it is the one element the native
  // header drops entirely rather than shrinking.
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE * 0.35], [1, 0], Extrapolation.CLAMP),
    height: interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE * 0.6],
      [SUBTITLE_HEIGHT, 0],
      Extrapolation.CLAMP,
    ),
  }));

  // Reaches full opacity before the collapse completes, so the title reads as
  // solid rather than washed out.
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.45, COLLAPSE_RANGE * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  // Belongs to the scrolled state only, matching how UIKit swaps
  // scrollEdgeAppearance for standardAppearance.
  const separatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      testID={testIDs.userDetail.header}
      style={[styles.container, { paddingTop: insets.top }, containerStyle]}
    >
      <View style={styles.bar}>
        <Touchable
          onPress={onBack}
          borderlessRipple
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Back to ${backTitle}`}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
          <Text variant="body" color="primary" style={styles.backLabel}>
            {backTitle}
          </Text>
        </Touchable>

        <Animated.View style={[styles.compact, compactStyle]} pointerEvents="none">
          <Text testID={testIDs.userDetail.compactTitle} variant="label" numberOfLines={1}>
            {fullName}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.hero} pointerEvents="none">
        <Animated.View style={avatarStyle}>
          <Avatar uri={avatarUrl} name={fullName} fill />
        </Animated.View>

        <Animated.Text style={[styles.name, nameStyle]} numberOfLines={1}>
          {fullName}
        </Animated.Text>

        <Animated.View style={[styles.subtitle, subtitleStyle]}>
          <Text variant="heading" color="textSecondary" align="center" numberOfLines={1}>
            {headline}
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.separator, separatorStyle]} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, overflow: 'hidden' },
  bar: { height: BAR_HEIGHT, justifyContent: 'center' },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingRight: spacing.md,
  },
  // Negative margin pulls the label against the chevron the way UIKit does.
  backLabel: { marginLeft: -spacing.xs },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl * 3,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  name: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  subtitle: { justifyContent: 'center', overflow: 'hidden' },
  separator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
