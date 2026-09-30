import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DEFAULT_TEMPLATE, parseGitHubRepo, resolveTemplate, TEMPLATES } from './templates';

test('lists the published templates by short key', () => {
  const keys = TEMPLATES.map((t) => t.key);
  assert.ok(keys.includes(DEFAULT_TEMPLATE));
  assert.ok(keys.every((key) => !key.endsWith('-template')));
  assert.ok(TEMPLATES.every((t) => t.owner === 'platform-blocks' && t.repo.endsWith('-template')));
});

test('resolves a key, a repo name, owner/repo and a GitHub URL', () => {
  assert.equal(resolveTemplate('expo')?.repo, 'expo-template');
  assert.equal(resolveTemplate('Expo-Template')?.repo, 'expo-template');
  assert.deepEqual(resolveTemplate('acme/starter'), { key: 'acme/starter', description: '', owner: 'acme', repo: 'starter' });
  assert.deepEqual(parseGitHubRepo('https://github.com/acme/starter.git'), { owner: 'acme', repo: 'starter' });
  assert.deepEqual(parseGitHubRepo('github:acme/starter/'), { owner: 'acme', repo: 'starter' });
  assert.equal(resolveTemplate('not a template'), null);
});
