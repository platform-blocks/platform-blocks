<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">@plocks/spotlight</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/plocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@plocks/spotlight)](https://www.npmjs.com/package/@plocks/spotlight)

</div>

A command palette (⌘K search) for plocks. Part of [plocks](https://plocks.dev/): it builds on `@plocks/ui` and reads the same theme.

Contains `Spotlight` and the `spotlight` store (`open`, `close`, `toggle`).

## Installation

```bash
npm install @plocks/ui @plocks/spotlight
```

## Usage

Render inside the `PlocksProvider` from `@plocks/ui`:

```tsx
import { Spotlight, spotlight } from '@plocks/spotlight';

<Spotlight actions={actions} shortcut={['mod+k']} />
// open it from anywhere
spotlight.open();
```

See [plocks.dev](https://plocks.dev/) for every component, prop and example.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
