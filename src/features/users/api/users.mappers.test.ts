import { toUserDetail, toUserSummary, toUsersPage } from '@/features/users/api/users.mappers';
import type { UserDetailDto, UserSummaryDto } from '@/features/users/api/users.types';
import { makeUserDetail, makeUserSummary, makeUsersPage } from '@/test/mocks/users.fixtures';

describe('toUserSummary', () => {
  it('composes the full name and prefers the job title as the headline', () => {
    const summary = toUserSummary(makeUserSummary(1));

    expect(summary.fullName).toBe('First1 Last1');
    expect(summary.headline).toBe('Support Specialist');
  });

  it('falls back to the email when the user has no company title', () => {
    const dto: UserSummaryDto = { ...makeUserSummary(1), company: undefined };

    expect(toUserSummary(dto).headline).toBe('user1@example.com');
  });
});

describe('toUsersPage', () => {
  it('maps every row and carries the paging envelope through', () => {
    const page = toUsersPage(makeUsersPage({ total: 208, skip: 30, limit: 30 }));

    expect(page.users).toHaveLength(30);
    expect(page).toMatchObject({ total: 208, skip: 30, limit: 30 });
    expect(page.users[0]?.fullName).toBe('First31 Last31');
  });

  it('handles a page with no results', () => {
    const page = toUsersPage(makeUsersPage({ total: 0, skip: 0, limit: 30 }));

    expect(page.users).toEqual([]);
    expect(page.total).toBe(0);
  });
});

describe('toUserDetail', () => {
  it('maps nested company and address into flat domain shapes', () => {
    const detail = toUserDetail(makeUserDetail(1));

    expect(detail.company).toEqual({
      name: 'Company 1',
      title: 'Support Specialist',
      department: 'Support',
    });
    expect(detail.address?.street).toBe('1 Test Street');
    expect(detail.address?.postalCode).toBe('12345');
  });

  it('normalises every absent optional to null rather than undefined', () => {
    // Only the fields that are always present; everything optional is absent.
    const sparse: UserDetailDto = { ...makeUserSummary(1), company: undefined };
    const detail = toUserDetail(sparse);

    expect(detail.company).toBeNull();
    expect(detail.address).toBeNull();
    for (const value of [detail.username, detail.phone, detail.age, detail.gender, detail.birthDate, detail.university]) {
      expect(value).toBeNull();
    }
    expect(detail.physical).toEqual({
      bloodGroup: null,
      height: null,
      weight: null,
      eyeColor: null,
    });
  });

  it('never carries sensitive fields into the domain model', () => {
    // The real endpoint returns these; nothing should be able to reach the UI
    // by accident, so the mapper is asserted to drop them.
    const withSecrets = {
      ...makeUserDetail(1),
      password: 'hunter2',
      ssn: '123-45-6789',
      bank: { cardNumber: '4111111111111111', iban: 'DE89370400440532013000' },
      crypto: { wallet: '0xdeadbeef' },
      macAddress: '00:11:22:33:44:55',
      ip: '192.168.0.1',
      ein: '12-3456789',
    } as UserDetailDto;

    const detail = toUserDetail(withSecrets);
    const serialised = JSON.stringify(detail);

    for (const key of ['password', 'ssn', 'bank', 'crypto', 'macAddress', 'ip', 'ein']) {
      expect(detail).not.toHaveProperty(key);
    }
    for (const secret of ['hunter2', '123-45-6789', '4111111111111111', '0xdeadbeef']) {
      expect(serialised).not.toContain(secret);
    }
  });
});
