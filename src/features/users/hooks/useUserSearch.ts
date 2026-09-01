import { useCallback, useState } from 'react';

import { useDebouncedValue } from '@/lib/useDebouncedValue';

/**
 * Long enough to collapse a burst of typing into one request, short enough to
 * still feel immediate.
 */
export const SEARCH_DEBOUNCE_MS = 350;

/**
 * Owns the search query and its debounced counterpart.
 *
 * Deliberately free of any UI: the query is driven by the platform's native
 * search bar (UISearchController on iOS, SearchView on Android), so this hook
 * is the only piece of search behaviour that can be tested directly.
 */
export function useUserSearch() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);

  const clear = useCallback(() => setQuery(''), []);

  return { query, setQuery, debouncedQuery, clear };
}
