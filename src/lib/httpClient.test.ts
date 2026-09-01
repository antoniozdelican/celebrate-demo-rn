import { HttpResponse, delay, http } from 'msw';

import {
  API_BASE_URL,
  ApiError,
  NetworkError,
  TimeoutError,
  apiGet,
  isRetryableError,
} from '@/lib/httpClient';
import { server } from '@/test/mocks/server';

describe('apiGet', () => {
  it('returns the parsed body on success', async () => {
    server.use(http.get(`${API_BASE_URL}/ping`, () => HttpResponse.json({ ok: true })));

    await expect(apiGet<{ ok: boolean }>('/ping')).resolves.toEqual({ ok: true });
  });

  it('serialises query params and drops undefined ones', async () => {
    let seen = '';
    server.use(
      http.get(`${API_BASE_URL}/ping`, ({ request }) => {
        seen = new URL(request.url).search;
        return HttpResponse.json({});
      }),
    );

    await apiGet('/ping', { query: { limit: 30, skip: 0, q: undefined } });

    expect(seen).toContain('limit=30');
    expect(seen).toContain('skip=0');
    expect(seen).not.toContain('q=');
  });

  it('throws ApiError carrying the status and the server message', async () => {
    server.use(
      http.get(`${API_BASE_URL}/missing`, () =>
        HttpResponse.json({ message: "User with id '99999' not found" }, { status: 404 }),
      ),
    );

    const error = await apiGet('/missing').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, message: "User with id '99999' not found" });
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    server.use(
      http.get(`${API_BASE_URL}/broken`, () => new HttpResponse('<html>502</html>', { status: 502 })),
    );

    const error = (await apiGet('/broken').catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Request failed with status 502');
  });

  it('throws TimeoutError when the response outlives the timeout', async () => {
    server.use(
      http.get(`${API_BASE_URL}/slow`, async () => {
        await delay(200);
        return HttpResponse.json({});
      }),
    );

    const error = await apiGet('/slow', { timeoutMs: 30 }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(TimeoutError);
  });

  it('throws NetworkError when the request cannot be made', async () => {
    server.use(http.get(`${API_BASE_URL}/down`, () => HttpResponse.error()));

    const error = await apiGet('/down').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NetworkError);
  });

  it('propagates a caller cancellation untouched rather than as a failure', async () => {
    server.use(
      http.get(`${API_BASE_URL}/slow`, async () => {
        await delay(200);
        return HttpResponse.json({});
      }),
    );

    const controller = new AbortController();
    const pending = apiGet('/slow', { signal: controller.signal }).catch((e: unknown) => e);
    controller.abort();

    // React Query needs to tell a cancellation apart from a genuine error.
    const error = await pending;
    expect(error).not.toBeInstanceOf(NetworkError);
    expect(error).not.toBeInstanceOf(TimeoutError);
  });
});

describe('isRetryableError', () => {
  it('retries transport failures and 5xx, but not 4xx', () => {
    expect(isRetryableError(new NetworkError('/x'))).toBe(true);
    expect(isRetryableError(new TimeoutError('/x'))).toBe(true);
    expect(isRetryableError(new ApiError('boom', 503, '/x'))).toBe(true);
    expect(isRetryableError(new ApiError('nope', 404, '/x'))).toBe(false);
    expect(isRetryableError(new ApiError('bad', 400, '/x'))).toBe(false);
  });

  it('does not retry errors it does not recognise', () => {
    expect(isRetryableError(new Error('unknown'))).toBe(false);
    expect(isRetryableError(null)).toBe(false);
  });
});
