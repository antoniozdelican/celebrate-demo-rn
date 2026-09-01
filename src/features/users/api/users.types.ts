/** DTOs and domain models kept separate so shape changes stop at the mappers. */

export type UserAddressDto = {
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
};

export type UserCompanyDto = {
  department: string;
  name: string;
  title: string;
};

/** Subset requested via `?select=` for list rows. */
export type UserSummaryDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  company?: UserCompanyDto;
};

/** Full payload from `/users/{id}`. Sensitive fields are deliberately omitted. */
export type UserDetailDto = UserSummaryDto & {
  username?: string;
  phone?: string;
  age?: number;
  gender?: string;
  birthDate?: string;
  university?: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
  address?: UserAddressDto;
  company?: UserCompanyDto;
};

export type PaginatedUsersDto = {
  users: UserSummaryDto[];
  total: number;
  skip: number;
  limit: number;
};

// --- Domain models -------------------------------------------------------

export type UserSummary = {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string;
  /** Pre-composed secondary line for the list row. */
  headline: string;
};

export type UserDetail = UserSummary & {
  username: string | null;
  phone: string | null;
  age: number | null;
  gender: string | null;
  birthDate: string | null;
  university: string | null;
  company: { name: string; title: string; department: string } | null;
  address: { street: string; city: string; state: string; postalCode: string; country: string } | null;
  physical: { bloodGroup: string | null; height: number | null; weight: number | null; eyeColor: string | null };
};

export type UsersPage = {
  users: UserSummary[];
  total: number;
  skip: number;
  limit: number;
};
