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
 * Browsing and searching share one infinite query, differing only by key and
 * fetcher — /users and /users/search paginate identically. `query` must
 * already be debounced by the caller.
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
