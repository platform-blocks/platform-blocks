const path = require('path');

// Web DOM tests (react-native-web in jsdom); see packages/ui/jest.web.config.cjs.
module.exports = {
  displayName: 'web',
  rootDir: __dirname,
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/__web_tests__/**/*.web.test.(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/'],
  moduleFileExtensions: ['web.tsx', 'web.ts', 'web.js', 'tsx', 'ts', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '\\.svg$': path.join(__dirname, '../ui/__mocks__/svgMock.js'),
    '^@plocks/ui$': path.join(__dirname, '../ui/src/index.ts'),
    '^@plocks/ui/test-utils$': path.join(__dirname, '../ui/src/__test-utils__/index.ts'),
    '^@plocks/code$': path.join(__dirname, 'src/index.ts'),
    '^@plocks/brands$': path.join(__dirname, '../brands/src/index.ts'),
    '^@plocks/carousel$': path.join(__dirname, '../carousel/src/index.ts'),
    '^@plocks/dates$': path.join(__dirname, '../dates/src/index.ts'),
    '^@plocks/media$': path.join(__dirname, '../media/src/index.ts'),
    '^@plocks/qrcode$': path.join(__dirname, '../qrcode/src/index.ts'),
    '^@plocks/spotlight$': path.join(__dirname, '../spotlight/src/index.ts'),
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs|cjs)$': [
      'babel-jest',
      { configFile: path.join(__dirname, 'babel.config.test.cjs'), plugins: ['react-native-worklets/plugin'] },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-native|@react-native|react-native-web|expo|@expo|react-native-svg|@plocks|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-safe-area-context|@tabler)/)',
  ],
  setupFilesAfterEnv: [path.join(__dirname, '../ui/jest.web.setup.cjs')],
  globals: { __DEV__: true },
};
