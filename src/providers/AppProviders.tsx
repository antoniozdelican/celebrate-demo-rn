import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createQueryClient } from '@/lib/queryClient';

/**
 * Composition root for cross-cutting providers.
 *
 * Tests render screens with their own provider stack, so this is deliberately
 * thin and free of app-specific logic.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  // Created in state so Fast Refresh does not discard the cache on every edit.
  const [queryClient] = useState(createQueryClient);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
