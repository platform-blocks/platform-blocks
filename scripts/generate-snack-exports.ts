#!/usr/bin/env tsx
/**
 * Extracts the export names from packages/ui-snack/src/index.ts — and from the
 * barrels of the other workspace packages (charts, dates, …), which Snacks
 * consume whole — into apps/docs/data/generated/snack-exports.json.
 *
 * The docs site uses those lists to decide which demos get an "Open in Snack"
 * button: a demo can only run in a Snack if every identifier it imports from
 * a workspace package is present in the entry that Snack installs. Generating
 * the lists keeps the two sides from drifting when either barrel changes.
 */

import fs from 'fs';
import path from 'path';

import { UI_PACKAGE, listWorkspacePackages } from './lib/packages';

const ROOT = path.resolve(__dirname, '..');
const SNACK_ENTRY = path.join(ROOT, 'packages', 'ui-snack', 'src', 'index.ts');
const OUTPUT = path.join(
  ROOT,
  'apps', 'docs',
  'data',
  'generated',
  'snack-exports.json'
);

function parseExportNames(source: string): string[] {
  const names = new Set<string>();
  // Matches: export { A, B as C, type D } from './x';
  const blockRe = /export\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"]\s*;?/g;

  let match: RegExpExecArray | null;
  while ((match = blockRe.exec(source)) !== null) {
    for (const raw of match[1].split(',')) {
      const entry = raw.trim();
      if (!entry || entry.startsWith('type ')) continue; // types don't exist at runtime
      // "A as B" is exported under B
      const exported = entry.includes(' as ') ? entry.split(' as ')[1] : entry;
      const name = exported.trim();
      if (name) names.add(name);
    }
  }

  return [...names].sort();
}

const source = fs.readFileSync(SNACK_ENTRY, 'utf8');
const exports = parseExportNames(source);

if (exports.length === 0) {
  console.error('generate-snack-exports: no exports parsed from', SNACK_ENTRY);
  process.exit(1);
}

const workspacePackages = listWorkspacePackages(ROOT);
const ui = workspacePackages.find(pkg => pkg.name === UI_PACKAGE);
if (!ui) {
  console.error('generate-snack-exports: no', UI_PACKAGE, 'package under packages/');
  process.exit(1);
}
const snackManifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'packages', 'ui-snack', 'package.json'), 'utf8'));
if (snackManifest.version !== ui.version) {
  throw new Error(`@plocks/ui-snack ${snackManifest.version} must match ${UI_PACKAGE} ${ui.version}`);
}

// The other packages' barrels are small enough for Snackager as-is, so Snacks
// install each package whole rather than a trimmed entry. `export * from
// './utils'` and friends are not followed: demos import components, which the
// barrels name explicitly, and a name this misses only costs that demo a button.
const packages: Record<string, { version: string; entry: string; exports: string[] }> = {};
for (const pkg of workspacePackages) {
  if (pkg === ui) continue;
  const packageExports = parseExportNames(fs.readFileSync(pkg.entry, 'utf8'));
  if (packageExports.length === 0) {
    console.error('generate-snack-exports: no exports parsed from', pkg.entry);
    process.exit(1);
  }
  packages[pkg.name] = { version: pkg.version, entry: pkg.name, exports: packageExports };
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(
  OUTPUT,
  `${JSON.stringify(
    {
      version: snackManifest.version,
      entry: '@plocks/ui-snack',
      exports,
      packages,
    },
    null,
    2
  )}\n`
);

console.log(
  `generate-snack-exports: wrote ${exports.length} ui exports (v${ui.version}) + ` +
  Object.entries(packages).map(([name, pkg]) => `${pkg.exports.length} ${name} (v${pkg.version})`).join(', ') +
  ` -> ${path.relative(ROOT, OUTPUT)}`
);
