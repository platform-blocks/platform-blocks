/**
 * Places the declaration files tsc emitted into lib/.types next to the build:
 *
 *   lib/esm/**\/*.d.ts  with every relative specifier made fully specified
 *                      ('./Button' -> './Button/index.js'). The package is
 *                      "type": "module", so these are ES module declarations,
 *                      and under moduleResolution node16/nodenext an
 *                      extensionless specifier there doesn't resolve — every
 *                      re-exported type silently becomes `any`.
 *
 * Packages still publishing CJS get a second, extensionless declaration tree
 * beside lib/cjs. The ESM-only UI package gets only lib/esm declarations.
 *
 *   node scripts/emit-types.mjs [packageRoot]   (run by `npm run build:types`;
 *   the split @plocks packages pass their own root)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(dirname(fileURLToPath(import.meta.url)), '..');
const typesDir = join(root, 'lib', '.types');
const esmDir = join(root, 'lib', 'esm');
const cjsDir = join(root, 'lib', 'cjs');
const hasCjs = existsSync(join(cjsDir, 'package.json'));

if (!existsSync(typesDir)) {
  console.error(`emit-types: ${relative(root, typesDir)} not found — run tsc first (npm run build:types).`);
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

  const out = join(esmDir, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, esmSource);
  if (hasCjs) {
    const cjsOut = join(cjsDir, rel);
    mkdirSync(dirname(cjsOut), { recursive: true });
    writeFileSync(cjsOut, source);
  }
}

rmSync(typesDir, { recursive: true, force: true });
console.log(`emit-types: wrote ${files.length} declaration files to lib/esm${hasCjs ? ' and lib/cjs' : ''}`);
