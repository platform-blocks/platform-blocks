import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCliArgs } from './args';

test('defaults', () => {
  assert.deepEqual(parseCliArgs([]), {
    directory: undefined,
    template: undefined,
    packageManager: undefined,
    install: true,
    git: true,
    yes: false,
    help: false,
    version: false,
  });
});

test('directory, template, package manager and negated flags', () => {
  const options = parseCliArgs(['my-app', '-t', 'expo-min', '--pm', 'pnpm', '--no-install', '--no-git', '-y']);
  assert.equal(options.directory, 'my-app');
  assert.equal(options.template, 'expo-min');
  assert.equal(options.packageManager, 'pnpm');
  assert.equal(options.install, false);
  assert.equal(options.git, false);
  assert.equal(options.yes, true);
});

test('rejects an unknown package manager, an unknown flag and a second directory', () => {
  assert.throws(() => parseCliArgs(['--pm', 'npx']), /--pm must be one of/);
  assert.throws(() => parseCliArgs(['--nope']), /Usage:/);
  assert.throws(() => parseCliArgs(['a', 'b']), /Expected one directory/);
});
