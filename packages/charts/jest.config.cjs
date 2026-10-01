const rnPreset = require('@react-native/jest-preset');

module.exports = {
  ...rnPreset,
  rootDir: __dirname,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/**/*.test.(ts|tsx|js)', '<rootDir>/**/*.spec.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/__web_tests__/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
  },
  transformIgnorePatterns: [
    // pnpm stores packages under node_modules/.pnpm/<virtual>/node_modules/<pkg>/,
    // so the allowlist must optionally skip that prefix (mirrors packages/ui).
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-native|@react-native|react-native-svg|@plocks|react-native-reanimated|react-native-gesture-handler|react-native-worklets|@testing-library)/)',
  ],
  setupFiles: rnPreset.setupFiles,
  setupFilesAfterEnv: [...(rnPreset.setupFilesAfterEnv || []), '<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    ...rnPreset.moduleNameMapper,
    '\\.(png|jpg|jpeg)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
    'ViewConfigIgnore(?:\\.js)?$': '<rootDir>/__mocks__/ViewConfigIgnore.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.{spec,test}.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
};
