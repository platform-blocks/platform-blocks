/**
 * Plain-data source of truth for the Getting Started page.
 *
 * Kept free of JSX (like config/faq.ts) so it can be consumed both by the
 * screen and by the static build steps that run in Node — scripts/generate-llms.ts
 * renders these steps into /llms/guides/getting-started.md.
 */

export interface GettingStartedStep {
  title: string;
  lead: string;
  code: string;
  /** File name shown on the code block. Omitted for shell commands. */
  fileName?: string;
  variant?: 'terminal';
  language?: string;
  note?: string;
}

export const GETTING_STARTED_SUBTITLE =
  'Install Platform Blocks, wire up the provider, and render your first component.';

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
 * builds against — older Node lines fail before Platform Blocks is even reached.
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
    lead: 'Add Platform Blocks to your React Native or Expo project:',
    code: 'npm install @platform-blocks/ui',
    // variant: 'terminal',
    // note: 'This installs the core library — every component, hook, and utility.',
    language: 'bash',
  },
  {
    title: 'Install the peer dependencies',
    lead: 'Platform Blocks builds on a handful of packages your app provides. On Expo, install them with expo install so the versions match your SDK:',
    code: `npx expo install react-native-reanimated react-native-safe-area-context react-native-svg @tabler/icons-react-native`,
    // variant: 'terminal',
    language: 'bash',
    // note: '@tabler/icons-react-native backs the Icon registry, which is imported from the package root — without it, Icon and every component that renders one will fail to resolve. Optional integrations (expo-audio, expo-haptics, expo-linear-gradient, @shopify/flash-list, and others) are loaded lazily and only needed for the features that use them.',
  },
  {
    title: 'Set up the provider',
    lead: 'Wrap your root component with PlatformBlocksProvider to enable theming:',
    fileName: 'App.tsx',
    code: `import React from 'react';
import { PlatformBlocksProvider } from '@platform-blocks/ui';
import { YourApp } from './YourApp';

export default function App() {
  return (
    <PlatformBlocksProvider>
      <YourApp />
    </PlatformBlocksProvider>
  );
}`,
  },
  {
    title: 'Verify the install',
    lead: 'Render a component to confirm everything is wired up:',
    fileName: 'TestComponent.tsx',
    code: `import React from 'react';
import { Text, Button, Card } from '@platform-blocks/ui';

export function TestComponent() {
  return (
    <Card variant='outline'>
      <Text variant='h2'>
        Welcome to PlatformBlocks! 🎉
      </Text>
      <Button
        title='It works!'
        variant='filled'
        onPress={() => console.log('Success!')}
      />
    </Card>
  );
}`,
  },
];
