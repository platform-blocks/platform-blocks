/**
 * Places the declaration files tsc emitted into lib/.types next to both builds:
 *
 *   lib/cjs/**\/*.d.ts  as emitted. lib/cjs/package.json ({"type":"commonjs"},
 *                      written by the rollup build) makes TypeScript read them
 *                      as CommonJS declarations, where extensionless relative
 *                      specifiers ('./Button') resolve.
 *   lib/esm/**\/*.d.ts  with every relative specifier made fully specified
 *                      ('./Button' -> './Button/index.js'). The package is
 *                      "type": "module", so these are ES module declarations,
 *                      and under moduleResolution node16/nodenext an
 *                      extensionless specifier there doesn't resolve — every
 *                      re-exported type silently becomes `any`.
 *
 * Each package.json "exports" condition points its "types" at the declaration
 * file beside the JavaScript it resolves to.
 *
 *   node scripts/emit-types.mjs   (run by `npm run build:types`)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const typesDir = join(root, 'lib', '.types');
const esmDir = join(root, 'lib', 'esm');
const cjsDir = join(root, 'lib', 'cjs');

if (!existsSync(typesDir)) {
  console.error(`emit-types: ${relative(root, typesDir)} not found — run tsc first (npm run build:types).`);
  process.exit(1);
}
if (!existsSync(join(cjsDir, 'package.json'))) {
  console.error('emit-types: lib/cjs/package.json not found — run the rollup build first (npm run build).');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

// A relative module specifier following `from`, `import(` or a bare `import`.
const RELATIVE_SPECIFIER = /(?<=\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.\.?(?:\/[^'"]*)?)\1/g;

function fullySpecify(specifier, fromFile) {
  if (/\.(c|m)?js$/.test(specifier)) return specifier;
  const base = resolve(dirname(fromFile), specifier);
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`;
  if (existsSync(join(base, 'index.d.ts'))) return `${specifier.replace(/\/$/, '')}/index.js`;
  throw new Error(
    `emit-types: can't resolve '${specifier}' in ${relative(root, fromFile)} to a declaration file`
  );
}

const files = walk(typesDir).filter((file) => file.endsWith('.d.ts'));
for (const file of files) {
  const rel = relative(typesDir, file);
  const source = readFileSync(file, 'utf8');
  const esmSource = source.replace(RELATIVE_SPECIFIER, (_match, quote, specifier) =>
    `${quote}${fullySpecify(specifier, file)}${quote}`
  );

  for (const [outDir, content] of [
    [cjsDir, source],
    [esmDir, esmSource],
  ]) {
    const out = join(outDir, rel);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, content);
  }
}

rmSync(typesDir, { recursive: true, force: true });
console.log(`emit-types: wrote ${files.length} declaration files to lib/esm and lib/cjs`);
