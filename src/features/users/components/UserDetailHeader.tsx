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
import { colors, spacing } from '@/theme/tokens';
import { Avatar } from '@/ui/Avatar';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

/** Bar height matches UINavigationBar so the collapsed state lines up with it. */
const BAR_HEIGHT = 44;
export const HEADER_MAX_HEIGHT = 268;
export const HEADER_MIN_HEIGHT = BAR_HEIGHT;
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
 * Every interpolation runs inside `useAnimatedStyle`, so the whole collapse is
 * driven on the UI thread and stays smooth regardless of what the JS thread is
 * doing.
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

  const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, COLLAPSE_RANGE * 0.5], [1, 0], Extrapolation.CLAMP),
  }));

  // Reaches full opacity before the collapse completes, so the title reads as
  // solid rather than washed out at rest.
  const compactStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [COLLAPSE_RANGE * 0.45, COLLAPSE_RANGE * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  // The separator belongs to the scrolled state only, matching how UIKit
  // switches from scrollEdgeAppearance to standardAppearance.
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

      <Animated.View style={[styles.expanded, expandedStyle]} pointerEvents="none">
        <Avatar uri={avatarUrl} name={fullName} size="xl" />
        <Text variant="largeTitle" align="center" numberOfLines={1} style={styles.name}>
          {fullName}
        </Text>
        <Text variant="heading" color="textSecondary" align="center" numberOfLines={1}>
          {headline}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.separator, separatorStyle]} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
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
  expanded: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  name: { paddingHorizontal: spacing.md },
  separator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
