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
export const LLMS_SMALL_URL = `${SITE_URL}/llms-small.txt`;

/**
 * Guides that generated pages link to by URL: every component page points at
 * the shared-props guide instead of repeating the spacing, sizing, field and
 * chart props it inherits, and the index points at the icon registry.
 */
export const LLMS_SHARED_PROPS_URL = `${SITE_URL}/llms/guides/shared-props.md`;
export const LLMS_ICONS_URL = `${SITE_URL}/llms/guides/icons.md`;
export const LLMS_THEMING_URL = `${SITE_URL}/llms/guides/theming.md`;

export const LLMS_INTRO =
  'The documentation is published as Markdown for language models, following the llmstxt.org convention. Point an agent at the index and it fetches only the pages it needs.';

export const LLMS_ENTRY_FILES: LlmsFileEntry[] = [
  {
    path: '/llms.txt',
    description: 'Compact index — one line per page. Start here.',
  },
  {
    path: '/llms-small.txt',
    description: 'Every component, chart and hook in one smaller file — imports, own props, one example each.',
  },
  {
    path: '/llms-full.txt',
    description: 'Every page concatenated, nothing truncated. Too large for most context windows; best for search and embedding pipelines.',
  },
];

export const LLMS_PAGE_FILES: LlmsFileEntry[] = [
  {
    path: '/llms/components/<Name>.md',
    description: 'One component: props, sub-components, and every example as a complete module. Charts too.',
  },
  {
    path: '/llms/hooks/<useName>.md',
    description: 'One hook: type definition and examples.',
  },
  {
    path: '/llms/guides/<slug>.md',
    description: 'Getting started, theming, shared props, icons, accessibility, localization, contributing.',
  },
  {
    path: '/llms/faq/<key>.md',
    description: 'One question and its answer.',
  },
];

export const LLMS_USAGE_SNIPPET = `curl ${SITE_URL}/llms.txt                    # the index
curl ${SITE_URL}/llms/components/Button.md   # one page
curl ${SITE_URL}/llms-small.txt              # every API, compact
curl ${SITE_URL}/ui/Button.md                # any docs URL + .md`;

export const LLMS_SKILLS_TITLE = 'Agent skills';

export const LLMS_SKILLS_INTRO =
  'Eight installable skills cover setup, theming, layout, forms, charts, feedback and overlays, data display, and navigation. Their API references are checked against the source.';

export const LLMS_SKILLS_REPO_URL = 'https://github.com/platform-blocks/skills';

export const LLMS_SKILLS_SNIPPET = `npx skills add ${LLMS_SKILLS_REPO_URL} --skill plocks-setup`;

export const LLMS_ON_PAGE_NOTE =
  'Add .md to any component, chart, hook or guide URL to get its Markdown. The pages also carry a Copy button for it, plus shortcuts that open it in ChatGPT or Claude.';

export const LLMS_FRESHNESS_NOTE =
  'Regenerated from component metadata, props, and demos on every documentation build.';
