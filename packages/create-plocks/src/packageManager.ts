import { spawn } from 'node:child_process';

export const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const isPackageManager = (value: string): value is PackageManager =>
  (PACKAGE_MANAGERS as readonly string[]).includes(value);

/**
 * The package manager that launched us (`npm create`, `pnpm create`,
 * `yarn create`, `bun create`), read from the user agent it sets.
 */
export function detectPackageManager(userAgent = process.env.npm_config_user_agent ?? ''): PackageManager {
  const name = userAgent.split('/')[0];
  return isPackageManager(name) ? name : 'npm';
}

/** How to run a package.json script: `npm run start`, `pnpm start`, … */
export function runScriptCommand(packageManager: PackageManager, script: string): string {
  return packageManager === 'npm' || packageManager === 'bun'
    ? `${packageManager} run ${script}`
    : `${packageManager} ${script}`;
}

/** Runs `<pm> install` in `cwd`, capturing its output for an error report. */
export function installDependencies(packageManager: PackageManager, cwd: string): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(packageManager, ['install'], {
      cwd,
      // npm, pnpm and yarn are .cmd shims on Windows.
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', (error) => resolve({ ok: false, output: `${output}${error.message}` }));
    child.on('close', (code) => resolve({ ok: code === 0, output }));
  });
}
