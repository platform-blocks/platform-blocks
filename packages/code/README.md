<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">@plocks/code</h1>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/platform-blocks/plocks/blob/HEAD/LICENSE)
[![npm](https://img.shields.io/npm/v/@plocks/code)](https://www.npmjs.com/package/@plocks/code)

</div>

Code blocks with syntax highlighting, and Markdown rendering, for plocks. Part of [plocks](https://plocks.dev/): it builds on `@plocks/ui` and reads the same theme.

Contains `CodeBlock` and `Markdown`.

## Installation

```bash
npm install @plocks/ui @plocks/code
```

## Usage

Render inside the `PlocksProvider` from `@plocks/ui`:

```tsx
import { CodeBlock } from '@plocks/code';

<CodeBlock language="tsx">{`const hello = 'world';`}</CodeBlock>
```

See [plocks.dev](https://plocks.dev/) for every component, prop and example.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall)
