/**
 * Plain-data source of truth for the Contributing page.
 *
 * JSX-free (like config/gettingStarted.ts and config/accessibility.ts) so the
 * same copy feeds both the screen and scripts/generate-llms.ts, which renders
 * it into /llms/guides/contributing.md.
 *
 * Prose fields carry *inline markdown* rather than elements — `[text](href)`,
 * `` `code` ``, `**bold**` — which the page runs through <Prose> and the
 * generator emits untouched. One source, both outputs.
 *
 * This mirrors CONTRIBUTING.md at the repo root; when the workflow changes,
 * change both.
 */

import { GITHUB_REPO } from './urls';

export const CONTRIBUTE_TITLE = 'Contributing to Platform Blocks';

export const CONTRIBUTE_SUBTITLE =
  'How the repo is laid out, how to run it locally, and what it takes to land a component, a demo, or a docs page.';

export const CONTRIBUTE_INTRO =
  `Platform Blocks is developed in the open at [platform-blocks/platform-blocks](${GITHUB_REPO}). Issues and pull requests are welcome — this page is the short version of [CONTRIBUTING.md](${GITHUB_REPO}/blob/main/CONTRIBUTING.md), which ships with the repo.`;

/** One row of the repo layout table. */
export interface ContributeRepoPath {
  /** Path relative to the repo root, rendered as code. */
  path: string;
  /** Inline markdown — what lives there. */
  description: string;
}

export const CONTRIBUTE_REPO_LAYOUT: ContributeRepoPath[] = [
  {
    path: 'packages/ui',
    description: 'The component library published as `@platform-blocks/ui` — 100+ components, hooks, and the theming system',
  },
  {
    path: 'packages/charts',
    description: 'The charting package published as `@platform-blocks/charts` — 25 chart types on that same theming',
  },
  {
    path: 'apps/platform-blocks.com',
    description: 'This documentation site (Expo Router, statically rendered web)',
  },
  {
    path: 'scripts/',
    description: 'Generators: demos, docs metadata, llms.txt, sitemap, exports map, release',
  },
];

/** A code block inside a section, with the line of prose that introduces it. */
export interface ContributeSnippet {
  /** Inline markdown shown above the block. Omitted when the section lead covers it. */
  lead?: string;
  code: string;
  /** Highlighting language. Defaults to `bash` — most of this page is commands. */
  language?: string;
  /** File or directory name shown on the block's header. */
  fileName?: string;
}

export interface ContributeSection {
  /** Stable id — also the anchor the table of contents links to. */
  key: string;
  title: string;
  /** Inline markdown. */
  lead: string;
  /** Inline markdown bullets. */
  items?: string[];
  /** Renders `items` as a numbered list — use for steps that must run in order. */
  ordered?: boolean;
  snippets?: ContributeSnippet[];
  /** Inline markdown, rendered small under the section. */
  note?: string;
}

export const CONTRIBUTE_SECTIONS: ContributeSection[] = [
  {
    key: 'setup',
    title: 'Set up the repo',
    lead: 'Platform Blocks is one npm workspace. Install from the root — the workspaces are linked, so the docs site runs against your local packages rather than the published ones.',
    snippets: [
      {
        code: `git clone ${GITHUB_REPO}.git
cd platform-blocks
npm install`,
      },
      {
        lead: 'Start the docs site. It is the main development surface: every component demo renders there, against the source you are editing.',
        code: 'npm run dev',
      },
    ],
    note: 'Press `w` for web, or open the project in Expo Go, an iOS simulator, or an Android emulator.',
  },
  {
    key: 'ui-package',
    title: 'Working on the UI package',
    lead: 'Each component lives in `packages/ui/src/components/<Name>/` with a conventional shape — tests, docs metadata, and demos beside the source:',
    snippets: [
      {
        code: `Button/
  Button.tsx  types.ts  index.ts
  __tests__/            # jest tests
  meta/component.md     # frontmatter: title, category, tags + prose
  demos/<slug>/         # index.tsx (default-export Demo) + description.md`,
        language: 'text',
        fileName: 'packages/ui/src/components/Button',
      },
      {
        lead: 'Build, test, and lint the package from the repo root:',
        code: `npm run ui:build     # rollup + type declarations
npm run ui:test      # jest (70% coverage threshold)
npm run ui:lint      # eslint`,
      },
    ],
  },
  {
    key: 'adding-a-component',
    title: 'Adding a component',
    lead: 'A new component is five steps, and the last one writes most of the docs for you:',
    ordered: true,
    items: [
      'Create the directory following the shape above.',
      'Export it from `packages/ui/src/index.ts`.',
      'Run `npm run ui:exports` to regenerate the per-component `exports` map in `package.json` — CI fails if it is stale.',
      'Add a row to `apps/platform-blocks.com/config/coreComponents.ts`.',
      'Run `npm run docs:all` — the docs route, nav entry, props table, demo code blocks, and llms.txt page are all generated.',
    ],
  },
  {
    key: 'adding-a-demo',
    title: 'Adding a demo',
    lead: 'Demos are the examples on a component page, and each one is a real component the site renders. Create `demos/<slug>/index.tsx` with a default-exported `Demo`, plus a `description.md` carrying `title`, `order`, and `tags` frontmatter, then regenerate:',
    snippets: [{ code: 'npm run demos:all' }],
    note: 'The validator that runs afterwards fails on a missing description, a duplicate slug, or a demo that does not compile.',
  },
  {
    key: 'docs-site',
    title: 'Working on the docs site',
    lead: 'Guide pages keep their copy in JSX-free modules under `apps/platform-blocks.com/config/` — `gettingStarted.ts`, `templates.ts`, `faq.ts`, and this page\'s `contribute.ts` — so `scripts/generate-llms.ts` can render the same source into `llms.txt` for language models. A new page touches four files:',
    items: [
      'the route file under `app/`,',
      'a config module holding its copy,',
      '`config/navigationConfig.ts` for the sidebar entry,',
      '`config/routeSeo.ts` for the title and description — the prerender check fails without them.',
    ],
    snippets: [
      {
        lead: 'Before opening a pull request that changes docs content, regenerate the derived files:',
        code: 'npm run docs:all',
      },
    ],
  },
  {
    key: 'verifying',
    title: 'Verifying a change',
    lead: 'One command covers both packages — the exports map, the skills check, lint, and the test suites:',
    snippets: [{ code: 'npm run verify:packages' }],
  },
  {
    key: 'templates',
    title: 'Starter templates & community',
    lead: 'The starter templates are separate repositories, listed on the site from one config module.',
    items: [
      `Templates live under the [platform-blocks org](https://github.com/platform-blocks) and are listed via \`apps/platform-blocks.com/config/templates.ts\`.`,
      `Built a starter with your own stack? [Share it with us](${GITHUB_REPO}/issues/new?template=community_template.yml) — accepted templates get listed on the [Getting Started](/getting-started) page.`,
    ],
  },
  {
    key: 'releases',
    title: 'Releases',
    lead: 'Maintainers run `npm run release`, which verifies both packages (exports, lint, tests, build) and publishes `@platform-blocks/ui` and `@platform-blocks/charts` to npm. Contributors never need to bump a version — say what the change is in the pull request and it lands in the next release.',
  },
];

export const CONTRIBUTE_OUTRO =
  `Stuck on any of this? Open a [discussion](https://github.com/orgs/platform-blocks/discussions) or [issue](${GITHUB_REPO}/issues) — a question that needed asking is usually a docs bug worth fixing.`;
