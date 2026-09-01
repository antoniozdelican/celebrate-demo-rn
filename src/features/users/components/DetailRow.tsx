import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export type DetailRowProps = {
  label: string;
  value: string | null | undefined;
};

/** Renders nothing when the value is absent, so sections stay free of blanks. */
export function DetailRow({ label, value }: DetailRowProps) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <View style={styles.row}>
      <Text variant="caption" color="textSecondary" style={styles.label}>
        {label}
      </Text>
      <Text variant="body" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm, gap: spacing.md },
  label: { width: 104 },
  value: { flex: 1 },
});
