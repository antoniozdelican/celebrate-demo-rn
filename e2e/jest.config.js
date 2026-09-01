/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts'],
  testTimeout: 180_000,
  // Detox drives one device at a time.
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  // The E2E suite runs in Node, not the RN runtime, so it uses ts-jest rather
  // than the jest-expo transform used by the unit tests.
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', esModuleInterop: true, strict: true } },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
