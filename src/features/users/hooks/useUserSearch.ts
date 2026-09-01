import { useCallback, useState } from 'react';

import { useDebouncedValue } from '@/lib/useDebouncedValue';

export const SEARCH_DEBOUNCE_MS = 350;

/** UI-free so search behaviour stays testable — the field itself is native. */
export function useUserSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const clear = useCallback(() => setQuery(''), []);

  return { query, setQuery, debouncedQuery, clear };
}
