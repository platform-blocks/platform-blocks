import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import * as p from '@clack/prompts';
import pc from 'picocolors';

import { parseCliArgs, USAGE } from './args';
import { downloadTemplate } from './download';
import { detectPackageManager, installDependencies, runScriptCommand } from './packageManager';
import { isUsableDirectory, prepareProject, validateProjectName } from './project';
import { DEFAULT_TEMPLATE, resolveTemplate, TEMPLATES, type Template } from './templates';

declare const __VERSION__: string;

const DEFAULT_DIRECTORY = 'my-plocks-app';

function orExit<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }
  return value as Exclude<T, symbol>;
}

/** How to reach `target` from here, for the next-steps `cd`. */
function displayPath(target: string): string {
  const path = relative(process.cwd(), target) || '.';
  return /\s/.test(path) ? `"${path}"` : path;
}

const lastLines = (text: string, count = 20) => text.trimEnd().split('\n').slice(-count).join('\n');

/** `git init` plus a first commit, unless git is missing or we're inside a repo already. */
function initGit(dir: string): boolean {
  const git = (...args: string[]) => spawnSync('git', args, { cwd: dir, stdio: 'ignore' }).status === 0;
  if (!git('--version') || git('rev-parse', '--is-inside-work-tree')) return false;
  if (!git('init', '--quiet')) return false;
  // Fails without a configured git identity; the repo is still there.
  if (git('add', '-A')) git('commit', '--quiet', '-m', 'Initial commit from create-plocks');
  return true;
}

async function main() {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.help) return console.log(USAGE);
  if (options.version) return console.log(__VERSION__);

  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY) && !options.yes;
  p.intro(`${pc.bgYellow(pc.black(' plocks '))} ${pc.dim(`create-plocks ${__VERSION__}`)}`);

  const directory =
    options.directory ??
    (interactive
      ? orExit(
          await p.text({
            message: 'Where should the project go?',
            placeholder: DEFAULT_DIRECTORY,
            defaultValue: DEFAULT_DIRECTORY,
            validate: (value) => validateProjectName(basename(resolve(value || DEFAULT_DIRECTORY))),
          })
        )
      : DEFAULT_DIRECTORY);
  const target = resolve(directory);
  const name = basename(target);
  const nameError = validateProjectName(name);
  if (nameError) throw new Error(`${nameError} ("${name}")`);
  if (!(await isUsableDirectory(target))) {
    throw new Error(`${displayPath(target)} already exists and isn't empty — pick another directory.`);
  }

  let template: Template;
  if (options.template) {
    const resolved = resolveTemplate(options.template);
    if (!resolved) {
      const keys = TEMPLATES.map((t) => t.key).join(', ');
      throw new Error(`Unknown template "${options.template}". Use ${keys}, or a GitHub repo as owner/repo.`);
    }
    template = resolved;
  } else if (interactive) {
    const key = orExit(
      await p.select({
        message: 'Pick a template',
        initialValue: DEFAULT_TEMPLATE,
        options: TEMPLATES.map((t) => ({ value: t.key, label: t.key, hint: t.description })),
      })
    );
    template = resolveTemplate(key)!;
  } else {
    template = resolveTemplate(DEFAULT_TEMPLATE)!;
  }

  const packageManager = options.packageManager ?? detectPackageManager();
  const createdDirectory = !existsSync(target);
  const spin = p.spinner();

  spin.start(`Downloading ${template.owner}/${template.repo}`);
  try {
    await downloadTemplate(template, target);
    await prepareProject(target, { name, packageManager });
  } catch (error) {
    spin.error('Download failed');
    if (createdDirectory) await rm(target, { recursive: true, force: true });
    throw error;
  }
  spin.stop(`Created ${pc.bold(name)} from the ${template.key} template`);

  if (options.install) {
    spin.start(`Installing dependencies with ${packageManager}`);
    const result = await installDependencies(packageManager, target);
    if (result.ok) {
      spin.stop('Installed dependencies');
    } else {
      spin.error(`${packageManager} install failed`);
      p.log.message(pc.dim(lastLines(result.output)));
      p.log.warn(`Run ${pc.bold(`${packageManager} install`)} in the project to try again.`);
    }
  }

  if (options.git && initGit(target)) p.log.step('Created a git repository');

  const steps = [
    ...(resolve(process.cwd()) === target ? [] : [`cd ${displayPath(target)}`]),
    ...(options.install ? [] : [`${packageManager} install`]),
    runScriptCommand(packageManager, 'start'),
  ];
  p.note(steps.join('\n'), 'Next steps');
  p.outro(`Docs and components: ${pc.underline('https://plocks.dev')}`);
}

main().catch((error: unknown) => {
  p.cancel(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
