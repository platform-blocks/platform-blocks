/**
 * Plain-data source of truth for the Getting Started page.
 *
 * Kept free of JSX (like config/faq.ts) so it can be consumed both by the
 * screen and by the static build steps that run in Node — scripts/generate-llms.ts
 * renders these steps into /llms/guides/getting-started.md.
 *
 * Prose fields carry *inline markdown* rather than elements, which is how a
 * step gets a link without importing React here: the page runs them through
 * <Prose>, which turns `[text](href)` into an anchor, and the generator emits
 * the same string into Markdown untouched. One source, both outputs.
 */

export interface GettingStartedStep {
  title: string;
  /** Inline markdown — `[text](href)`, `` `code` ``, `**bold**`, `_italics_`. */
  lead: string;
  code: string;
  /** File name shown on the code block. Omitted for shell commands. */
  fileName?: string;
  variant?: 'terminal';
  language?: string;
  /** Inline markdown, same as `lead`. */
  note?: string;
}

export const GETTING_STARTED_SUBTITLE =
  'Install plocks, wire up the provider, and render your first component.';

export interface GettingStartedPrerequisite {
  /** Row label — the technology name. */
  label: string;
  /** BrandIcon name rendered beside the link. */
  brand: 'nodejs' | 'npm';
  /** Link text — the version requirement. */
  version: string;
  /** Where the technology is downloaded / documented. */
  href: string;
  /** Muted qualifier shown after the link. */
  note: string;
}

/**
 * Node's floor is the engine range React Native 0.86 declares
 * (^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25), which is also what Expo SDK 54+
 * builds against — older Node lines fail before plocks is even reached.
 */
export const GETTING_STARTED_PREREQUISITES: GettingStartedPrerequisite[] = [
  {
    label: 'Node.js',
    brand: 'nodejs',
    version: '20.19.4 or newer',
    href: 'https://nodejs.org/en/download',
    note: 'An active LTS release (22.x or 24.x) is the safest choice',
  },
  {
    label: 'npm',
    brand: 'npm',
    version: '10 or newer',
    href: 'https://www.npmjs.com',
    note: 'Bundled with Node.js',
  },
];

/** Install → provider → first render. Each step is one command or one file. */
export const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    title: 'Install with npm',
    lead: 'Add [@plocks/ui](https://www.npmjs.com/package/@plocks/ui) to your React Native or Expo project:',
    code: 'npm install @plocks/ui',
    note: 'Date pickers, charts, code blocks, media players, the carousel, Spotlight, brand logos, QR codes and emoji picking are separate packages — @plocks/dates, @plocks/charts, @plocks/code, @plocks/media, @plocks/carousel, @plocks/spotlight, @plocks/brands, @plocks/qrcode and @plocks/emoji-picker. Install the ones you use.',
    language: 'bash',
  },
  {
    title: 'Install the peer dependencies',
    lead: 'plocks builds on a handful of packages your app provides. On Expo, install them with expo install so the versions match your SDK:',
    code: `npx expo install \\
    react-native-reanimated \\
    react-native-safe-area-context \\
    react-native-svg`,
    language: 'bash',
    // Optional integrations (expo-audio, expo-haptics, expo-linear-gradient, @shopify/flash-list, and others) are loaded lazily.
  },
  {
    title: 'Set up the provider',
    lead: 'Wrap your root component with PlocksProvider to enable theming:',
    fileName: 'App.tsx',
    language: 'tsx',
    code: `import { PlocksProvider } from '@plocks/ui';
import { YourApp } from './YourApp';

export function Demo() {
  return (
    <PlocksProvider>
      <YourApp />
    </PlocksProvider>
  );
}`,
  },
  {
    title: 'Verify the install',
    lead: 'Render a component to confirm everything is wired up:',
    fileName: 'TestComponent.tsx',
    code: `import { Text, Button, Block } from '@plocks/ui';

export function Demo() {
  return (
    <Button
      title='It works!'
      variant='filled'
      onPress={() => console.log('Success!')}
    />
  )
}`,
  },
];
