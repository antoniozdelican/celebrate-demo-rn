import type {
  PaginatedUsersDto,
  UserDetail,
  UserDetailDto,
  UsersPage,
} from '@/features/users/api/users.types';
import { toUserDetail, toUsersPage } from '@/features/users/api/users.mappers';
import { apiGet } from '@/lib/httpClient';

/** The brief allows 20–50; 30 fills a tall screen without overfetching. */
export const PAGE_SIZE = 30;

/** Only what the row renders — the full payload is ~20 fields deep. */
const LIST_FIELDS = 'id,firstName,lastName,email,image,company';

export async function fetchUsers(
  { skip, signal }: { skip: number; signal?: AbortSignal },
): Promise<UsersPage> {
  const dto = await apiGet<PaginatedUsersDto>('/users', {
    query: { limit: PAGE_SIZE, skip, select: LIST_FIELDS },
    signal,
  });
  return toUsersPage(dto);
}

export async function searchUsers(
  { query, skip, signal }: { query: string; skip: number; signal?: AbortSignal },
): Promise<UsersPage> {
  const dto = await apiGet<PaginatedUsersDto>('/users/search', {
    query: { q: query, limit: PAGE_SIZE, skip, select: LIST_FIELDS },
    signal,
  });
  return toUsersPage(dto);
}

export async function fetchUserById(
  { id, signal }: { id: number; signal?: AbortSignal },
): Promise<UserDetail> {
  const dto = await apiGet<UserDetailDto>(`/users/${id}`, { signal });
  return toUserDetail(dto);
}
