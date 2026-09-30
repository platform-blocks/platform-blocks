<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">@plocks/media</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/plocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@plocks/media)](https://www.npmjs.com/package/@plocks/media)

</div>

Audio player, video player and sound feedback for plocks. Part of [plocks](https://plocks.dev/): it builds on `@plocks/ui` and reads the same theme.

Contains `AudioPlayer`, `Video`, `SoundButton`, and `SoundProvider` / `useSound`. Install `expo-audio` for playback and sound feedback, and `react-native-webview` for YouTube sources on native.

## Installation

```bash
npm install @plocks/ui @plocks/media
```

## Usage

Render inside the `PlocksProvider` from `@plocks/ui`:

```tsx
import { AudioPlayer } from '@plocks/media';

<AudioPlayer source={{ uri: 'https://example.com/track.mp3' }} />
```

See [plocks.dev](https://plocks.dev/) for every component, prop and example.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
