import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  testID?: string;
  retryTestID?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Check your connection and try again.',
  onRetry,
  testID,
  retryTestID,
}: ErrorStateProps) {
  return (
    <View testID={testID} style={styles.container}>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text variant="body" color="textSecondary" align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry ? <Button testID={retryTestID} label="Try again" onPress={onRetry} /> : null}
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
