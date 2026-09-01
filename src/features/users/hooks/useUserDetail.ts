import { useQuery } from '@tanstack/react-query';

import { fetchUserById } from '@/features/users/api/users.api';
import { usersKeys } from '@/features/users/hooks/useUsersList';

export function useUserDetail(id: number) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: ({ signal }) => fetchUserById({ id, signal }),
  });
}
