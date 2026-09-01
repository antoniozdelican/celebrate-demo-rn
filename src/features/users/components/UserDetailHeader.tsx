import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { testIDs } from '@/lib/testIDs';
import { colors, spacing } from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

export const HEADER_MAX_HEIGHT = 240;
export const HEADER_MIN_HEIGHT = 92;
const COLLAPSE_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export type UserDetailHeaderProps = {
  /** Scroll offset of the screen's scroll view, written on the UI thread. */
  scrollY: SharedValue<number>;
  fullName: string;
  headline: string;
  avatarUrl: string;
  onBack: () => void;
};

/**
 * Collapsible header.
 *
 * Every interpolation runs inside `useAnimatedStyle`, so the whole collapse is
 * driven on the UI thread and stays smooth regardless of what the JS thread is
 * doing (parsing a freshly fetched page, for instance).
 */
export function UserDetailHeader({
  scrollY,
  fullName,
  headline,
  avatarUrl,
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

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE * 0.6], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [0, COLLAPSE_RANGE],
          [1, 0.85],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.65, COLLAPSE_RANGE],
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
          accessibilityLabel="Go back"
          style={styles.back}
        >
          <Text variant="label" color="primary">
            ‹ Back
          </Text>
        </Touchable>

        <Animated.View style={[styles.compact, compactStyle]} pointerEvents="none">
          <Text
            testID={testIDs.userDetail.compactTitle}
            variant="label"
            numberOfLines={1}
          >
            {fullName}
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.expanded, expandedStyle]} pointerEvents="none">
        <Avatar uri={avatarUrl} name={fullName} size="lg" />
        <Text variant="title" align="center" numberOfLines={1}>
          {fullName}
        </Text>
        <Text variant="caption" color="textSecondary" align="center" numberOfLines={1}>
          {headline}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  bar: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  back: { alignSelf: 'flex-start' },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl * 2,
  },
  expanded: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
