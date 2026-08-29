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
  'The documentation is published as Markdown for language models, following the llmstxt.org convention. Point an agent at the index and it fetches only the pages it needs.';

export const LLMS_ENTRY_FILES: LlmsFileEntry[] = [
  {
    path: '/llms.txt',
    description: 'Compact index — one line per page. Start here.',
  },
  {
    path: '/llms-full.txt',
    description: 'Every page concatenated, nothing truncated.',
  },
];

export const LLMS_PAGE_FILES: LlmsFileEntry[] = [
  {
    path: '/llms/components/<Name>.md',
    description: 'One component: props table and every example. Charts too.',
  },
  {
    path: '/llms/hooks/<useName>.md',
    description: 'One hook: type definition and examples.',
  },
  {
    path: '/llms/guides/<slug>.md',
    description: 'Getting started, accessibility, localization, contributing.',
  },
  {
    path: '/llms/faq/<key>.md',
    description: 'One question and its answer.',
  },
];

export const LLMS_USAGE_SNIPPET = `curl ${SITE_URL}/llms.txt                    # the index
curl ${SITE_URL}/llms/components/Button.md   # one page
curl ${SITE_URL}/llms-full.txt               # everything`;

export const LLMS_SKILLS_TITLE = 'Agent skills';

export const LLMS_SKILLS_INTRO =
  'Five installable skills — setup, theming, layout, forms, and charts — teach agents the working patterns and pitfalls of the library, verified against the source.';

export const LLMS_SKILLS_REPO_URL = 'https://github.com/platform-blocks/skills';

export const LLMS_SKILLS_SNIPPET = `npx skills add ${LLMS_SKILLS_REPO_URL} --skill platform-blocks-setup`;

export const LLMS_ON_PAGE_NOTE =
  'Component and hook pages also carry a Copy button for their Markdown, plus shortcuts that open it in ChatGPT or Claude.';

export const LLMS_FRESHNESS_NOTE =
  'Regenerated from component metadata, props, and demos on every documentation build.';
