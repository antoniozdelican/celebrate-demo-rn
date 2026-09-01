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

const BAR_HEIGHT = 44;

/** Endpoints measured from the native app: it shrinks, it does not empty. */
const AVATAR_MAX = 94;
const AVATAR_MIN = 42;
const NAME_LINE_MAX = typography.largeTitle.lineHeight;
const NAME_MIN = 19;
const SUBTITLE_HEIGHT = typography.body.lineHeight;

/** The avatar rises to sit flush under the bar as well as shrinking. */
const AVATAR_TOP_MAX = 18;
const AVATAR_TOP_MIN = 1;
const AVATAR_RISE = AVATAR_TOP_MAX - AVATAR_TOP_MIN;

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
 * Transforms and opacity only — animating width/height/fontSize forces a layout
 * pass every frame and makes expo-image resample, which visibly stutters.
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

  // progress: 0 at rest, 1 fully collapsed. Every style derives from it.
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
    // Translate up by exactly the height the avatar gave back.
    const avatarFreed = AVATAR_MAX * progress * (1 - AVATAR_SCALE_MIN) + AVATAR_RISE * progress;
    return { transform: [{ translateY: -avatarFreed }, { scale }] };
  });

  // Dropped entirely rather than shrunk, as the native header does.
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

  // Full opacity before the collapse completes, so it never reads washed out.
  const compactStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.45, COLLAPSE_RANGE * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity,
      // Opacity alone leaves it hit-testable and VoiceOver-visible.
      display: opacity === 0 ? 'none' : 'flex',
    };
  });

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
  // Pulls the label against the chevron the way UIKit does.
  backLabel: { marginLeft: -spacing.xs },
  compact: {
    // Reanimated only applies its style from the first frame; without this the
    // title flashes at full opacity on mount.
    opacity: 0,
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
