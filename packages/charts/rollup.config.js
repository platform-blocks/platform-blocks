import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-native-reanimated', // ensure not parsed
];

const commonConfig = {
  input: 'src/index.ts',
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

export default [
  {
    ...commonConfig,
    output: { file: pkg.module, format: 'esm', sourcemap: true },
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
];
