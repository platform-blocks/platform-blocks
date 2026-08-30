# Getting started

Install react-ui-library, wire up the provider, and render your first component.

Docs: https://react-ui-library.com/getting-started

**Prerequisites:**

- [Node.js 20.19.4 or newer](https://nodejs.org/en/download) — An active LTS release (22.x or 24.x) is the safest choice
- [npm 10 or newer](https://www.npmjs.com) — Bundled with Node.js

## Install with npm

Add [@platform-blocks/react-ui-library](https://www.npmjs.com/package/@platform-blocks/react-ui-library) to your React Native or Expo project:

```tsx
npm install @platform-blocks/react-ui-library
```

## Install the peer dependencies

React UI Library builds on a handful of packages your app provides. On Expo, install them with expo install so the versions match your SDK:

```tsx
npx expo install \
    react-native-reanimated \
    react-native-safe-area-context \
    react-native-svg \
    @tabler/icons-react-native
```

## Set up the provider

Wrap your root component with PlatformBlocksProvider to enable theming:

`App.tsx`

```tsx
import React from 'react';
import { PlatformBlocksProvider } from '@platform-blocks/react-ui-library';
import { YourApp } from './YourApp';

export default function App() {
  return (
    <PlatformBlocksProvider>
      <YourApp />
    </PlatformBlocksProvider>
  );
}
```

## Verify the install

Render a component to confirm everything is wired up:

`TestComponent.tsx`

```tsx
import React from 'react';
import { Text, Button, Card } from '@platform-blocks/react-ui-library';

export function TestComponent() {
  return (
    <Card variant='outline'>
      <Text variant='h2'>
        Welcome to React UI Library! 🎉
      </Text>
      <Button
        title='It works!'
        variant='filled'
        onPress={() => console.log('Success!')}
      />
    </Card>
  );
}
```

## Templates

To use a template, open it on GitHub and click the "Use this template" button — GitHub creates a fresh repository from it under your account. Expo templates also work with npx create-expo-app@latest my-app --template <repo-url>. Every template ships with React UI Library, its peer dependencies, and the provider already set up.

- [expo-template](https://github.com/platform-blocks/expo-template) — Full-featured Expo Router app targeting iOS, Android, and web — dark mode, testing, and linting wired up. (Expo, iOS, Android, Web)
- [expo-min-template](https://github.com/platform-blocks/expo-min-template) — Minimal Expo app — a single screen with the provider set up and nothing else to delete. (Expo, Minimal)
- [universal-template](https://github.com/platform-blocks/universal-template) — Cross-platform Expo app with statically rendered web output — one codebase shipping native apps and a real website. (Expo, iOS, Android, Web, Static web)
- [native-template](https://github.com/platform-blocks/native-template) — iOS and Android only — no web configuration, for teams shipping mobile apps exclusively. (Expo, iOS, Android)
- [web-template](https://github.com/platform-blocks/web-template) — React Native Web only — React UI Library components in a web-first single-page app. (Web, React Native Web)
- react-native-template (coming soon) — Bare React Native (community CLI, no Expo) with native projects checked in and peer dependencies linked. (React Native CLI, iOS, Android)
