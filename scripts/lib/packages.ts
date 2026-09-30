/**
 * The workspace packages that ship documented components.
 *
 * Every `packages/<dir>` with a `src/components` folder publishes as
 * `@plocks/<dir>` (the `name` in its package.json). Shared by the demo, llms,
 * skills and Snack generators, so a new package is picked up by all of them
 * from its folder rather than from a list each one keeps.
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

/** The base package: every other one builds on it and is installed beside it. */
export const UI_PACKAGE = '@plocks/ui';
/** Charts keep their own docs route (`/charts/<Name>`) and category. */
export const CHARTS_PACKAGE = '@plocks/charts';

export interface WorkspacePackage {
  /** Folder under `packages/`, e.g. `dates`. */
  dir: string;
  /** npm name, e.g. `@plocks/dates`. */
  name: string;
  version: string;
  /** Absolute path of the package folder. */
  root: string;
  /** Absolute path of its `src/`. */
  src: string;
  /** Absolute path of its `src/components/`. */
  components: string;
  /** Absolute path of its barrel, `src/index.ts`. */
  entry: string;
}

/** `@plocks/ui` first, then the rest by folder name. */
export function listWorkspacePackages(repoRoot: string): WorkspacePackage[] {
  const packagesDir = join(repoRoot, 'packages');
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(packagesDir, entry.name, 'src', 'components')))
    .map(entry => {
      const root = join(packagesDir, entry.name);
      let manifest: { name?: string; version?: string } = {};
      try { manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')); } catch { /* defaults below */ }
      return {
        dir: entry.name,
        name: manifest.name ?? `@plocks/${entry.name}`,
        version: manifest.version ?? 'unknown',
        root,
        src: join(root, 'src'),
        components: join(root, 'src', 'components'),
        entry: join(root, 'src', 'index.ts'),
      };
    })
    .sort((a, b) => Number(b.name === UI_PACKAGE) - Number(a.name === UI_PACKAGE) || a.dir.localeCompare(b.dir));
}

/** The package a file or folder lives in, if any. */
export function packageContaining(packages: WorkspacePackage[], file: string): WorkspacePackage | undefined {
  return packages.find(pkg => !relative(pkg.root, file).startsWith('..'));
}
