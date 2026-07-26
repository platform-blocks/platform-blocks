#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface PackageTarget {
  name: string;
  dir: string;
  workspace: string;
}

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_ACCESS = 'public';
const PACKAGES: PackageTarget[] = [
  {
    name: '@platform-blocks/ui',
    dir: path.join(ROOT, 'packages', 'ui'),
    workspace: 'packages/ui',
  },
  {
    name: '@platform-blocks/charts',
    dir: path.join(ROOT, 'packages', 'charts'),
    workspace: 'packages/charts',
  },
];

interface Options {
  version: string;
  npmTag: string;
  dryRun: boolean;
  skipBuild: boolean;
  access: string;
}

const parseOptions = (): Options => {
  const args = process.argv.slice(2);
  let version = '';
  let npmTag = 'latest';
  let dryRun = false;
  let skipBuild = false;
  let access = DEFAULT_ACCESS;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }

    if (arg === '--skip-build') {
      skipBuild = true;
      continue;
    }

    if (arg === '--tag' && args[i + 1]) {
      npmTag = args[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--tag=')) {
      npmTag = arg.split('=')[1] ?? npmTag;
      continue;
    }

    if ((arg === '--version' || arg === '-v') && args[i + 1]) {
      version = args[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--version=')) {
      version = arg.split('=')[1] ?? version;
      continue;
    }

    if (arg.startsWith('--access=')) {
      access = arg.split('=')[1] ?? DEFAULT_ACCESS;
      continue;
    }

    if (arg === '--access' && args[i + 1]) {
      access = args[i + 1];
      i += 1;
      continue;
    }

    if (!arg.startsWith('--') && !version) {
      version = arg;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!version) {
    throw new Error('Missing version. Example: tsx scripts/publish-release.ts 0.2.0');
  }

  const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?$/;
  if (!semverPattern.test(version)) {
    throw new Error(`Version "${version}" is not valid semver.`);
  }

  return { version, npmTag, dryRun, skipBuild, access };
};

const runCommand = (command: string, cwd = ROOT, dryRun = false) => {
  if (dryRun) {
    console.log(`[dry-run] ${command}`);
    return;
  }
  execSync(command, { cwd, stdio: 'inherit' });
};

const runCommandCapture = (command: string, cwd = ROOT, dryRun = false): string => {
  if (dryRun) {
    console.log(`[dry-run] ${command}`);
    return '';
  }
  return execSync(command, { cwd, stdio: 'pipe', encoding: 'utf8' }) as string;
};

const ensureNpmAuth = (dryRun: boolean) => {
  try {
    const whoami = runCommandCapture('npm whoami', ROOT, dryRun).trim();
    if (!dryRun) {
      console.log(`Publishing as npm user: ${whoami}`);
    }
  } catch (error) {
    throw new Error('Unable to determine npm user. Please run "npm login" before publishing.');
  }
};

const warnIfDirty = (dryRun: boolean) => {
  try {
    const status = runCommandCapture('git status --porcelain', ROOT, dryRun).trim();
    if (status) {
      console.warn('Warning: git working tree has uncommitted changes.');
    }
  } catch (error) {
    console.warn('Warning: unable to check git status.');
  }
};

const updatePackageVersion = (pkg: PackageTarget, version: string, dryRun: boolean, backups: { path: string; content: string }[]) => {
  const manifestPath = path.join(pkg.dir, 'package.json');
  const original = fs.readFileSync(manifestPath, 'utf8');
  backups.push({ path: manifestPath, content: original });

  if (dryRun) {
    console.log(`[dry-run] would set ${pkg.name} version to ${version}`);
    return;
  }

  const manifest = JSON.parse(original);
  manifest.version = version;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`Updated ${pkg.name} to ${version}`);
};

const revertVersions = (backups: { path: string; content: string }[]) => {
  backups.forEach(({ path: manifestPath, content }) => {
    fs.writeFileSync(manifestPath, content, 'utf8');
  });
};

const publishPackage = (pkg: PackageTarget, options: Options) => {
  if (!options.skipBuild) {
    runCommand(`npm --prefix ${pkg.workspace} run build`, ROOT, options.dryRun);
  } else {
    console.log(`Skipping build for ${pkg.name}`);
  }

  const publishParts = ['npm', 'publish', `--access=${options.access}`];
  if (options.npmTag) {
    publishParts.push(`--tag=${options.npmTag}`);
  }
  if (options.dryRun) {
    publishParts.push('--dry-run');
  }

  runCommand(publishParts.join(' '), pkg.dir, options.dryRun);
};

const main = () => {
  let options: Options;
  try {
    options = parseOptions();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
    return;
  }

  console.log(`Preparing release ${options.version}`);
  warnIfDirty(options.dryRun);
  ensureNpmAuth(options.dryRun);

  // Generate SEO files (sitemap.xml and llms.txt) before publishing
  console.log('Generating SEO files...');
  try {
    runCommand('npm --prefix apps/platform-blocks.com run generate-seo', ROOT, options.dryRun);
    console.log('SEO files generated successfully.');
  } catch (error) {
    console.warn('Warning: Failed to generate SEO files. Continuing with publish...');
  }

  const backups: { path: string; content: string }[] = [];

  try {
    PACKAGES.forEach(pkg => updatePackageVersion(pkg, options.version, options.dryRun, backups));
    PACKAGES.forEach(pkg => publishPackage(pkg, options));

    console.log('Release complete.');
  } catch (error) {
    console.error('Release failed. Reverting package versions.');
    revertVersions(backups);
    console.error((error as Error).message);
    process.exit(1);
  }
};

main();
