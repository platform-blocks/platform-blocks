import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { c as create } from 'tar';

import { downloadTemplate, tarballUrl } from './download';

/** A gzipped tarball shaped like GitHub's: everything under one `<repo>-<sha>/` folder. */
async function githubTarball(): Promise<Buffer> {
  const root = mkdtempSync(join(tmpdir(), 'create-plocks-src-'));
  mkdirSync(join(root, 'starter-abc123', 'app'), { recursive: true });
  writeFileSync(join(root, 'starter-abc123', 'package.json'), '{"name":"starter"}');
  writeFileSync(join(root, 'starter-abc123', 'app', 'index.tsx'), 'export {};');
  const chunks: Buffer[] = [];
  for await (const chunk of create({ gzip: true, cwd: root }, ['starter-abc123'])) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

test('extracts the default branch into the directory, without the wrapper folder', async () => {
  const body = await githubTarball();
  let requested = '';
  const fakeFetch = (async (url: string) => {
    requested = url;
    return new Response(body);
  }) as typeof fetch;

  const dir = join(mkdtempSync(join(tmpdir(), 'create-plocks-')), 'my-app');
  await downloadTemplate({ owner: 'acme', repo: 'starter' }, dir, fakeFetch);

  assert.equal(requested, tarballUrl({ owner: 'acme', repo: 'starter' }));
  assert.equal(readFileSync(join(dir, 'package.json'), 'utf8'), '{"name":"starter"}');
  assert.equal(readFileSync(join(dir, 'app', 'index.tsx'), 'utf8'), 'export {};');
});

test('reports a missing repo', async () => {
  const fakeFetch = (async () => new Response('Not Found', { status: 404 })) as typeof fetch;
  await assert.rejects(
    downloadTemplate({ owner: 'acme', repo: 'nope' }, join(tmpdir(), 'unused'), fakeFetch),
    /Couldn't download acme\/nope \(not found\)/
  );
});
