# Getting started

Install plocks, wire up the provider, and render your first component.

Docs: https://plocks.dev/getting-started

**Prerequisites:**

- [Node.js 20.19.4 or newer](https://nodejs.org/en/download) — An active LTS release (22.x or 24.x) is the safest choice
- [npm 10 or newer](https://www.npmjs.com) — Bundled with Node.js

## Install with npm

Add [@plocks/ui](https://www.npmjs.com/package/@plocks/ui) to your React Native or Expo project:

```bash
npm install @plocks/ui
```

Date pickers, charts, code blocks, media players, the carousel, Spotlight, brand logos, QR codes and emoji picking are separate packages — @plocks/dates, @plocks/charts, @plocks/code, @plocks/media, @plocks/carousel, @plocks/spotlight, @plocks/brands, @plocks/qrcode and @plocks/emoji-picker. Install the ones you use.

## Install the peer dependencies

plocks builds on a handful of packages your app provides. On Expo, install them with expo install so the versions match your SDK:

```bash
npx expo install \
    react-native-reanimated \
    react-native-safe-area-context \
    react-native-svg
```

## Set up the provider

Wrap your root component with PlocksProvider to enable theming:

`App.tsx`

```tsx
import { PlocksProvider } from '@plocks/ui';
import { YourApp } from './YourApp';

export function Demo() {
  return (
    <PlocksProvider>
      <YourApp />
    </PlocksProvider>
  );
}
```

## Verify the install

Render a component to confirm everything is wired up:

`TestComponent.tsx`

```tsx
import { Text, Button, Block } from '@plocks/ui';

export function Demo() {
  return (
    <Button
      title='It works!'
      variant='filled'
      onPress={() => console.log('Success!')}
    />
  )
}
```

## Templates

Start a project from a template with the command below — it asks where to put the project and which template to use (pass `--template expo-min` after `--` to skip the question). Or open a template on GitHub and click "Use this template". Every template ships with plocks, its peer dependencies, and the provider already set up.

```bash
npm create plocks@latest
```

- [expo-template](https://github.com/platform-blocks/expo-template) — Full-featured Expo Router app targeting iOS, Android, and web — dark mode, testing, and linting wired up. (Expo, iOS, Android, Web)

  ```bash
  npm create plocks@latest -- --template expo
  ```
- [expo-min-template](https://github.com/platform-blocks/expo-min-template) — Minimal Expo app — a single screen with the provider set up and nothing else to delete. (Expo, Minimal)

  ```bash
  npm create plocks@latest -- --template expo-min
  ```
- [universal-template](https://github.com/platform-blocks/universal-template) — Cross-platform Expo app with statically rendered web output — one codebase shipping native apps and a real website. (Expo, iOS, Android, Web, Static web)

  ```bash
  npm create plocks@latest -- --template universal
  ```
- [native-template](https://github.com/platform-blocks/native-template) — iOS and Android only — no web configuration, for teams shipping mobile apps exclusively. (Expo, iOS, Android)

  ```bash
  npm create plocks@latest -- --template native
  ```
- [web-template](https://github.com/platform-blocks/web-template) — React Native Web only — plocks components in a web-first single-page app. (Web, React Native Web)

  ```bash
  npm create plocks@latest -- --template web
  ```
