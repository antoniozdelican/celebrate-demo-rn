import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { motion, spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

export type ExpandableSectionProps = {
  title: string;
  children: ReactNode;
  initiallyExpanded?: boolean;
  toggleTestID?: string;
  contentTestID?: string;
};

/**
 * Expand/collapse driven by Reanimated.
 *
 * The content is measured once via an absolutely positioned copy, so the
 * animated container can move between 0 and the real content height without
 * hard-coding it. Height and opacity are animated together to avoid a visible
 * clip edge mid-transition.
 */
export function ExpandableSection({
  title,
  children,
  initiallyExpanded = false,
  toggleTestID,
  contentTestID,
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(initiallyExpanded ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(expanded ? 1 : 0, { duration: motion.base });
  }, [expanded, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 90}deg` }],
  }));

  return (
    <View>
      <Touchable
        testID={toggleTestID}
        onPress={() => setExpanded((current) => !current)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={title}
        style={styles.header}
      >
        <Text variant="label">{title}</Text>
        <Animated.View style={chevronStyle}>
          <Text variant="label" color="textSecondary">
            ›
          </Text>
        </Animated.View>
      </Touchable>

      <Animated.View style={[styles.clip, animatedStyle]}>
        <View
          style={styles.measured}
          onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
        >
          <View testID={contentTestID}>{children}</View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  clip: { overflow: 'hidden' },
  // Absolutely positioned so measuring it does not affect the animated parent.
  measured: { position: 'absolute', top: 0, left: 0, right: 0 },
});
