import { QueryClient } from '@tanstack/react-query';

import { isRetryableError } from '@/lib/httpClient';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Only retry what can plausibly succeed on a second attempt. Retrying
        // a 404 three times just delays the error state the user needs to see.
        retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryableError(error),
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        // The dataset is stable, so refetching on every remount is wasted work.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        // React Native has no window focus; RN-specific refetching would need
        // AppState wiring, which is not worth it for a deterministic dataset.
        refetchOnWindowFocus: false,
      },
    },
  });
}
