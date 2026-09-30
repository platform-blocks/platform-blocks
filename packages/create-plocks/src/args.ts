import { parseArgs } from 'node:util';

import { isPackageManager, PACKAGE_MANAGERS, type PackageManager } from './packageManager';

export interface CliOptions {
  directory?: string;
  template?: string;
  packageManager?: PackageManager;
  install: boolean;
  git: boolean;
  yes: boolean;
  help: boolean;
  version: boolean;
}

export const USAGE = `Usage: npm create plocks@latest [directory] [options]

Options:
  -t, --template <name>  expo, expo-min, universal, native, web, or any GitHub repo (owner/repo)
      --pm <name>        Package manager to install with: ${PACKAGE_MANAGERS.join(', ')}
      --no-install       Skip installing dependencies
      --no-git           Skip creating a git repository
  -y, --yes              Use the defaults for anything not given
  -h, --help             Show this help
  -v, --version          Show the version`;

/** Parses the command line; throws with a readable message on a bad flag. */
export function parseCliArgs(argv: string[]): CliOptions {
  // node:util parseArgs only negates flags from Node 22; handle --no-* here.
  const negated = new Set<string>(argv.filter((arg) => arg === '--no-install' || arg === '--no-git'));
  const args = argv.filter((arg) => !negated.has(arg));

  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(args);
  } catch (error) {
    throw new Error(`${(error as Error).message}\n\n${USAGE}`);
  }
  const { values, positionals } = parsed;

  if (positionals.length > 1) {
    throw new Error(`Expected one directory, got ${positionals.length}: ${positionals.join(' ')}\n\n${USAGE}`);
  }
  if (values.pm !== undefined && !isPackageManager(values.pm)) {
    throw new Error(`--pm must be one of ${PACKAGE_MANAGERS.join(', ')} (got "${values.pm}").`);
  }

  return {
    directory: positionals[0],
    template: values.template,
    packageManager: values.pm as PackageManager | undefined,
    install: !negated.has('--no-install') && values.install !== false,
    git: !negated.has('--no-git') && values.git !== false,
    yes: values.yes ?? false,
    help: values.help ?? false,
    version: values.version ?? false,
  };
}

function parse(args: string[]) {
  return parseArgs({
    args,
    allowPositionals: true,
    strict: true,
    options: {
      template: { type: 'string', short: 't' },
      pm: { type: 'string' },
      install: { type: 'boolean' },
      git: { type: 'boolean' },
      yes: { type: 'boolean', short: 'y' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
}
