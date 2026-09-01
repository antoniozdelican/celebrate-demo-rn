import type { ReactNode } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

export type ScreenProps = {
  children: ReactNode;
  edges?: readonly Edge[];
  testID?: string;
};

/** Owns safe-area insets and status bar so screens stay platform-agnostic. */
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
