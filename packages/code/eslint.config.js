import uiConfig from '../ui/eslint.config.js';

// @plocks/ui's rules. Unlike ui, this package imports @plocks/ui by name —
// it is its only way in — so the barrel-import ban is replaced for components.
export default [
  ...uiConfig,
  {
    files: ['src/components/**/*.{ts,tsx,js,jsx}'],
    ignores: ['src/**/demos/**', 'src/**/__tests__/**', 'src/**/__web_tests__/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['useWindowDimensions'],
              message: 'Use useViewport() / useBreakpoint() from @plocks/ui (one hydration-safe store).',
            },
            {
              name: 'react-native',
              importNames: ['Animated'],
              message: 'Animate with react-native-reanimated (UI thread), not the JS-driven Animated API.',
            },
          ],
        },
      ],
    },
  },
];
