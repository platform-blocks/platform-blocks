import { existsSync } from 'node:fs';
import { readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { PackageManager } from './packageManager';

/** A valid npm package name for the project: lowercase, URL-safe, no leading dot or underscore. */
export function toPackageName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-._~]/g, '')
    .replace(/^[._]+/, '')
    .slice(0, 214);
}

/** Letters, digits and dashes — what Expo takes for a slug and a URL scheme. */
export function toSlug(name: string): string {
  const slug = toPackageName(name).replace(/[._~]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return /^[a-z]/.test(slug) ? slug : `app-${slug}`;
}

/** An error message for a project name we can't use, or undefined. */
export function validateProjectName(name: string | undefined): string | undefined {
  if (!name || !name.trim()) return 'Name the project.';
  if (!toPackageName(name)) return 'Use letters, numbers and dashes in the name.';
  return undefined;
}

const IGNORED_ENTRIES = new Set(['.DS_Store', '.git', 'Thumbs.db']);

/** Whether `dir` is missing or has nothing in it worth keeping. */
export async function isUsableDirectory(dir: string): Promise<boolean> {
  if (!existsSync(dir)) return true;
  if (!(await stat(dir)).isDirectory()) return false;
  return (await readdir(dir)).every((entry) => IGNORED_ENTRIES.has(entry));
}

const LOCKFILES: Record<PackageManager, string[]> = {
  npm: ['package-lock.json'],
  pnpm: ['pnpm-lock.yaml'],
  yarn: ['yarn.lock'],
  bun: ['bun.lock', 'bun.lockb'],
};

async function editJson(path: string, edit: (json: Record<string, any>) => void): Promise<void> {
  if (!existsSync(path)) return;
  const json = JSON.parse(await readFile(path, 'utf8'));
  edit(json);
  await writeFile(path, `${JSON.stringify(json, null, 2)}\n`);
}

/**
 * Turns a downloaded template into the user's project: their name in
 * package.json, app.json and the README, no license of ours, and only the
 * lockfile of the package manager they use.
 */
export async function prepareProject(
  dir: string,
  { name, packageManager }: { name: string; packageManager: PackageManager }
): Promise<void> {
  const slug = toSlug(name);

  await editJson(join(dir, 'package.json'), (pkg) => {
    pkg.name = toPackageName(name);
    delete pkg.repository;
    delete pkg.bugs;
    delete pkg.homepage;
  });

  await editJson(join(dir, 'app.json'), (app) => {
    const expo = app.expo;
    if (!expo) return;
    expo.name = name;
    expo.slug = slug;
    if (expo.scheme) expo.scheme = slug;
    // Tied to the template's own Expo account and EAS project, not the user's.
    delete expo.owner;
    delete expo.updates;
    if (expo.extra?.eas) delete expo.extra.eas;
  });

  const readme = join(dir, 'README.md');
  if (existsSync(readme)) {
    const text = await readFile(readme, 'utf8');
    await writeFile(readme, text.replace(/^# .*$/m, `# ${name}`));
  }

  const remove = ['LICENSE', 'LICENSE.md'];
  for (const [manager, lockfiles] of Object.entries(LOCKFILES)) {
    if (manager !== packageManager) remove.push(...lockfiles);
  }
  await Promise.all(remove.map((file) => rm(join(dir, file), { force: true })));
}
