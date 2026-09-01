import { server } from '@/test/mocks/server';

// RNTL v12.4+ registers its jest matchers automatically, so no extend-expect
// import is needed.

// `error` so an unhandled request fails the test loudly instead of silently
// hitting the real network.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
