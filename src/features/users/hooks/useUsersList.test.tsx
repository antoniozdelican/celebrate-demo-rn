import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { useUsersList } from '@/features/users/hooks/useUsersList';
import { API_BASE_URL } from '@/lib/httpClient';
import { server } from '@/test/mocks/server';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function recordRequests() {
  const urls: string[] = [];
  server.events.on('request:start', ({ request }) => urls.push(request.url));
  return urls;
}

afterEach(() => server.events.removeAllListeners());

/**
 * The search endpoint is exercised here rather than through the screen,
 * because the query itself now comes from a native search control.
 */
describe('useUsersList', () => {
  it('fetches the paginated list when the query is empty', async () => {
    const urls = recordRequests();
    const { result } = renderHook(() => useUsersList(''), { wrapper });

    await waitFor(() => expect(result.current.users.length).toBeGreaterThan(0));

    expect(result.current.isSearching).toBe(false);
    expect(urls.some((url) => url.startsWith(`${API_BASE_URL}/users?`))).toBe(true);
    expect(urls.some((url) => url.includes('/users/search'))).toBe(false);
  });

  it('switches to the search endpoint when a query is present', async () => {
    const urls = recordRequests();
    const { result } = renderHook(() => useUsersList('first1'), { wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.isSearching).toBe(true);
    const searchUrl = urls.find((url) => url.includes('/users/search'));
    expect(searchUrl).toBeDefined();
    expect(searchUrl).toContain('q=first1');
  });

  it('treats a whitespace-only query as browsing, not searching', async () => {
    const urls = recordRequests();
    const { result } = renderHook(() => useUsersList('   '), { wrapper });

    await waitFor(() => expect(result.current.users.length).toBeGreaterThan(0));

    expect(result.current.isSearching).toBe(false);
    expect(urls.some((url) => url.includes('/users/search'))).toBe(false);
  });

  it('requests only the fields the list row renders', async () => {
    const urls = recordRequests();
    const { result } = renderHook(() => useUsersList(''), { wrapper });

    await waitFor(() => expect(result.current.users.length).toBeGreaterThan(0));

    // Trimming the payload is a deliberate performance choice; assert it so a
    // future change to the endpoint does not silently undo it.
    const listUrl = urls.find((url) => url.startsWith(`${API_BASE_URL}/users?`));
    expect(listUrl).toContain('select=');
    expect(listUrl).not.toContain('password');
  });

  it('exposes the next page and appends it to the same list', async () => {
    const { result } = renderHook(() => useUsersList(''), { wrapper });

    await waitFor(() => expect(result.current.users.length).toBeGreaterThan(0));
    const firstPageCount = result.current.users.length;
    expect(result.current.hasNextPage).toBe(true);

    void result.current.fetchNextPage();

    await waitFor(() => expect(result.current.users.length).toBeGreaterThan(firstPageCount));
  });
});
