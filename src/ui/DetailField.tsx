import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export type DetailFieldProps = {
  label: string;
  value: string | null | undefined;
  testID?: string;
};

/** Stacked, not side-by-side: long emails and addresses need the full width. */
export function DetailField({ label, value, testID }: DetailFieldProps) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <View testID={testID} style={styles.container}>
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
      <Text variant="body">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs / 2 },
});
