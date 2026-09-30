import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { isUsableDirectory, prepareProject, toPackageName, toSlug, validateProjectName } from './project';

test('normalizes names', () => {
  assert.equal(toPackageName('My App'), 'my-app');
  assert.equal(toPackageName('_hidden.app'), 'hidden.app');
  assert.equal(toSlug('My.App_2'), 'my-app-2');
  assert.equal(toSlug('2048'), 'app-2048');
  assert.equal(validateProjectName('my-app'), undefined);
  assert.match(validateProjectName('   ') ?? '', /Name the project/);
  assert.match(validateProjectName('!!!') ?? '', /letters, numbers and dashes/);
});

test('treats a missing or empty directory as usable, and a populated one as not', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'create-plocks-'));
  assert.equal(await isUsableDirectory(join(dir, 'missing')), true);
  writeFileSync(join(dir, '.DS_Store'), '');
  assert.equal(await isUsableDirectory(dir), true);
  writeFileSync(join(dir, 'index.ts'), '');
  assert.equal(await isUsableDirectory(dir), false);
});

test('turns a template into the user\'s project', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'create-plocks-'));
  const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
  writeFileSync(join(dir, 'package.json'), json({ name: 'plocks-expo-template', repository: 'x', private: true }));
  writeFileSync(join(dir, 'app.json'), json({
    expo: { name: 'plocks App', slug: 'plocks-app', scheme: 'plocksapp', owner: 'joshstovall', updates: { url: 'u' }, extra: { eas: { projectId: 'p' }, other: 1 } },
  }));
  writeFileSync(join(dir, 'README.md'), '# plocks Expo template\n\nUse it.\n');
  for (const file of ['LICENSE', 'package-lock.json', 'yarn.lock']) writeFileSync(join(dir, file), '');

  await prepareProject(dir, { name: 'Trail Log', packageManager: 'yarn' });

  const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  assert.deepEqual(pkg, { name: 'trail-log', private: true });
  const { expo } = JSON.parse(readFileSync(join(dir, 'app.json'), 'utf8'));
  assert.deepEqual(expo, { name: 'Trail Log', slug: 'trail-log', scheme: 'trail-log', extra: { other: 1 } });
  assert.equal(readFileSync(join(dir, 'README.md'), 'utf8'), '# Trail Log\n\nUse it.\n');
  assert.equal(existsSync(join(dir, 'LICENSE')), false);
  assert.equal(existsSync(join(dir, 'package-lock.json')), false);
  assert.equal(existsSync(join(dir, 'yarn.lock')), true);
});
