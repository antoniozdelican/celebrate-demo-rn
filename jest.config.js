/**
 * Packages that ship ESM-only builds. Jest does not transform node_modules by
 * default, so MSW and its transitive deps must be opted back in explicitly.
 */
const esmPackages = [
  '(jest-)?react-native',
  '@react-native(-community)?',
  'expo(nent)?',
  '@expo(nent)?/.*',
  'react-navigation',
  '@react-navigation/.*',
  'react-native-reanimated',
  'react-native-worklets',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-screens',
  'msw',
  '@mswjs/.*',
  '@open-draft/.*',
  '@bundled-es-modules/.*',
  'rettime',
  'until-async',
  'headers-polyfill',
  'strict-event-emitter',
  'outvariant',
  'is-node-process',
];

const expoPreset = require('jest-expo/jest-preset');

/**
 * jest-expo only transforms `.js/.jsx/.ts/.tsx`. Some ESM-only deps in MSW's
 * tree (rettime) ship `.mjs` exclusively with no CommonJS fallback, so they
 * need the same Babel transform wired up for that extension.
 */
const babelTransform = expoPreset.transform['\\.[jt]sx?$'];

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transform: {
    ...expoPreset.transform,
    '^.+\\.mjs$': babelTransform,
  },
  // Detox drives the app from e2e/ with its own runner and config.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Prefix match, not whole-segment: `expo(nent)?` has to cover expo-modules-core
  // and friends, which a trailing slash would exclude.
  transformIgnorePatterns: [`node_modules/(?!(${esmPackages.join('|')}))`],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/test/**', '!src/lib/testIDs.ts'],
};
