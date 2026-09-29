/**
 * Web DOM tests: components rendered through react-native-web into jsdom, so
 * assertions see the real DOM a browser gets (roles, accessible names, ARIA,
 * events) instead of the React Native host tree the default config checks.
 *
 *   npm run test:web
 *
 * Add a test as src/**\/__web_tests__/<Name>.web.test.tsx and use
 * @testing-library/react (render, screen, fireEvent). Platform.OS is 'web' and
 * `.web.*` platform files win over their native siblings, as in a web bundler.
 */
module.exports = {
  displayName: 'web',
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/__web_tests__/**/*.web.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  // Resolve platform files the way webpack/Metro-web do: .web.* first.
  moduleFileExtensions: ['web.tsx', 'web.ts', 'web.js', 'tsx', 'ts', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    // Reanimated runs for real here (the native project mocks it), and on web
    // it needs the worklets Babel plugin to work out useAnimatedStyle deps.
    '^.+\\.(js|jsx|ts|tsx|mjs|cjs)$': [
      'babel-jest',
      { configFile: './babel.config.test.cjs', plugins: ['react-native-worklets/plugin'] },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-native|@react-native|react-native-web|expo|@expo|react-native-svg|@platform-blocks|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-safe-area-context|@tabler)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.web.setup.cjs'],
  globals: {
    __DEV__: true,
  },
};
