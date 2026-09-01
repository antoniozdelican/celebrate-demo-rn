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
 * job title is dropped. Endpoints measured from the native recording.
 */
const AVATAR_MAX = 94;
const AVATAR_MIN = 42;
const NAME_LINE_MAX = typography.largeTitle.lineHeight;
const NAME_MIN = 19;
const SUBTITLE_HEIGHT = typography.body.lineHeight;

/**
 * The avatar does not only shrink — it also rises to sit flush under the bar,
 * from an 18pt gap at rest to roughly 1pt collapsed.
 */
const AVATAR_TOP_MAX = 18;
const AVATAR_TOP_MIN = 1;
const AVATAR_RISE = AVATAR_TOP_MAX - AVATAR_TOP_MIN;

/**
 * Scale factors, not sizes: the avatar and name are laid out once at full size
 * and animated with `scale`, so no frame triggers a layout pass or makes
 * expo-image resample its bitmap.
 */
const AVATAR_SCALE_MIN = AVATAR_MIN / AVATAR_MAX;
const NAME_SCALE_MIN = NAME_MIN / typography.largeTitle.fontSize;

export const HEADER_MAX_HEIGHT = 264;
export const HEADER_MIN_HEIGHT = 127;
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

  /**
   * `progress` is 0 at rest and 1 fully collapsed. Deriving every style from
   * it keeps the elements in lockstep.
   */
  const avatarStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateY: -AVATAR_RISE * progress },
        { scale: 1 - progress * (1 - AVATAR_SCALE_MIN) },
      ],
    };
  });

  const nameStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const scale = 1 - progress * (1 - NAME_SCALE_MIN);
    // Scaling from the top leaves a gap underneath the avatar; translate up by
    // exactly the height it gave back so the stack stays tight.
    const avatarFreed = AVATAR_MAX * progress * (1 - AVATAR_SCALE_MIN) + AVATAR_RISE * progress;
    return { transform: [{ translateY: -avatarFreed }, { scale }] };
  });

  // The job title goes first and fastest — the one element the native header
  // drops entirely rather than shrinking.
  const subtitleStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [0, COLLAPSE_RANGE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const avatarFreed = AVATAR_MAX * progress * (1 - AVATAR_SCALE_MIN) + AVATAR_RISE * progress;
    const nameFreed = NAME_LINE_MAX * progress * (1 - NAME_SCALE_MIN);
    return {
      opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE * 0.35], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: -(avatarFreed + nameFreed) }],
    };
  });

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
        <Animated.View style={[styles.avatar, avatarStyle]}>
          <Avatar uri={avatarUrl} name={fullName} fill />
        </Animated.View>

        <Animated.Text style={[styles.name, nameStyle]} numberOfLines={1}>
          {fullName}
        </Animated.Text>

        <Animated.View style={[styles.subtitle, subtitleStyle]}>
          <Text variant="body" color="textSecondary" align="center" numberOfLines={1}>
            {headline}
          </Text>
        </Animated.View>
      </View>

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
    // Anchored to the top so the upward translations do the positioning;
    // centring would fight them.
    justifyContent: 'flex-start',
    paddingTop: AVATAR_TOP_MAX,
    gap: spacing.xs,
  },
  avatar: {
    width: AVATAR_MAX,
    height: AVATAR_MAX,
    // Shrink towards the bar rather than about the centre.
    transformOrigin: 'top center',
  },
  name: {
    ...typography.largeTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    transformOrigin: 'top center',
  },
  subtitle: { height: SUBTITLE_HEIGHT, justifyContent: 'center' },
});
