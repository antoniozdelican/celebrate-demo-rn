import { act, renderHook } from '@testing-library/react-native';

import { SEARCH_DEBOUNCE_MS, useUserSearch } from '@/features/users/hooks/useUserSearch';

/**
 * Search behaviour is tested here rather than through the screen: the field
 * itself is a native platform control with no testID, so the hook is the
 * meaningful seam. Real timers throughout — the debounce is 350ms and fake
 * timers deadlock against RNTL's waitFor.
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('useUserSearch', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useUserSearch());

    expect(result.current.query).toBe('');
    expect(result.current.debouncedQuery).toBe('');
  });

  it('reflects the raw query immediately but debounces the derived one', async () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => result.current.setQuery('Emily'));

    // The bound value updates at once so the field stays responsive...
    expect(result.current.query).toBe('Emily');
    // ...while the value that drives fetching lags behind.
    expect(result.current.debouncedQuery).toBe('');

    await act(async () => {
      await wait(SEARCH_DEBOUNCE_MS + 80);
    });

    expect(result.current.debouncedQuery).toBe('Emily');
  });

  it('collapses a burst of typing into the final value only', async () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => result.current.setQuery('E'));
    act(() => result.current.setQuery('Em'));
    act(() => result.current.setQuery('Emily'));

    // No intermediate value is ever published.
    expect(result.current.debouncedQuery).toBe('');

    await act(async () => {
      await wait(SEARCH_DEBOUNCE_MS + 80);
    });

    expect(result.current.debouncedQuery).toBe('Emily');
  });

  it('clear() resets both the query and the debounced query', async () => {
    const { result } = renderHook(() => useUserSearch());

    act(() => result.current.setQuery('Emily'));
    await act(async () => {
      await wait(SEARCH_DEBOUNCE_MS + 80);
    });
    expect(result.current.debouncedQuery).toBe('Emily');

    act(() => result.current.clear());
    expect(result.current.query).toBe('');

    await act(async () => {
      await wait(SEARCH_DEBOUNCE_MS + 80);
    });
    expect(result.current.debouncedQuery).toBe('');
  });
});
