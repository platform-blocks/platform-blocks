import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';
import unusedImports from 'eslint-plugin-unused-imports';

/**
 * Lint config for @plocks/ui.
 *
 * Errors fail `npm run lint`; `npm run lint:check` (CI) also fails on any
 * warning. The component/hook rules below guard the conventions the library
 * was refactored onto — each message names the replacement.
 */

// Internal barrels (index.ts files that re-export a whole area). Component and
// hook modules import from the defining module instead: a barrel import pulls
// in, and can create import cycles through, everything the barrel re-exports.
// Matched as exact specifiers (not globs) so '../../core/theme/ThemeProvider'
// stays allowed while '../../core/theme' is not. Only 2+ levels up are listed:
// one level up ('../hooks', '../index') can be a component's own folder.
const INTERNAL_BARRELS = [
  'core',
  'core/theme',
  'core/utils',
  'core/providers',
  'core/accessibility',
  'components',
  'hooks',
];
const UP_LEVELS = ['../../', '../../../', '../../../../'];
const BARREL_IMPORT_MESSAGE =
  'Import from the defining module, not an internal barrel (index.ts re-exports).';
const BANNED_BARREL_IMPORTS = [
  ...UP_LEVELS.flatMap((up) => [
    ...INTERNAL_BARRELS.flatMap((barrel) => [`${up}${barrel}`, `${up}${barrel}/index`]),
    `${up}index`,
    up.slice(0, -1),
  ]),
  // The package's own public entry (tsconfig maps it to src/index.ts).
  '@plocks/ui',
  'plocks',
].map((name) => ({ name, message: BARREL_IMPORT_MESSAGE }));

// Rules for all library code. react-native-web 0.21 drops `accessibilityState` /
// `accessibilityValue` (web screen readers never hear checked/selected/expanded/
// busy or slider values), and only implements `box-none` / `box-only` for styles
// compiled by StyleSheet.create — inline, the view captures every pointer event.
const A11Y_SYNTAX_RULES = [
  {
    selector:
      "Property[key.name='pointerEvents'][value.value=/^box-(none|only)$/]:not(CallExpression[callee.object.name='StyleSheet'][callee.property.name='create'] Property)",
    message:
      "Inline `pointerEvents: 'box-none' | 'box-only'` is ignored by react-native-web (the view then blocks the pointer); use pointerEventsStyles from core/platform/pointerEvents.",
  },
  {
    selector:
      "Property[key.name='pointerEvents'] > TSAsExpression > Literal[value=/^box-(none|only)$/]",
    message:
      "Inline `pointerEvents: 'box-none' | 'box-only'` is ignored by react-native-web (the view then blocks the pointer); use pointerEventsStyles from core/platform/pointerEvents.",
  },
  {
    selector: "JSXAttribute[name.name='accessibilityState']",
    message:
      'accessibilityState is ignored by react-native-web; use aria-* props (aria-checked, aria-selected, aria-expanded, aria-disabled, aria-busy) or a11yProps() instead.',
  },
  {
    selector: "JSXAttribute[name.name='accessibilityValue']",
    message:
      'accessibilityValue is ignored by react-native-web; use aria-valuemin/aria-valuemax/aria-valuenow/aria-valuetext or a11yProps({ value }) instead.',
  },
];

// Conventions for component and hook code (see core/theme/tokens.ts,
// core/platform, core/responsive).
const COMPONENT_SYNTAX_RULES = [
  ...A11Y_SYNTAX_RULES,
  {
    selector: "MemberExpression[object.property.name='colors'][property.name=/^(gray|surface)$/]",
    message:
      'Raw palette steps break in dark mode and custom themes; use the semantic roles (theme.text.*, theme.backgrounds.*, surfaces via resolveSurface, theme.states.*).',
  },
  {
    selector: "UnaryExpression[operator='typeof'][argument.type='Identifier'][argument.name='window']",
    message: 'React Native defines a global `window` too; use `hasDOM` / `isWeb` from core/platform.',
  },
  {
    selector: "MemberExpression[object.name='Platform'][property.name='OS']",
    message: 'Use the isWeb / isNative / isIOS / isAndroid flags from core/platform.',
  },
];

