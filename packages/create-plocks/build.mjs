/**
 * Bundles the CLI into one file, dist/index.js, so `npm create plocks` has
 * nothing to install before it runs. The template list is read from the docs
 * config (apps/docs/config/templates.ts) at this point.
 *
 * Bundled libraries keep their license notices in dist/THIRD_PARTY_LICENSES.md.
 */
import { build } from 'esbuild';
import { chmodSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
rmSync('dist', { recursive: true, force: true });

const result = await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  minify: true,
  metafile: true,
  legalComments: 'none',
  define: { __VERSION__: JSON.stringify(pkg.version) },
  // Bundled CommonJS code calls require() for Node built-ins.
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire as __createRequire } from 'node:module';\nconst require = __createRequire(import.meta.url);",
  },
});
chmodSync('dist/index.js', 0o755);

/** The package.json directory that owns a bundled input file. */
function packageRootOf(file) {
  let dir = dirname(file);
  while (dir.includes('node_modules')) {
    if (existsSync(join(dir, 'package.json')) && !dir.endsWith('node_modules')) {
      const { name } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
      if (name) return dir;
    }
    dir = dirname(dir);
  }
  return null;
}

const roots = new Set(
  Object.keys(result.metafile.inputs)
    .filter((input) => input.includes('node_modules/'))
    .map(packageRootOf)
    .filter(Boolean)
);
const notices = [...roots].sort().map((root) => {
  const { name, version, license } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const file = readdirSync(root).find((entry) => /^licen[sc]e/i.test(entry));
  const text = file ? readFileSync(join(root, file), 'utf8').trim() : `License: ${license}`;
  return `## ${name}@${version}\n\n${text}\n`;
});
writeFileSync(
  'dist/THIRD_PARTY_LICENSES.md',
  `# Third-party licenses\n\ncreate-plocks bundles the following packages.\n\n${notices.join('\n')}`
);

const size = (readFileSync('dist/index.js').length / 1024).toFixed(0);
console.log(`create-plocks ${pkg.version}: dist/index.js (${size} KB), ${roots.size} bundled packages`);
