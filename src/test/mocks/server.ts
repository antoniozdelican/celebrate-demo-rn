import { setupServer } from 'msw/native';

import { handlers } from '@/test/mocks/handlers';

/**
 * `msw/native`, not `msw/node`.
 *
 * MSW's package exports explicitly map `./node` to null under the
 * `react-native` condition that jest-expo resolves with, so importing it fails
 * to resolve. The native entry provides the same setupServer API backed by a
 * fetch interceptor rather than Node's http module.
 */
export const server = setupServer(...handlers);
