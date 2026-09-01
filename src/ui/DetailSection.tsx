import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export type DetailSectionProps = {
  title: string;
  children: ReactNode;
  testID?: string;
};

/** Grouped-list section: caption outside, flat tinted card inside, no shadow. */
export function DetailSection({ title, children, testID }: DetailSectionProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Text variant="sectionHeader" color="textSecondary" style={styles.caption}>
        {title.toUpperCase()}
      </Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  caption: { paddingHorizontal: spacing.xs },
  card: {
    backgroundColor: colors.groupedCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
});
