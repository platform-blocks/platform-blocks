import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
];

const commonConfig = {
  external,
  plugins: [
    peerDepsExternal(),
    resolve({
      preferBuiltins: false,
      browser: true,
      // Prefer .web.ts extensions for web build (React Native convention)
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    json(),
  ],
};

// The main entry preserves the source module graph so consumers can deep-import
// a single component (`@platform-blocks/ui/Button`) and pull only its subtree.
// Metro does almost no tree-shaking, so a single 2 MB bundle would otherwise
// land in every app that imports one button.
const preserved = { preserveModules: true, preserveModulesRoot: 'src' };

// Rollup flattens pure re-export barrels, so each component's `index.ts` has to
// be an entry point of its own for `lib/**/<Component>/index.js` to exist for
// the subpath exports to point at. Shared modules are still emitted once.
const componentEntries = readdirSync('src/components', { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .map((entry) => join('src/components', entry.name, 'index.ts'))
  .filter((entryPath) => existsSync(entryPath));

const mainInputs = ['src/index.ts', ...componentEntries];

// `snack` is the trimmed surface consumed by @platform-blocks/ui/snack — it
// stays a single file because Snack loads it directly. See src/snack.ts.
const entries = [
  { input: mainInputs, esmDir: './lib/esm', cjsDir: './lib/cjs' },
  { input: 'src/snack.ts', esm: './lib/esm/snack.js', cjs: './lib/cjs/snack.js' },
];

export default entries.flatMap(({ input, esm, cjs, esmDir, cjsDir }) => [
  // ESM build
  {
    ...commonConfig,
    input,
    output: {
      ...(esmDir ? { dir: esmDir, ...preserved } : { file: esm, inlineDynamicImports: true }),
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      ...commonConfig.plugins,
      typescript({
        tsconfig: './tsconfig.esm.json',
        declaration: false,
        declarationMap: false,
        jsx: 'react-jsx',
        outDir: './lib/esm',
        rootDir: './src',
      }),
    ],
  },
  // CJS build
  {
    ...commonConfig,
    input,
    output: {
      ...(cjsDir ? { dir: cjsDir, ...preserved } : { file: cjs, inlineDynamicImports: true }),
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    plugins: [
      ...commonConfig.plugins,
      typescript({
        tsconfig: './tsconfig.cjs.json',
        declaration: false,
        declarationMap: false,
        jsx: 'react-jsx',
        outDir: './lib/cjs',
        rootDir: './src',
      }),
    ],
  },
]);
