module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx|js)',
    '**/*.test.(ts|tsx|js)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/dist/',
    // react-native-web DOM tests run under jest.web.config.cjs (npm run test:web).
    '/__web_tests__/',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.test.cjs' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-native|@react-native|expo|@expo|react-native-svg|@plocks|react-native-reanimated|react-native-worklets|react-native-gesture-handler|@react-navigation)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__web_tests__/**',
    '!src/**/__mocks__/**',
    '!src/__test-utils__/**',
  ],
  // A ratchet, not a target: the measured coverage rounded down. CI
  // (`npm run test:ci`) fails if coverage drops below it; when coverage goes
  // up, raise these to the new floor in the same change.
  coverageThreshold: {
    global: {
      branches: 58,
      functions: 63,
      lines: 69,
      statements: 66,
    },
  },
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
};
