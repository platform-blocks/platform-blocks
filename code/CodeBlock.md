# CodeBlock

CodeBlock displays source code with syntax highlighting and optional copy controls.

## Metadata

- Import: `import { CodeBlock } from '@plocks/code';`
- Install: `npm install @plocks/code` — a separate package from `@plocks/ui`
- Tags: code, syntax, formatting, developer, github
- Docs: https://plocks.dev/components/CodeBlock
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/code/src/components/CodeBlock

## Props

- `language`: string = 'tsx' — Optional language for syntax highlighting
- `children`: string — Source to display. Optional when `files` is provided.
- `files`: CodeBlockFile[] — The block's source files. One entry renders its name as a header label; several render as switchable tabs. `children` is ignored while `files` is set, and a lone entry may omit `code` to keep using `children`.
- `defaultFile`: string — File name that starts active (uncontrolled). Defaults to the first file.
- `activeFile`: string — Active file name (controlled). Pair with `onFileChange`.
- `onFileChange`: (fileName: string) => void — Fired when the reader switches tabs
- `title`: string — Optional title displayed above the code block
- `showLineNumbers`: boolean = false — Show line numbers in the code block
- `highlight`: boolean = true — Enable syntax highlighting
- `fullWidth`: boolean = true — Make the code block take the full width of its container
- `radius`: RadiusValue = DEFAULT_CODE_RADIUS — Corner radius of the code surface (size token or px). Set `'none'` to sit flush inside a bordered container such as `Card.Section`.
- `withBorder`: boolean = true — Draw the code surface's 1px border. Defaults to `true`.
- `showCopyButton`: boolean = true — Show a copy button (accessible name "Copy code", "Copied" after a successful copy, which is also announced to screen readers).
- `onCopy`: (code: string) => void — Callback after the copy button copied the code
- `textStyle`: StyleProp<TextStyle> — Custom styles for the code text
- `titleStyle`: StyleProp<TextStyle> — Custom styles for the title text
- `highlightLines`: Array<string | number> — Lines to highlight, e.g. ["1", "3-5"] or [1, 3]
- `spoiler`: boolean = false — Show a spoiler for the code block
- `spoilerMaxHeight`: number = 160 — Maximum height for the spoiler, if exceeded a "Show More" button appears
- `variant`: 'code' | 'terminal' | 'hacker' = 'code' — Visual variant: default code styling, terminal emulation, or hacker theme
- `promptSymbol`: string = '$' — Optional prompt prefix for terminal variant (ignored if lines already prefixed)
- `githubUrl`: string — GitHub URL for the source shown here. Adds an edit button beside the copy button that opens it. Per-file URLs (`files[].githubUrl`) win over this one, so a multi-file block points each tab at its own source.
- `fileHeader`: boolean = false — Render the file name in a detached bar above the panel instead of inline inside it. Single-file blocks only — tabs always sit inside the panel.
- `colors`: CodeBlockColorOverrides — Override base colors (background, text, highlights)
- `wrap`: boolean = true — Control whether long lines wrap (defaults to true). Set to false to enable horizontal scrolling instead.
- `ff`: string — Custom font family for the code text (overrides `theme.fontFamilyMono`)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface CodeBlockFile {
  /** File name shown on the tab, e.g. `data.ts` */
  name: string;
  /** Source displayed while this file is active. Falls back to `children`. */
  code?: string;
  /** Highlighting language. Inferred from the file extension when omitted. */
  language?: string;
  /** Replaces the extension-derived tab icon */
  icon?: React.ReactNode;
  /** Lines to highlight for this file only */
  highlightLines?: Array<string | number>;
  /**
   * GitHub URL for this file, opened by the header's edit button while this tab
   * is active. Falls back to the block-level `githubUrl` when omitted.
   */
  githubUrl?: string;
}

