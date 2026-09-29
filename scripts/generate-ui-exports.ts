/**
 * Generates the per-component subpath `exports` map for @platform-blocks/ui.
 *
 * The build preserves the source module graph (see packages/ui/rollup.config.js),
 * so `@platform-blocks/ui/Button` can pull just that component's subtree instead
 * of the whole barrel — which matters because Metro does virtually no
 * tree-shaking of its own.
 *
 *   npm run ui:exports          rewrite packages/ui/package.json
 *   npm run ui:exports:check    fail if the committed map is stale (CI / release)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const UI_ROOT = join(process.cwd(), 'packages', 'ui');
const PACKAGE_JSON = join(UI_ROOT, 'package.json');
const COMPONENTS_DIR = join(UI_ROOT, 'src', 'components');

type ExportEntry = Record<string, string | Record<string, string>>;

/** Entries that are hand-maintained and always lead the map, in this order. */
const BASE_EXPORTS = ['.', './snack', './package.json'] as const;

/** Directories under src/components that are not public components. */
const isPublicComponentDir = (name: string) => !name.startsWith('_') && !name.startsWith('.');

function findComponents(): string[] {
  if (!existsSync(COMPONENTS_DIR)) {
    throw new Error(`Components directory not found: ${COMPONENTS_DIR}`);
  }

  return readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isPublicComponentDir(entry.name))
    .filter((entry) => existsSync(join(COMPONENTS_DIR, entry.name, 'index.ts')))
    .map((entry) => entry.name)
    .sort();
}

/**
 * Condition order matters: `react-native` before `import`/`require` so Metro
 * (and TS with `customConditions: ["react-native"]`, as Expo sets) picks the
 * ESM build, `default` last. Each branch carries the `types` that sit beside
 * its JavaScript: lib/esm declarations are ES-module declarations with
 * fully-specified imports, lib/cjs ones are CommonJS declarations (see
 * packages/ui/scripts/emit-types.mjs), so both `moduleResolution: bundler`
 * and `node16`/`nodenext` get real types.
 */
function componentExport(name: string): ExportEntry {
  const esm = { types: `./lib/esm/components/${name}/index.d.ts`, default: `./lib/esm/components/${name}/index.js` };
  const cjs = { types: `./lib/cjs/components/${name}/index.d.ts`, default: `./lib/cjs/components/${name}/index.js` };
  return {
    'react-native': esm,
    import: esm,
    require: cjs,
    default: esm.default,
  };
}

function buildExports(existing: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};

  for (const key of BASE_EXPORTS) {
    if (existing[key] !== undefined) next[key] = existing[key];
  }

  for (const name of findComponents()) {
    next[`./${name}`] = componentExport(name);
  }

  return next;
}

function main() {
  const check = process.argv.includes('--check');

  const raw = readFileSync(PACKAGE_JSON, 'utf8');
  const pkg = JSON.parse(raw);

  if (!pkg.exports) {
    throw new Error('packages/ui/package.json has no "exports" field to extend');
  }

  const nextExports = buildExports(pkg.exports);
  const componentCount = Object.keys(nextExports).length - BASE_EXPORTS.length;

  if (JSON.stringify(pkg.exports) === JSON.stringify(nextExports)) {
    console.log(`✅ exports map is up to date (${componentCount} components)`);
    return;
  }

  if (check) {
    console.error(
      '❌ packages/ui/package.json "exports" is stale — run `npm run ui:exports` and commit the result.',
    );
    process.exit(1);
  }

  pkg.exports = nextExports;
  writeFileSync(PACKAGE_JSON, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  console.log(`✅ wrote ${componentCount} component subpath exports to packages/ui/package.json`);
}

main();
