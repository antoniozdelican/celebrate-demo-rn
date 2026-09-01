import { QueryClient } from '@tanstack/react-query';

import { isRetryableError } from '@/lib/httpClient';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Only retry what can plausibly succeed; a 404 should surface at once.
        retry: (failureCount, error) => failureCount < MAX_RETRIES && isRetryableError(error),
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        // No window focus in RN; refetching here would need AppState wiring.
        refetchOnWindowFocus: false,
      },
    },
  });
}
