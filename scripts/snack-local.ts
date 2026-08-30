#!/usr/bin/env tsx
/**
 * Loads a demo into examples/snack-local so it can be run on a real device
 * through Expo Go before anything is published to npm.
 *
 * The app is pinned to Expo SDK 54 (React 19.1.0 / React Native 0.81.5) — the
 * same runtime a Snack gets — and consumes @platform-blocks/react-ui-library as a packed
 * tarball, so the published `exports` map and `files` list are exercised rather
 * than the workspace source. App.tsx and the import rewrite come from
 * apps/react-ui-library.com/utils/snackUrl.ts, so what you test locally is what
 * the "Try in Expo Go" buttons ship.
 *
 * Usage:
 *   npx tsx scripts/snack-local.ts Accordion.basic
 *   npx tsx scripts/snack-local.ts Button              # first demo of the component
 *   npx tsx scripts/snack-local.ts Button --combined   # every demo, as one screen
 *   npx tsx scripts/snack-local.ts --list              # every snack-able demo
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import {
  buildComponentBundle,
  buildDemoBundle,
  isSnackSupported,
} from '../apps/react-ui-library.com/utils/snackUrl';

const ROOT = path.resolve(__dirname, '..');
const GENERATED_DIR = path.join(ROOT, 'apps', 'react-ui-library.com', 'data', 'generated');
const APP_DIR = path.join(ROOT, 'examples', 'snack-local');
const UI_DIR = path.join(ROOT, 'packages', 'ui');
const TARBALL = path.join(APP_DIR, 'platform-blocks-ui.tgz');
const CHARTS_DIR = path.join(ROOT, 'packages', 'charts');
const CHARTS_TARBALL = path.join(APP_DIR, 'platform-blocks-charts.tgz');

interface DemoFile {
  name: string;
  code: string;
}

interface DemoEntry {
  component: string;
  id: string;
  /** Demo slug without the component prefix, e.g. `basic`. */
  slug: string;
  title: string;
  code: string;
  /** Sibling sources of a multi-file demo, excluding the index.tsx entry. */
  siblings: DemoFile[];
}

/** Demo titles live in the index rather than the per-component code shards. */
function loadTitles(): Record<string, string> {
  const indexPath = path.join(GENERATED_DIR, 'demos.json');
  if (!fs.existsSync(indexPath)) return {};
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const titles: Record<string, string> = {};
  for (const demo of index.demos ?? []) {
    if (demo.id && demo.title) titles[demo.id] = demo.title;
  }
  return titles;
}

function loadDemos(): DemoEntry[] {
  const titles = loadTitles();
  const demos: DemoEntry[] = [];
  for (const file of fs.readdirSync(GENERATED_DIR)) {
    if (!file.startsWith('demo-code-')) continue;
    const component = file.replace('demo-code-', '').replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, file), 'utf8'));
    for (const [id, entry] of Object.entries<{ code?: string; files?: DemoFile[] }>(data)) {
      if (!entry.code) continue;
      const siblings = (entry.files ?? []).filter(f => f.name !== 'index.tsx');
      const slug = id.startsWith(`${component}.`) ? id.slice(component.length + 1) : id;
      demos.push({ component, id, slug, title: titles[id] ?? slug, code: entry.code, siblings });
    }
  }
  return demos;
}

/** `files` in the shape buildComponentBundle wants (entry included, or absent). */
function bundleFiles(demo: DemoEntry): DemoFile[] | undefined {
  if (demo.siblings.length === 0) return undefined;
  return [{ name: 'index.tsx', code: demo.code }, ...demo.siblings];
}

/**
 * Files written by the previous run, so a component bundle's `demos/` tree and
 * a single demo's flat files never leak into each other's run.
 */
const MANIFEST = path.join(APP_DIR, '.snack-local-files.json');

function writeAppFiles(files: Record<string, { contents: string }>) {
  const stale = fs.existsSync(MANIFEST)
    ? (JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) as string[])
    : [];
  // `Demo.tsx` predates the manifest, so sweep it (and the bundle tree)
  // unconditionally — a leftover entry from an earlier run would otherwise sit
  // in the app forever.
  for (const name of [...stale, 'Demo.tsx']) {
    fs.rmSync(path.join(APP_DIR, ...name.split('/')), { force: true });
  }
  fs.rmSync(path.join(APP_DIR, 'demos'), { recursive: true, force: true });

  for (const [name, file] of Object.entries(files)) {
    const target = path.join(APP_DIR, ...name.split('/'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, file.contents);
  }

  fs.writeFileSync(MANIFEST, `${JSON.stringify(Object.keys(files), null, 2)}\n`);
}