export interface CodeBlockColorOverrides {
  /** Background color (hex, rgb, or theme token like `primary.6`) */
  background?: string;
  /** Border/accent color (hex/rgb/theme token) */
  border?: string;
  /** Override text/token colors. Accepts a single color, an array, or a token map. */
  text?: CodeBlockTextPalette;
  /** Highlight colors for emphasized lines */
  highlight?: {
    background?: string;
  };
}

export type CodeBlockTextPalette =
  | string
  | string[]
  | Partial<Record<CodeBlockToken, string>>;
```

## Examples

### Basics

Default CodeBlock showing a single snippet with automatic language detection and copy controls.

```tsx
import { Block } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const sample = `import { View, Text } from 'react-native';

export function HelloWorld() {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock>{sample}</CodeBlock>
    </Block>
  );
}
```

### Interactive

Pass `onCopy` to run your own feedback after the copy button copies the code.

```tsx
import { useState } from 'react';

import { Block, Text } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const sampleCode = `const greeting = "Hello, World!";
console.log(greeting);

// A simple function
function add(a, b) {
  return a + b;
}

const result = add(5, 3);
console.log(\`5 + 3 = \${result}\`);`;

export function Demo() {
  const [copiedLength, setCopiedLength] = useState<number | null>(null);

  return (
    <Block fullWidth>
      <CodeBlock
        language="javascript"
        title="Interactive copy example"
        onCopy={(code) => setCopiedLength(code.length)}
      >
        {sampleCode}
      </CodeBlock>
      {copiedLength !== null && (
        <Text size="xs" c="success">
          Copied {copiedLength} characters to the clipboard.
        </Text>
      )}
    </Block>
  );
}
```

### File tabs

Pass `files` to show one source per tab. Each tab carries its language's logo where one exists (TypeScript, CSS) and a glyph otherwise, and highlighting follows the active file's language — `data.ts` highlights as TypeScript even though the block's `language` is `tsx`.

```tsx
import { Block } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const FILES = [
  {
    name: 'index.tsx',
    code: `import { Blockquote } from '@plocks/ui';

import { AUTHOR, QUOTE } from './data';

export function Demo() {
  return <Blockquote author={AUTHOR}>{QUOTE}</Blockquote>;
}`,
  },
  {
    name: 'data.ts',
    code: `export const AUTHOR = {
  name: 'Priya Shah',
  title: 'CTO',
  organization: 'Northwind Labs',
};

export const QUOTE = 'The components feel native on every platform.';`,
  },
  {
    name: 'quote.css',
    code: `.quote {
  border-left: 4px solid var(--primary-5);
  padding: 16px 20px;
}`,
  },
  {
    name: 'theme.json',
    code: `{
  "primaryColor": "blue",
  "defaultRadius": "md"
}`,
  },
];

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock files={FILES} />
    </Block>
  );
}
```

### GitHub

Surface GitHub shortcuts alongside copy controls across variants using the `githubUrl` prop.

```tsx
import { Block, Text } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const componentExample = `import { View, Text } from 'react-native';

export function HelloWorld() {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
}`;

const inlineExample = `// This code has both copy and GitHub buttons
export function MyComponent() {
  return <div>Hello with GitHub button!</div>;
}`;

const terminalExample = `$ npm install @plocks/ui
$ npm start
Server running on http://localhost:3000`;

const floatingExample = `// Floating buttons example (no title)
export function FloatingExample() {
  return <span>Hover to see buttons</span>;
}`;

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text size="sm" fw="semibold">
          Basic component
        </Text>
        <CodeBlock
          title="Basic component"
          githubUrl="https://github.com/platform-blocks/plocks/blob/main/packages/ui/src/components/Button/Button.tsx"
        >
          {componentExample}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          File name and language
        </Text>
        <CodeBlock
          files={[{ name: 'example.tsx' }]}
          githubUrl="https://github.com/platform-blocks/plocks/blob/main/packages/ui/src/components/Text/Text.tsx"
        >
          {inlineExample}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          Terminal variant
        </Text>
        <CodeBlock
          variant="terminal"
          title="Terminal example"
          githubUrl="https://github.com/platform-blocks/plocks/blob/main/apps/docs/eas-build-post-install.sh"
        >
          {terminalExample}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          Floating controls
        </Text>
        <CodeBlock githubUrl="https://github.com/platform-blocks/plocks/blob/main/packages/code/src/components/CodeBlock/CodeBlock.tsx">
          {floatingExample}
        </CodeBlock>
      </Block>
    </Block>
  );
}
```

### Languages

Examples highlighting TypeScript, JSON, and Markdown syntax rendering in CodeBlock.

```tsx
import { Block } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const tsxExample = `interface Props {
  title: string;
  onPress?: () => void;
}

export function Button({ title, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}`;

