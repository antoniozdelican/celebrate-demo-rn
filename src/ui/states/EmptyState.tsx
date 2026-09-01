import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { Text } from '@/ui/Text';

export type EmptyStateProps = {
  title?: string;
  message?: string;
  testID?: string;
};

export function EmptyState({
  title = 'Nothing here',
  message = 'There is nothing to show yet.',
  testID,
}: EmptyStateProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  message: { maxWidth: 280 },
});