const DEMO_FILES = ['src/**/demos/**/*.{ts,tsx,js,jsx}', 'src/**/__examples__/**/*.{ts,tsx,js,jsx}'];
const TEST_FILES = [
  'src/**/__tests__/**/*.{ts,tsx,js,jsx}',
  'src/**/__web_tests__/**/*.{ts,tsx,js,jsx}',
  'src/**/*.test.{ts,tsx,js,jsx}',
  'src/__test-utils__/**/*.{ts,tsx,js,jsx}',
];

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'lib/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      '__mocks__/**',
      'tests/**',
      'coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        __DEV__: 'readonly',
        console: 'readonly',
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React: the plugin's recommended set, minus rules that don't apply to
      // this codebase (see below).
      ...react.configs.flat.recommended.rules,
      // TypeScript types replace prop-types.
      'react/prop-types': 'off',
      // Components are built through factory()/forwardRef/memo wrappers that
      // set displayName themselves where it matters.
      'react/display-name': 'off',
      // New JSX transform (react-jsx): React needn't be in scope.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Apostrophes/quotes in JSX text are harmless in React Native <Text>.
      'react/no-unescaped-entities': 'off',

      // Hooks. Callback props used from effects go through useLatestCallback
      // (core/hooks) rather than being listed as dependencies.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // React Native: correctness rules on; purely stylistic ones
      // (no-inline-styles, no-color-literals, sort-styles,
      // no-single-element-style-arrays) stay off.
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'error',
      // Library components (Button, Badge, ...) legitimately take string
      // children and wrap them in <Text> themselves, so this rule can't tell
      // them from a real raw-text bug without a per-component allowlist. It
      // also crashes on template literals in eslint-plugin-react-native 5.0.
      'react-native/no-raw-text': 'off',
      'react-native/no-inline-styles': 'off',
      'react-native/no-color-literals': 'off',
      'react-native/sort-styles': 'off',
      'react-native/no-single-element-style-arrays': 'off',

      // Use the dev-only helpers in src/core/utils/logger.ts instead, so
      // production apps don't get library log spam.
      'no-console': 'error',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-types': 'off',

      // Unused imports/variables rules
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': [
        'off',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',

      // Code style rules
      'no-trailing-spaces': 'off',
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: true,
        },
      ],

      // Additional code quality rules
      'prefer-const': 'off',
      semi: ['off', 'always'],
      indent: ['off', 2, { SwitchCase: 1 }],
      'object-curly-spacing': ['off', 'always'],
      'array-bracket-spacing': ['off', 'never'],
      'key-spacing': ['off', { beforeColon: false, afterColon: true }],
      'comma-spacing': ['off', { before: false, after: true }],
      'no-multiple-empty-lines': ['off', { max: 1, maxEOF: 0 }],

      'no-var': 'off',
      'no-prototype-builtins': 'off',
      'no-useless-escape': 'off',

      'no-restricted-syntax': ['error', ...A11Y_SYNTAX_RULES],
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx,js,jsx}', 'src/hooks/**/*.{ts,tsx,js,jsx}'],
    ignores: [...DEMO_FILES, ...TEST_FILES],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            ...BANNED_BARREL_IMPORTS,
            {
              name: 'react-native',
              importNames: ['useWindowDimensions'],
              message: 'Use useViewport() / useBreakpoint() from core/responsive (one hydration-safe store).',
            },
            {
              name: 'react-native',
              importNames: ['Animated'],
              message: 'Animate with react-native-reanimated (UI thread), not the JS-driven Animated API.',
            },
          ],
        },
      ],
      'no-restricted-syntax': ['error', ...COMPONENT_SYNTAX_RULES],
    },
  },
  {
    // Demos are documentation: logging a callback's argument is the point.
    files: DEMO_FILES,
    rules: {
      'no-console': 'off',
    },
  },
  {
    // Tests may log, and routinely cast through `any` to reach internals.
    files: TEST_FILES,
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-syntax': 'off',
    },
  }
);