const jsonExample = `{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.72.0"
  },
  "scripts": {
    "start": "expo start",
    "build": "expo build"
  }
}`;

const markdownExample = `# Getting Started

This is a **markdown** example with \`inline code\`.

## Features

- Syntax highlighting
- Multiple languages
- Copy functionality

> Blockquote with *emphasis* and **bold** text.`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock language="tsx" title="React component">
        {tsxExample}
      </CodeBlock>
      <CodeBlock language="json" title="Package configuration">
        {jsonExample}
      </CodeBlock>
      <CodeBlock language="markdown" title="Documentation">
        {markdownExample}
      </CodeBlock>
    </Block>
  );
}
```

### Features

Add a `title` and `showLineNumbers` for a labeled, numbered block, or set `showCopyButton={false}` to hide the copy button.

```tsx
import { Block } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const fibonacciExample = `function fibonacci(n) {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate the 10th Fibonacci number
const result = fibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`;

const disabledCopyExample = `// This example has the copy button disabled
const message = "Hello, World!";
console.log(message);`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock title="With title and line numbers" showLineNumbers>
        {fibonacciExample}
      </CodeBlock>
      <CodeBlock title="No copy button" showCopyButton={false}>
        {disabledCopyExample}
      </CodeBlock>
    </Block>
  );
}
```

### Variants

Compare the default, terminal, and hacker themes available through the variant prop.

```tsx
import { Block, Text } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const sampleCode = `function hackTheMatrix() {
  const matrix = generateMatrix();
  console.log('Entering the matrix...');

  for (let i = 0; i < matrix.length; i += 1) {
    matrix[i].decrypt();
  }

  return 'Welcome to the real world.';
}`;

const terminalCode = `$ npm install @plocks/ui
$ cd my-app
$ npm start
Server running on port 3000`;

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text size="sm" fw="semibold">
          Default code block
        </Text>
        <CodeBlock language="javascript" title="matrix.js">
          {sampleCode}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          Terminal variant
        </Text>
        <CodeBlock variant="terminal" title="Terminal">
          {terminalCode}
        </CodeBlock>
      </Block>

      <Block>
        <Text size="sm" fw="semibold">
          Hacker variant
        </Text>
        <CodeBlock variant="hacker" language="javascript" title="hack.exe">
          {sampleCode}
        </CodeBlock>
      </Block>
    </Block>
  );
}
```

### Highlighting

Use highlightLines for single lines or ranges to draw attention to important snippets.

```tsx
import { Block } from '@plocks/ui';
import { CodeBlock } from '@plocks/code';

const sample = `import { View, Text } from 'react-native';

interface User {
  id: number;
  name: string; // highlighted
  active: boolean;
}

export function UserCard({ user }: { user: User }) {
  if (!user.active) {
    return null; // early return highlighted
  }
  return (
    <View style={{ padding: 8 }}>
      <Text>{user.name}</Text>
    </View>
  );
}

// Utility function (range highlighted)
export function filterActive(users: User[]) {
  return users.filter((u) => u.active);
}`;

export function Demo() {
  return (
    <Block fullWidth>
      <CodeBlock title="Highlighted lines" showLineNumbers highlightLines={['5', '11', '20-23']}>
        {sample}
      </CodeBlock>
    </Block>
  );
}
```
