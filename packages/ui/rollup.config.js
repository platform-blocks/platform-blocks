import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import MagicString from 'magic-string';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, posix, relative, sep } from 'path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

const externalPackages = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
];

// Subpaths of an external package are external too.
const external = (id) =>
  externalPackages.some((name) => id === name || id.startsWith(`${name}/`));

// ---------------------------------------------------------------------------
// Platform-specific files (foo.web.tsx, foo.native.ts, foo.ios.ts, foo.android.ts)
//
// These are resolved by the *consumer's* bundler — Metro for native, webpack /
// Vite / Metro-web with react-native-web for web — never here. resolve() below
// lists no platform extensions, so `./foo` always binds to foo.tsx at build
// time and web code can't leak into the native output (or vice versa). For the
// consumer's bundler to swap a variant in, the output has to:
//
//  1. contain every variant as its own module. Rollup only emits modules
//     reachable from an entry and nothing imports `foo.web.tsx` by name, so
//     each variant is added as an entry of the preserved build below;
//  2. import a module that has variants by an extensionless specifier
//     (`./foo`, not `./foo.js`): bundlers try platform extensions only when
//     the specifier has none. platformImports() rewrites those imports.
//     (Plain Node ESM can't resolve such a specifier; platform-split modules
//     are for bundlers, which is where platform variants mean anything.)
//
// Verified with a fixture (foo.ts + foo.web.ts imported as './foo'): both
// builds emit foo.js and foo.web.js, and importers reference './foo'.
//
// The separate @plocks/ui-snack build inlines the base implementation of
// platform-split modules. Its entry must remain usable on Expo Snack.
// ---------------------------------------------------------------------------
const PLATFORM_FILE = /\.(web|native|ios|android)\.(tsx?|jsx?)$/;
const SKIP_DIRS = new Set(['__tests__', '__web_tests__', '__mocks__', '__test-utils__', 'demos', '__examples__']);

const findPlatformFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : findPlatformFiles(path);
    return PLATFORM_FILE.test(entry.name) && !entry.name.endsWith('.d.ts') ? [path] : [];
  });

const platformFiles = findPlatformFiles('src');

/** Output paths (relative to the build dir, no extension) of modules that have platform variants. */
const platformSplitModules = new Set(
  platformFiles.map((file) => relative('src', file).split(sep).join('/').replace(PLATFORM_FILE, ''))
);

function platformImports() {
  const RELATIVE_JS_SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*)(['"])(\.{1,2}\/[^'"]+?)\.js\2/g;
  return {
    name: 'platform-imports',
    renderChunk(code, chunk) {
      if (platformSplitModules.size === 0) return null;
      const fromDir = posix.dirname(chunk.fileName);
      const magic = new MagicString(code);
      let changed = false;
      for (const match of code.matchAll(RELATIVE_JS_SPECIFIER)) {
        const [, lead, quote, specifier] = match;
        const target = posix.normalize(posix.join(fromDir, specifier));
        if (!platformSplitModules.has(target)) continue;
        const start = match.index + lead.length;
        magic.overwrite(start, start + match[0].length - lead.length, `${quote}${specifier}${quote}`);
        changed = true;
      }
      return changed ? { code: magic.toString(), map: magic.generateMap({ hires: true }) } : null;
    },
  };
}

const commonConfig = {
  external,
  plugins: [
    peerDepsExternal(),
    resolve({
      preferBuiltins: false,
      browser: true,
      // No `.web.*` / `.native.*` here — see "Platform-specific files" above.
      extensions: ['.tsx', '.ts', '.js', '.json'],
    }),
    commonjs({
      include: ['node_modules/**'],
    }),
    json(),
  ],
};

// The main entry preserves the source module graph so consumers can deep-import
// a single component (`@plocks/ui/Button`) and pull only its subtree.
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

const mainInputs = ['src/index.ts', ...componentEntries, ...platformFiles];

// No source maps. Maps that embed sourcesContent made up ~63% of the tarball;
// maps without it point at ../../src, which isn't published, and a
// `//# sourceMappingURL` comment whose .map file isn't shipped makes
// source-map-loader (webpack, CRA, Next) warn on every file.
const sourcemapOptions = { sourcemap: false };

export default {
  ...commonConfig,
  input: mainInputs,
  output: {
    dir: './lib/esm',
    ...preserved,
    format: 'esm',
    ...sourcemapOptions,
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
    platformImports(),
  ],
};
