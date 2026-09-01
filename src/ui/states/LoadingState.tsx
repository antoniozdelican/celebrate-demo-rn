import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme/tokens';

export type LoadingStateProps = { testID?: string };

/** Full-bleed loading state, for a first load with nothing to show yet. */
export function LoadingState({ testID }: LoadingStateProps) {
  return (
    <View testID={testID} style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
