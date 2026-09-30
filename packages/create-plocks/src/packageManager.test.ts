import assert from 'node:assert/strict';
import { test } from 'node:test';

import { detectPackageManager, runScriptCommand } from './packageManager';

test('detects the package manager from its user agent', () => {
  assert.equal(detectPackageManager('pnpm/9.12.0 npm/? node/v22.0.0 darwin arm64'), 'pnpm');
  assert.equal(detectPackageManager('yarn/4.5.0 npm/? node/v22.0.0'), 'yarn');
  assert.equal(detectPackageManager('bun/1.1.30 npm/? node/v22.0.0'), 'bun');
  assert.equal(detectPackageManager('npm/10.9.0 node/v22.0.0'), 'npm');
  assert.equal(detectPackageManager(''), 'npm');
});

test('formats script commands per package manager', () => {
  assert.equal(runScriptCommand('npm', 'start'), 'npm run start');
  assert.equal(runScriptCommand('bun', 'start'), 'bun run start');
  assert.equal(runScriptCommand('pnpm', 'start'), 'pnpm start');
  assert.equal(runScriptCommand('yarn', 'start'), 'yarn start');
});
