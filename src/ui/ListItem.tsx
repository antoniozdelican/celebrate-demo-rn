import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';
import { Touchable } from '@/ui/Touchable';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  /** Leading slot — typically an Avatar, but deliberately unconstrained. */
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  testID?: string;
};

/**
 * Composable row. It accepts slots rather than an `avatarUrl` prop so it stays
 * usable for rows that are not people.
 */
export function ListItem({ title, subtitle, left, right, onPress, testID }: ListItemProps) {
  return (
    <Touchable
      testID={testID}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={styles.row}
    >
      {left ? <View style={styles.left}>{left}</View> : null}

      <View style={styles.body}>
        <Text variant="label" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  left: { marginRight: spacing.md },
  body: { flex: 1, gap: 2 },
  right: { marginLeft: spacing.md },
});
