const path = require('path');

// Runs on @plocks/ui's jest setup, against @plocks/ui's source (no build needed).
module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)', '**/*.test.(ts|tsx|js)'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/__web_tests__/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { configFile: path.join(__dirname, 'babel.config.test.cjs') }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?(react-native|@react-native|expo|@expo|react-native-svg|@plocks|react-native-reanimated|react-native-worklets|react-native-gesture-handler|@react-navigation)/)',
  ],
  setupFilesAfterEnv: [path.join(__dirname, '../ui/jest.setup.cjs')],
  moduleNameMapper: {
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
  testEnvironment: 'node',
  globals: { __DEV__: true },
};
