import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export type DetailFieldProps = {
  label: string;
  value: string | null | undefined;
  testID?: string;
};

/**
 * Label stacked above its value.
 *
 * A side-by-side layout forces long values (an email, a full address) to wrap
 * inside a narrow column and break mid-word; stacking gives them the full
 * width.
 */
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
