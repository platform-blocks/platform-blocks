/**
 * Plain-data source of truth for the starter-template gallery on the
 * Getting Started page.
 *
 * Kept free of JSX (like config/gettingStarted.ts) so it can be consumed both
 * by the screen and by scripts/generate-llms.ts, which renders the same list
 * into /llms/guides/getting-started.md.
 *
 * Each entry names a GitHub "template repository" — readers open the repo and
 * click "Use this template" to start a project from it. Repos live under the
 * platform-blocks GitHub org; flip `available` to true as each one is
 * published and the card gains its link everywhere at once.
 */

export interface StarterTemplate {
  key: string;
  /** Repo slug under the platform-blocks GitHub org. */
  name: string;
  description: string;
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
  'To use a template, open it on GitHub and click the "Use this template" button — GitHub creates a fresh repository from it under your account. Expo templates also work with npx create-expo-app@latest my-app --template <repo-url>. Every template ships with Platform Blocks, its peer dependencies, and the provider already set up.';

export const TEMPLATES_COMMUNITY_INVITE =
  'Built a starter with your own stack? Share it with the community and we will list it here.';

const TEMPLATE_ORG_URL = 'https://github.com/platform-blocks';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    key: 'expo-template',
    name: 'expo-template',
    description:
      'Full-featured Expo Router app targeting iOS, Android, and web — dark mode, testing, and linting wired up.',
    tags: ['Expo', 'iOS', 'Android', 'Web'],
    repo: `${TEMPLATE_ORG_URL}/expo-template`,
    available: true,
  },
  {
    key: 'expo-min-template',
    name: 'expo-min-template',
    description:
      'Minimal Expo app — a single screen with the provider set up and nothing else to delete.',
    tags: ['Expo', 'Minimal'],
    repo: `${TEMPLATE_ORG_URL}/expo-min-template`,
    available: true,
  },
  {
    key: 'universal-template',
    name: 'universal-template',
    description:
      'Cross-platform Expo app with statically rendered web output — one codebase shipping native apps and a real website.',
    tags: ['Expo', 'iOS', 'Android', 'Web', 'Static web'],
    repo: `${TEMPLATE_ORG_URL}/universal-template`,
    available: true,
  },
  {
    key: 'native-template',
    name: 'native-template',
    description:
      'iOS and Android only — no web configuration, for teams shipping mobile apps exclusively.',
    tags: ['Expo', 'iOS', 'Android'],
    repo: `${TEMPLATE_ORG_URL}/native-template`,
    available: true,
  },
  {
    key: 'web-template',
    name: 'web-template',
    description:
      'React Native Web only — Platform Blocks components in a web-first single-page app.',
    tags: ['Web', 'React Native Web'],
    repo: `${TEMPLATE_ORG_URL}/web-template`,
    available: true,
  },
  {
    key: 'react-native-template',
    name: 'react-native-template',
    description:
      'Bare React Native (community CLI, no Expo) with native projects checked in and peer dependencies linked.',
    tags: ['React Native CLI', 'iOS', 'Android'],
    repo: `${TEMPLATE_ORG_URL}/react-native-template`,
    available: false,
  },
];
