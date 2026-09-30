/**
 * Plain-data source of truth for the starter-template gallery on the
 * Getting Started page.
 *
 * Kept free of JSX and imports (like config/gettingStarted.ts) so it can be
 * consumed by the screen, by scripts/generate-llms.ts, which renders the same
 * list into /llms/guides/getting-started.md, and by `create-plocks`, which
 * bundles it at build time and offers the available ones.
 *
 * Each entry names a GitHub "template repository" — `npm create plocks`
 * downloads it, or readers open the repo and click "Use this template". Repos
 * live under the platform-blocks GitHub org; flip `available` to true as each
 * one is published and it appears everywhere at once (rebuild create-plocks).
 */

export interface StarterTemplate {
  key: string;
  /** Repo slug under the platform-blocks GitHub org. */
  name: string;
  description: string;
  /**
   * Mark shown in the template row's leading cell — the toolchain the starter
   * is built on (a `BrandName` from @plocks/brands), or `'globe'` for a
   * web-first starter. The platforms it targets are `tags`.
   */
  mark: 'expo' | 'react' | 'globe';
  /** Stack/platform tags rendered as chips. */
  tags: string[];
  /** GitHub repository URL. */
  repo: string;
  /** False until the repo is published — renders as "coming soon", no link. */
  available: boolean;
}

export const TEMPLATES_TITLE = 'Templates';

export const TEMPLATES_SUBTITLE =
  'Start from a preconfigured project instead of wiring the provider yourself.';

export const TEMPLATES_GUIDANCE =
  'Start a project from a template with the command below — it asks where to put the project and which template to use (pass `--template expo-min` after `--` to skip the question). Or open a template on GitHub and click "Use this template". Every template ships with plocks, its peer dependencies, and the provider already set up.';

export const TEMPLATES_CREATE_COMMAND = 'npm create plocks@latest';

/** The CLI uses the repository name without its `-template` suffix. */
export const getTemplateCreateCommand = (template: StarterTemplate) =>
  `${TEMPLATES_CREATE_COMMAND} -- --template ${template.key.replace(/-template$/, '')}`;

export const TEMPLATES_COMMUNITY_INVITE =
  'Built a starter with your own stack? Share it with the community and we will list it here.';

const TEMPLATE_ORG_URL = 'https://github.com/platform-blocks';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    key: 'expo-template',
    name: 'expo-template',
    description:
      'Full-featured Expo Router app targeting iOS, Android, and web — dark mode, testing, and linting wired up.',
    mark: 'expo',
    tags: ['Expo', 'iOS', 'Android', 'Web'],
    repo: `${TEMPLATE_ORG_URL}/expo-template`,
    available: true,
  },
  {
    key: 'expo-min-template',
    name: 'expo-min-template',
    description:
      'Minimal Expo app — a single screen with the provider set up and nothing else to delete.',
    mark: 'expo',
    tags: ['Expo', 'Minimal'],
    repo: `${TEMPLATE_ORG_URL}/expo-min-template`,
    available: true,
  },
  {
    key: 'universal-template',
    name: 'universal-template',
    description:
      'Cross-platform Expo app with statically rendered web output — one codebase shipping native apps and a real website.',
    mark: 'expo',
    tags: ['Expo', 'iOS', 'Android', 'Web', 'Static web'],
    repo: `${TEMPLATE_ORG_URL}/universal-template`,
    available: true,
  },
  {
    key: 'native-template',
    name: 'native-template',
    description:
      'iOS and Android only — no web configuration, for teams shipping mobile apps exclusively.',
    mark: 'expo',
    tags: ['Expo', 'iOS', 'Android'],
    repo: `${TEMPLATE_ORG_URL}/native-template`,
    available: true,
  },
  {
    key: 'web-template',
    name: 'web-template',
    description:
      'React Native Web only — plocks components in a web-first single-page app.',
    mark: 'globe',
    tags: ['Web', 'React Native Web'],
    repo: `${TEMPLATE_ORG_URL}/web-template`,
    available: true,
  },
];
