import { useQuery } from '@tanstack/react-query';

import { fetchUserById } from '@/features/users/api/users.api';
import { usersKeys } from '@/features/users/hooks/useUsersList';

/**
 * The list passes only an id through navigation, so the detail screen owns its
 * own fetch. That keeps the route serialisable and the screen deep-linkable.
 */
export function useUserDetail(id: number) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: ({ signal }) => fetchUserById({ id, signal }),
  });
}
