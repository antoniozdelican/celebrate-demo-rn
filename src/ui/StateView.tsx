import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme/tokens';
import { Button } from '@/ui/Button';
import { Text } from '@/ui/Text';

type BaseProps = { testID?: string };

/** Full-bleed loading state, for a first load with nothing to show yet. */
export function LoadingState({ testID }: BaseProps) {
  return (
    <View testID={testID} style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export type ErrorStateProps = BaseProps & {
  title?: string;
  message?: string;
  onRetry?: () => void;
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

export type EmptyStateProps = BaseProps & {
  title?: string;
  message?: string;
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
