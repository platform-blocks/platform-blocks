/**
 * Plain-data description of the published LLM documentation.
 *
 * The files themselves are produced by scripts/generate-llms.ts; this module is
 * what the /llms page renders, so the guide and the generator stay in step.
 */
import { SITE_URL } from './urls';

export interface LlmsFileEntry {
  path: string;
  description: string;
}

export const LLMS_INDEX_URL = `${SITE_URL}/llms.txt`;
export const LLMS_FULL_URL = `${SITE_URL}/llms-full.txt`;

export const LLMS_INTRO =
  'Platform Blocks publishes its documentation as Markdown for language models, following the llmstxt.org convention. Point an agent at the index and it can fetch only the pages it needs, instead of loading the whole library into context.';

export const LLMS_ENTRY_FILES: LlmsFileEntry[] = [
  {
    path: '/llms.txt',
    description:
      'Compact index. One line per documentation page — title, link, and a one-sentence summary — grouped into Guides, Components, Charts, Hooks, and FAQ. Start here.',
  },
  {
    path: '/llms-full.txt',
    description:
      'Every page concatenated into a single file, nothing truncated: full props tables, every demo, and all hook type definitions. Use it when an agent can hold the whole library at once.',
  },
];

export const LLMS_PAGE_FILES: LlmsFileEntry[] = [
  {
    path: '/llms/components/<Name>.md',
    description:
      'One component: description, package and import line, the full props table, and every documented example. Charts live here too — /llms/components/LineChart.md.',
  },
  {
    path: '/llms/hooks/<useName>.md',
    description:
      'One hook: description, import line, its TypeScript definition, and runnable examples.',
  },
  {
    path: '/llms/guides/<slug>.md',
    description:
      'Getting started, accessibility, and localization, rendered from the same source the site pages use.',
  },
  {
    path: '/llms/faq/<key>.md',
    description: 'One frequently asked question and its answer per file.',
  },
];

export const LLMS_USAGE_SNIPPET = `# Give an agent the index, then let it fetch what it needs
curl ${SITE_URL}/llms.txt

# Read one component's full documentation
curl ${SITE_URL}/llms/components/Button.md

# Or hand over everything at once
curl ${SITE_URL}/llms-full.txt`;

export const LLMS_SKILLS_TITLE = 'Agent skills';

export const LLMS_SKILLS_INTRO =
  'Beyond raw documentation, Platform Blocks ships Agent Skills — installable instructions that teach coding agents the working patterns and pitfalls of one area of the library, verified against the source. Five skills cover setup, theming, layout, forms, and charts.';

export const LLMS_SKILLS_REPO_URL = 'https://github.com/platform-blocks/skills';

export const LLMS_SKILLS_SNIPPET = `# Install a skill with the skills.sh CLI
npx skills add ${LLMS_SKILLS_REPO_URL} --skill platform-blocks-setup`;

export const LLMS_ON_PAGE_NOTE =
  'Every component and hook page also carries a Copy button that puts that page\'s Markdown on your clipboard, plus shortcuts that open it in ChatGPT or Claude. The "LLM docs" link in each page\'s resource list points at the same Markdown file the index links to.';

export const LLMS_FRESHNESS_NOTE =
  'These files are regenerated from the component metadata, props, and demos on every documentation build, so they never lag behind the published packages.';
