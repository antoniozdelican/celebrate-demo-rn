import type {
  PaginatedUsersDto,
  UserDetail,
  UserDetailDto,
  UserSummary,
  UserSummaryDto,
  UsersPage,
} from '@/features/users/api/users.types';

const nullable = <T>(value: T | undefined | null): T | null => value ?? null;

function fullNameOf(dto: { firstName: string; lastName: string }): string {
  return `${dto.firstName} ${dto.lastName}`.trim();
}

export function toUserSummary(dto: UserSummaryDto): UserSummary {
  // Title alone, as the native app shows; email only when there is no title.
  const headline = dto.company?.title ?? dto.email;

  return {
    id: dto.id,
    fullName: fullNameOf(dto),
    email: dto.email,
    avatarUrl: dto.image,
    headline,
  };
}

export function toUsersPage(dto: PaginatedUsersDto): UsersPage {
  return {
    users: dto.users.map(toUserSummary),
    total: dto.total,
    skip: dto.skip,
    limit: dto.limit,
  };
}

export function toUserDetail(dto: UserDetailDto): UserDetail {
  return {
    ...toUserSummary(dto),
    username: nullable(dto.username),
    phone: nullable(dto.phone),
    age: nullable(dto.age),
    gender: nullable(dto.gender),
    birthDate: nullable(dto.birthDate),
    university: nullable(dto.university),
    company: dto.company
      ? {
          name: dto.company.name,
          title: dto.company.title,
          department: dto.company.department,
        }
      : null,
    address: dto.address
      ? {
          street: dto.address.address,
          city: dto.address.city,
          state: dto.address.state,
          postalCode: dto.address.postalCode,
          country: dto.address.country,
        }
      : null,
    physical: {
      bloodGroup: nullable(dto.bloodGroup),
      height: nullable(dto.height),
      weight: nullable(dto.weight),
      eyeColor: nullable(dto.eyeColor),
    },
  };
}
