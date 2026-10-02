#!/usr/bin/env node
/** Build the docs and bundle the sibling example apps at /demos/<slug>. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesRoot = path.resolve(docsRoot, '../../../examples');
const exporter = path.join(examplesRoot, 'scripts/export-web-demos.mjs');
if (!fs.existsSync(exporter)) {
  throw new Error(`The example apps checkout is required beside plocks: ${examplesRoot}`);
}

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'plocks-web-demos-'));
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status ?? 'unknown'})`);
};

try {
  run(process.execPath, [exporter, temp], { cwd: examplesRoot });
  fs.copyFileSync(
    path.join(examplesRoot, 'snack-manifest.json'),
    path.join(docsRoot, 'config/appSnackManifest.json'),
  );
  run('npm', ['run', 'build-web'], {
    cwd: docsRoot,
    env: { ...process.env, EXPO_PUBLIC_DEMOS_BUNDLED: 'true' },
  });
  if (!fs.existsSync(path.join(docsRoot, 'dist/index.html'))) {
    throw new Error('Docs export did not produce dist/index.html.');
  }
  fs.cpSync(temp, path.join(docsRoot, 'dist/demos'), { recursive: true });
  run('npx', ['tsx', 'scripts/inject-demo-seo-tags.ts'], { cwd: docsRoot });
  console.log('Built docs with live demos and source pages in dist/demos.');
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