const siblingNames = (demo: DemoEntry) => demo.siblings.map(f => f.name);
const snackable = (demo: DemoEntry) => isSnackSupported(demo.code, siblingNames(demo));

/** Rebuild lib/ and pack the tarball the app installs from. */
function packPackage(name: string, dir: string, tarball: string) {
  console.log(`Building ${name} …`);
  execFileSync('npm', ['run', 'build'], { cwd: dir, stdio: 'inherit' });

  console.log('Packing tarball …');
  const output = execFileSync('npm', ['pack', '--pack-destination', APP_DIR], {
    cwd: dir,
    encoding: 'utf8',
  });
  const packed = output.trim().split('\n').pop()!.trim();
  fs.renameSync(path.join(APP_DIR, packed), tarball);
  console.log(`  -> ${path.relative(ROOT, tarball)}`);
}

/**
 * Packs the workspace packages the app installs. Charts is only rebuilt for
 * demos that import it — the app depends on both tarballs, so the file has to
 * exist either way, but rebuilding ~950 KB for a Button demo is wasted time.
 */
function packPackages(needsCharts: boolean) {
  packPackage('@platform-blocks/react-ui-library', UI_DIR, TARBALL);
  if (needsCharts || !fs.existsSync(CHARTS_TARBALL)) {
    packPackage('@platform-blocks/charts', CHARTS_DIR, CHARTS_TARBALL);
  }
}

/** Whether any file of a bundle imports the charts package. */
function bundleUsesCharts(files: Record<string, { contents: string }>): boolean {
  return Object.values(files).some(file => file.contents.includes('@platform-blocks/charts'));
}

const args = process.argv.slice(2);
const target = args.find(arg => !arg.startsWith('--'));
const skipPack = args.includes('--no-pack');
const combined = args.includes('--combined');
const demos = loadDemos();

function nextSteps() {
  console.log('Next:');
  console.log('  cd examples/snack-local');
  if (!skipPack) console.log('  npm install            # re-installs the freshly packed tarball');
  console.log('  npx expo start         # scan the QR code with Expo Go (SDK 54)');
}

if (args.includes('--list') || !target) {
  const supported = demos.filter(snackable);
  console.log(`${supported.length} snack-able demos (of ${demos.length}):\n`);
  for (const demo of supported) console.log(`  ${demo.id}`);
  process.exit(target ? 0 : 1);
}

// One Snack per component: every demo the component has, rendered as sections
// in a single screen — the same bundle the docs hero will hand to Expo Go.
if (combined) {
  const componentDemos = demos.filter(d => d.component === target);
  if (componentDemos.length === 0) {
    const components = [...new Set(demos.map(d => d.component))].sort();
    console.error(`No component named "${target}". Known components:\n  ${components.join(', ')}`);
    process.exit(1);
  }

  const bundle = buildComponentBundle(
    target,
    componentDemos.map(d => ({ id: d.slug, title: d.title, code: d.code, files: bundleFiles(d) }))
  );

  if (!bundle) {
    console.error(
      `None of ${target}'s ${componentDemos.length} demos can run in a Snack — each imports ` +
        `something outside packages/ui/src/snack.ts or outside what Expo Go bundles.`
    );
    process.exit(1);
  }

  if (!skipPack) packPackages(bundleUsesCharts(bundle.files));
  writeAppFiles(bundle.files);

  console.log(`\nLoaded ${target} (${bundle.included.length} demos) into examples/snack-local.`);
  console.log(`  included: ${bundle.included.join(', ')}`);
  if (bundle.skipped.length) console.log(`  skipped:  ${bundle.skipped.join(', ')}`);
  console.log();
  nextSteps();
  process.exit(0);
}

const demo =
  demos.find(d => d.id === target) ??
  demos.find(d => d.component === target && snackable(d)) ??
  demos.find(d => d.component === target);

if (!demo) {
  console.error(`No demo matching "${target}". Run with --list to see the options.`);
  process.exit(1);
}

if (!snackable(demo)) {
  console.error(
    `"${demo.id}" cannot run in a Snack — it imports something outside packages/ui/src/snack.ts ` +
      `or outside what Expo Go bundles.`
  );
  process.exit(1);
}

const files = buildDemoBundle({
  component: demo.component,
  title: demo.title,
  code: demo.code,
  files: bundleFiles(demo),
});

if (!files) {
  console.error(`"${demo.id}" could not be bundled for a Snack.`);
  process.exit(1);
}

if (!skipPack) packPackages(bundleUsesCharts(files));
writeAppFiles(files);

console.log(`\nLoaded ${demo.id} into examples/snack-local.\n`);
nextSteps();
