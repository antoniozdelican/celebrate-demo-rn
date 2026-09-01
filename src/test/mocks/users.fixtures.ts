import type { PaginatedUsersDto, UserDetailDto, UserSummaryDto } from '@/features/users/api/users.types';

const DEPARTMENTS = ['Engineering', 'Support', 'Marketing', 'Research'] as const;
const TITLES = ['Sales Manager', 'Support Specialist', 'Analyst', 'Engineer'] as const;

/** Deterministic generator so assertions can rely on exact names. */
export function makeUserSummary(id: number, overrides: Partial<UserSummaryDto> = {}): UserSummaryDto {
  return {
    id,
    firstName: `First${id}`,
    lastName: `Last${id}`,
    email: `user${id}@example.com`,
    image: `https://example.test/avatar/${id}.png`,
    company: {
      department: DEPARTMENTS[id % DEPARTMENTS.length] ?? 'Engineering',
      name: `Company ${id}`,
      title: TITLES[id % TITLES.length] ?? 'Engineer',
    },
    ...overrides,
  };
}

export function makeUsersPage(
  { total, skip, limit }: { total: number; skip: number; limit: number },
): PaginatedUsersDto {
  const count = Math.max(0, Math.min(limit, total - skip));
  return {
    users: Array.from({ length: count }, (_, index) => makeUserSummary(skip + index + 1)),
    total,
    skip,
    limit,
  };
}

export function makeUserDetail(id: number, overrides: Partial<UserDetailDto> = {}): UserDetailDto {
  return {
    ...makeUserSummary(id),
    username: `user${id}`,
    phone: `+1-555-000${id}`,
    age: 30 + (id % 10),
    gender: id % 2 === 0 ? 'female' : 'male',
    birthDate: '1994-04-01',
    university: `University ${id}`,
    bloodGroup: 'O+',
    height: 170 + (id % 20),
    weight: 60 + (id % 20),
    eyeColor: 'Green',
    address: {
      address: `${id} Test Street`,
      city: 'Testville',
      state: 'Teststate',
      stateCode: 'TS',
      postalCode: '12345',
      country: 'United States',
    },
    ...overrides,
  };
}
