import { HttpResponse, http } from 'msw';

import { API_BASE_URL } from '@/lib/httpClient';
import { makeUserDetail, makeUsersPage } from '@/test/mocks/users.fixtures';

/** Matches the real dataset size so pagination behaves realistically in tests. */
export const MOCK_TOTAL_USERS = 208;

function readPaging(url: URL): { skip: number; limit: number } {
  return {
    skip: Number(url.searchParams.get('skip') ?? 0),
    limit: Number(url.searchParams.get('limit') ?? 30),
  };
}

/**
 * Default happy-path handlers. Individual tests narrow behaviour with
 * `server.use(...)` rather than redefining the whole surface.
 */
export const handlers = [
  http.get(`${API_BASE_URL}/users/search`, ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get('q') ?? '').toLowerCase();
    const { skip, limit } = readPaging(url);

    // "First7" style names mean a query maps to a predictable subset.
    const matchingTotal = query.length === 0 ? MOCK_TOTAL_USERS : query === 'first1' ? 1 : 0;
    return HttpResponse.json(makeUsersPage({ total: matchingTotal, skip, limit }));
  }),

  http.get(`${API_BASE_URL}/users/:id`, ({ params }) => {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id < 1 || id > MOCK_TOTAL_USERS) {
      return HttpResponse.json({ message: `User with id '${params.id}' not found` }, { status: 404 });
    }
    return HttpResponse.json(makeUserDetail(id));
  }),

  http.get(`${API_BASE_URL}/users`, ({ request }) => {
    const { skip, limit } = readPaging(new URL(request.url));
    return HttpResponse.json(makeUsersPage({ total: MOCK_TOTAL_USERS, skip, limit }));
  }),
];
