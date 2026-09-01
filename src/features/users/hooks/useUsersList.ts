import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchUsers, searchUsers } from '@/features/users/api/users.api';
import type { UserSummary, UsersPage } from '@/features/users/api/users.types';

export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
  search: (query: string) => [...usersKeys.all, 'search', query] as const,
  detail: (id: number) => [...usersKeys.all, 'detail', id] as const,
};

function getNextSkip(lastPage: UsersPage): number | undefined {
  const next = lastPage.skip + lastPage.limit;
  return next < lastPage.total ? next : undefined;
}

/**
 * Backs the Home list for both browsing and searching.
 *
 * Search is server-side: DummyJSON's /users/search paginates the same way as
 * /users, so both modes share one infinite query and differ only by key and
 * fetcher. Filtering client-side would only ever search the pages already
 * loaded, which silently misrepresents what exists.
 *
 * `query` is expected to already be debounced by the caller.
 */
export function useUsersList(query: string) {
  const trimmed = query.trim();
  const isSearching = trimmed.length > 0;

  const infiniteQuery = useInfiniteQuery({
    queryKey: isSearching ? usersKeys.search(trimmed) : usersKeys.list(),
    queryFn: ({ pageParam, signal }) =>
      isSearching
        ? searchUsers({ query: trimmed, skip: pageParam, signal })
        : fetchUsers({ skip: pageParam, signal }),
    initialPageParam: 0,
    getNextPageParam: getNextSkip,
    // Keeps the previous results on screen while a new search resolves, so the
    // list does not flash empty between keystrokes.
    placeholderData: keepPreviousData,
  });

  const users = useMemo<UserSummary[]>(
    () => infiniteQuery.data?.pages.flatMap((page) => page.users) ?? [],
    [infiniteQuery.data],
  );

  const total = infiniteQuery.data?.pages[0]?.total ?? 0;

  return { ...infiniteQuery, users, total, isSearching };
}
