import type { ReactNode } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

export type ScreenProps = {
  children: ReactNode;
  /** Which insets to apply. Screens under a native header usually skip 'top'. */
  edges?: readonly Edge[];
  testID?: string;
};

/**
 * Screen shell. Owns safe-area insets and status bar styling so individual
 * screens never deal with the notch or the Android status bar directly.
 */
export function Screen({ children, edges = ['top', 'bottom'], testID }: ScreenProps) {
  return (
    <SafeAreaView testID={testID} style={styles.safe} edges={edges}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
});
