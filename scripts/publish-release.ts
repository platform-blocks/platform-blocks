import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(__dirname, '..');
// Publish the dependency first so npm can resolve peers as each package goes live.
const PACKAGE_DIRS = [
  'ui', 'ui-snack', 'charts', 'dates', 'code', 'media', 'carousel',
  'spotlight', 'brands', 'qrcode', 'emoji-picker', 'create-plocks',
];

const run = (command: string, args: string[], cwd = ROOT): string =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    env: {
      ...process.env,
      NPM_CONFIG_CACHE: process.env.NPM_CONFIG_CACHE ?? path.join(os.tmpdir(), 'plocks-npm-cache'),
    },
  });

const readJson = (file: string) => JSON.parse(fs.readFileSync(file, 'utf8'));

const main = () => {
  const root = readJson(path.join(ROOT, 'package.json'));
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipBuild = args.includes('--skip-build');
  const versionArg = args.find(arg => !arg.startsWith('--'));
  const unknown = args.filter(arg => arg !== '--dry-run' && arg !== '--skip-build' && arg !== versionArg);
  if (unknown.length) throw new Error(`Unknown argument: ${unknown.join(', ')}`);
  if (versionArg && versionArg !== root.version) {
    throw new Error(`Requested ${versionArg}, but package.json is ${root.version}. Prepare and commit the version first.`);
  }

  const lock = readJson(path.join(ROOT, 'package-lock.json'));
  if (lock.version !== root.version || lock.packages?.['']?.version !== root.version) {
    throw new Error('Root package.json and package-lock.json versions differ. Update the lockfile before release.');
  }

  const packages = PACKAGE_DIRS.map(dir => {
    const cwd = path.join(ROOT, 'packages', dir);
    const manifest = readJson(path.join(cwd, 'package.json'));
    if (manifest.version !== root.version) {
      throw new Error(`${manifest.name} is ${manifest.version}; expected ${root.version}.`);
    }
    if (manifest.peerDependencies?.['@plocks/ui'] && manifest.peerDependencies['@plocks/ui'] !== `^${root.version}`) {
      throw new Error(`${manifest.name} must peer-depend on @plocks/ui@^${root.version}.`);
    }
    if (lock.packages?.[`packages/${dir}`]?.version !== manifest.version) {
      throw new Error(`package-lock.json has a stale version for ${manifest.name}.`);
    }
    return { cwd, manifest };
  });

  if (!dryRun) {
    if (run('git', ['status', '--porcelain']).trim()) {
      throw new Error('Commit the complete release, including generated files, before publishing.');
    }
    const remote = run('git', ['remote', 'get-url', 'origin']).trim();
    if (!/github\.com[:/]platform-blocks\/plocks(?:\.git)?$/.test(remote)) {
      throw new Error(`Origin points to ${remote}; set it to platform-blocks/plocks before publishing.`);
    }
    const user = run('npm', ['whoami']).trim();
    console.log(`Publishing ${root.version} as ${user}`);
  } else {
    console.log(`Checking ${root.version} package tarballs (no publish)`);
  }

  const published: string[] = [];
  for (const { cwd, manifest } of packages) {
    if (!skipBuild) {
      console.log(`Building ${manifest.name}`);
      run('npm', ['run', 'build'], cwd);
    }
    const pack = JSON.parse(run('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], cwd))[0];
    const packed = new Set<string>(pack.files.map((file: { path: string }) => file.path));
    const entries = [manifest.main, manifest.module, manifest.types, ...Object.values(manifest.bin ?? {})] as string[];
    for (const entry of entries.filter(Boolean)) {
      if (!packed.has(entry.replace(/^\.\//, ''))) {
        throw new Error(`${manifest.name} tarball is missing ${entry}.`);
      }
    }
    for (const entry of ['README.md', 'LICENSE']) {
      if (!packed.has(entry)) throw new Error(`${manifest.name} tarball is missing ${entry}.`);
    }
    console.log(`${manifest.name}@${manifest.version}: ${pack.files.length} files, ${pack.size} bytes`);
    if (dryRun) continue;
    try {
      const result = run('npm', ['publish', '--access=public', '--tag=latest'], cwd);
      process.stdout.write(result);
      published.push(manifest.name);
    } catch (error) {
      throw new Error(`Publishing stopped at ${manifest.name}. Already published: ${published.join(', ') || 'none'}. Check npm before retrying.`, { cause: error });
    }
  }
  console.log(dryRun ? 'All package tarballs passed.' : 'All packages published.');
};

try {
  main();
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
