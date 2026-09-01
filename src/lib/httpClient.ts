export const API_BASE_URL = 'https://dummyjson.com';

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Errors are modelled as distinct classes rather than status-code checks at
 * call sites, so screens can branch on intent ("not found" vs "offline")
 * without knowing about HTTP.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Retrying a 4xx will not help; a 5xx might. */
  get isRetryable(): boolean {
    return this.status >= 500;
  }
}

export class NetworkError extends Error {
  constructor(readonly url: string, cause?: unknown) {
    super('Network request failed');
    this.name = 'NetworkError';
    this.cause = cause;
  }

  get isRetryable(): boolean {
    return true;
  }
}

export class TimeoutError extends Error {
  constructor(readonly url: string) {
    super('Request timed out');
    this.name = 'TimeoutError';
  }

  get isRetryable(): boolean {
    return true;
  }
}

export function isRetryableError(error: unknown): boolean {
  return (
    error instanceof ApiError || error instanceof NetworkError || error instanceof TimeoutError
      ? error.isRetryable
      : false
  );
}

type QueryValue = string | number | boolean | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path, API_BASE_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

export type GetOptions = {
  query?: Record<string, QueryValue>;
  /** Forwarded by React Query so cancelled queries abort in flight. */
  signal?: AbortSignal;
  timeoutMs?: number;
};

/**
 * Merges several abort signals into one.
 *
 * `AbortSignal.any` is not usable here: React Native replaces the global
 * `AbortSignal` with the `abort-controller` ponyfill, which does not implement
 * it. Relying on it would typecheck and pass under Node in Jest, then throw on
 * device — so the composition is done by hand.
 */
function composeAbortSignals(signals: readonly AbortSignal[]): {
  signal: AbortSignal;
  release: () => void;
} {
  const controller = new AbortController();
  const abort = () => controller.abort();

  for (const signal of signals) {
    if (signal.aborted) {
      abort();
      break;
    }
    signal.addEventListener('abort', abort);
  }

  return {
    signal: controller.signal,
    release: () => {
      for (const signal of signals) signal.removeEventListener('abort', abort);
    },
  };
}

export async function apiGet<T>(path: string, options: GetOptions = {}): Promise<T> {
  const { query, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const url = buildUrl(path, query);

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), timeoutMs);
  const composed = composeAbortSignals(
    signal ? [signal, timeoutController.signal] : [timeoutController.signal],
  );

  let response: Response;
  try {
    response = await fetch(url, {
      signal: composed.signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    // A caller-initiated cancellation must propagate untouched so React Query
    // can tell it apart from a genuine failure.
    if (signal?.aborted) throw error;
    if (timeoutController.signal.aborted) throw new TimeoutError(url);
    throw new NetworkError(url, error);
  } finally {
    clearTimeout(timer);
    composed.release();
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status, url);
  }

  return (await response.json()) as T;
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message?: unknown };
      if (typeof message === 'string' && message.length > 0) return message;
    }
  } catch {
    // Body was not JSON; fall through to the generic message.
  }
  return `Request failed with status ${response.status}`;
}
