import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { readFileSync } from 'node:fs';

const ui = JSON.parse(readFileSync('../ui/package.json', 'utf8'));
const externals = [...Object.keys(ui.peerDependencies), '@plocks/ui', 'react/jsx-runtime'];
const external = (id) => externals.some(name => id === name || id.startsWith(`${name}/`));

export default {
  input: 'src/index.ts',
  external,
  output: { file: 'lib/index.js', format: 'esm', inlineDynamicImports: true, sourcemap: false },
  plugins: [
    resolve({ preferBuiltins: false, browser: true, extensions: ['.tsx', '.ts', '.js', '.json'] }),
    commonjs({ include: ['node_modules/**'] }),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      jsx: 'react-jsx',
      rootDir: '../',
      outDir: './lib',
    }),
  ],
};
