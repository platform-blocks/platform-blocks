#!/usr/bin/env tsx
/**
 * Extracts the export names from packages/ui/src/snack.ts — and from the
 * charts barrel, which Snacks consume whole — into
 * apps/react-ui-library.com/data/generated/snack-exports.json.
 *
 * The docs site uses those lists to decide which demos get an "Open in Snack"
 * button: a demo can only run in a Snack if every identifier it imports from
 * a workspace package is present in the entry that Snack installs. Generating
 * the lists keeps the two sides from drifting when either barrel changes.
 */

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SNACK_ENTRY = path.join(ROOT, 'packages', 'ui', 'src', 'snack.ts');
const UI_PACKAGE_JSON = path.join(ROOT, 'packages', 'ui', 'package.json');
const CHARTS_ENTRY = path.join(ROOT, 'packages', 'charts', 'src', 'index.ts');
const CHARTS_PACKAGE_JSON = path.join(ROOT, 'packages', 'charts', 'package.json');
const OUTPUT = path.join(
  ROOT,
  'apps',
  'react-ui-library.com',
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

// The charts barrel is small enough for Snackager as-is, so Snacks install the
// package whole rather than a trimmed entry. `export * from './utils'` and
// friends are not followed: chart demos import chart components, which the
// barrel names explicitly, and a name this misses only costs that demo a button.
const chartsExports = parseExportNames(fs.readFileSync(CHARTS_ENTRY, 'utf8'));

if (chartsExports.length === 0) {
  console.error('generate-snack-exports: no exports parsed from', CHARTS_ENTRY);
  process.exit(1);
}

const { version } = JSON.parse(fs.readFileSync(UI_PACKAGE_JSON, 'utf8'));
const { version: chartsVersion } = JSON.parse(fs.readFileSync(CHARTS_PACKAGE_JSON, 'utf8'));

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(
  OUTPUT,
  `${JSON.stringify(
    {
      version,
      entry: '@platform-blocks/react-ui-library/snack',
      exports,
      charts: {
        version: chartsVersion,
        entry: '@platform-blocks/charts',
        exports: chartsExports,
      },
    },
    null,
    2
  )}\n`
);

console.log(
  `generate-snack-exports: wrote ${exports.length} ui + ${chartsExports.length} charts exports ` +
  `(ui v${version}, charts v${chartsVersion}) -> ${path.relative(ROOT, OUTPUT)}`
);
