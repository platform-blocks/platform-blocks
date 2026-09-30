import { STARTER_TEMPLATES } from '../../../apps/docs/config/templates';

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface Template extends GitHubRepo {
  /** What `--template` takes, e.g. `expo` for the expo-template repo. */
  key: string;
  description: string;
}

/** `expo-template` → `expo`. */
const shortKey = (name: string) => name.replace(/-template$/, '');

/** `owner/repo`, `github:owner/repo` or a github.com URL. */
export function parseGitHubRepo(input: string): GitHubRepo | null {
  const match = input
    .trim()
    .replace(/^github:/, '')
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/+$/, '')
    .match(/^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/);
  return match ? { owner: match[1], repo: match[2] } : null;
}

/**
 * The published templates, from the docs site's list
 * (apps/docs/config/templates.ts), bundled in at build time.
 */
export const TEMPLATES: Template[] = STARTER_TEMPLATES.filter((template) => template.available).map((template) => {
  const repo = parseGitHubRepo(template.repo);
  if (!repo) throw new Error(`Template ${template.key} has an unreadable repo URL: ${template.repo}`);
  return { key: shortKey(template.name), description: template.description, ...repo };
});

export const DEFAULT_TEMPLATE = 'expo';

/**
 * A template by key (`expo`, or the repo name `expo-template`), or any GitHub
 * repo given as `owner/repo` or a URL — community templates work the same way.
 */
export function resolveTemplate(input: string): Template | null {
  const key = shortKey(input.trim().toLowerCase());
  const known = TEMPLATES.find((template) => template.key === key);
  if (known) return known;
  const repo = parseGitHubRepo(input);
  return repo ? { key: `${repo.owner}/${repo.repo}`, description: '', ...repo } : null;
}
