import { mkdir } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream } from 'node:stream/web';
import { x as extract } from 'tar';

import type { GitHubRepo } from './templates';

/** The repo's default branch as a gzipped tarball. */
export const tarballUrl = ({ owner, repo }: GitHubRepo) => `https://codeload.github.com/${owner}/${repo}/tar.gz/HEAD`;

/** Downloads a GitHub repo's default branch into `dir` (created if missing). */
export async function downloadTemplate(template: GitHubRepo, dir: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  const response = await fetchImpl(tarballUrl(template));
  if (!response.ok || !response.body) {
    const reason = response.status === 404 ? 'not found' : `HTTP ${response.status}`;
    throw new Error(`Couldn't download ${template.owner}/${template.repo} (${reason}).`);
  }
  await mkdir(dir, { recursive: true });
  // GitHub wraps the repo in one top-level `<repo>-<sha>/` folder.
  await pipeline(Readable.fromWeb(response.body as ReadableStream), extract({ cwd: dir, strip: 1 }));
}
