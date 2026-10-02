# Markdown

Markdown component provides a way to render Markdown content with custom styling and component mapping. It supports standard Markdown syntax including headers, lists, code blocks, and more.

## Metadata

- Import: `import { Markdown } from '@plocks/code';`
- Install: `npm install @plocks/code` — a separate package from `@plocks/ui`
- Docs: https://plocks.dev/components/Markdown
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/code/src/components/Markdown

## Props

- `children` (required): string — Markdown source.
- `defaultCodeLanguage`: string — Language for code fences that don't name one (default `tsx`).
- `maxHeadingLevel`: number — Deepest heading level rendered; deeper headings are clamped to it.
- `components`: Partial<MarkdownComponentMap> — Custom renderer overrides
- `onLinkPress`: (href: string) => void — Called when a markdown link is activated. Without it, links open with `Linking.openURL`. On web, modified clicks (new tab / window) are left to the browser.
- `ff`: string — Custom font family applied to all rendered prose (code keeps `theme.fontFamilyMono`)
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
export interface MarkdownComponentMap {
  heading: (props: { level: number; children: React.ReactNode }) => React.ReactNode;
  paragraph: (props: { children: React.ReactNode }) => React.ReactNode;
  strong: (props: { children: React.ReactNode }) => React.ReactNode;
  em: (props: { children: React.ReactNode }) => React.ReactNode;
  codeInline: (props: { children: string }) => React.ReactNode;
  codeBlock: (props: { code: string; language?: string }) => React.ReactNode;
  blockquote: (props: { children: React.ReactNode }) => React.ReactNode;
  list: (props: { ordered: boolean; items: React.ReactNode[] }) => React.ReactNode;
  listItem: (props: { children: React.ReactNode; index?: number; ordered?: boolean }) => React.ReactNode;
  link: (props: { href: string; children: React.ReactNode }) => React.ReactNode;
  image: (props: { src: string; alt?: string }) => React.ReactNode;
  thematicBreak: () => React.ReactNode;
  table: (props: {
    headers: React.ReactNode[];
    rows: React.ReactNode[][];
    alignments?: (TableAlignment | undefined)[];
  }) => React.ReactNode;
  tableCell: (props: {
    children: React.ReactNode;
    isHeader?: boolean;
    align?: TableAlignment;
  }) => React.ReactNode;
}
```

## Examples

### Basics

Simple markdown rendering with headers, lists, and text formatting.

```tsx
import { Block } from '@plocks/ui';
import { Markdown } from '@plocks/code';
import content from './content.md';

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{content}</Markdown>
    </Block>
  );
}
```

`content.md`

```md
# Hello Markdown

This is a **bold** statement and this is _italic_.

- Item one
- Item two
- Item three

> Blockquote with *inline emphasis* and **strong** text.

Inline code: `const x = 42;`
```

### Code Blocks

Markdown rendering with syntax-highlighted code blocks.

```tsx
import { Block } from '@plocks/ui';
import { Markdown } from '@plocks/code';
import content from './content.md';

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{content}</Markdown>
    </Block>
  );
}
```

`content.md`

```md
Here's some JavaScript:

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```

And some TypeScript:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = {
  id: 1,
  name: "John Doe",
  email: "john@example.com"
};
```

Inline code: `const result = fibonacci(10);`
```

### Custom Components

Custom component mapping for markdown elements.

```tsx
import { Block, Card, Text } from '@plocks/ui';
import { Markdown, type MarkdownComponentMap } from '@plocks/code';
import content from './content.md';

// Keys match `MarkdownComponentMap`; anything not listed keeps the default renderer.
const CUSTOM_COMPONENTS: Partial<MarkdownComponentMap> = {
  heading: ({ level, children }) => (
    <Text
      variant={level === 1 ? 'h1' : 'h2'}
      size={level === 1 ? 'xl' : 'lg'}
      fw={level === 1 ? 'bold' : 'semibold'}
      c={level === 1 ? 'primary' : 'secondary'}
      mb={level === 1 ? 12 : 8}
    >
      {children}
    </Text>
  ),
  paragraph: ({ children }) => (
    <Text size="md" mb={8}>
      {children}
    </Text>
  ),
  blockquote: ({ children }) => (
    <Card p={12} variant="outline" bg="muted" mb={8}>
      <Text size="sm" style={{ fontStyle: 'italic' }}>
        {children}
      </Text>
    </Card>
  ),
};

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown components={CUSTOM_COMPONENTS}>{content}</Markdown>
    </Block>
  );
}
```

`content.md`

```md
# Custom styled Markdown

## This is a subtitle

This paragraph uses custom styling and components.

> This blockquote is rendered with a custom Card component and muted background.

Regular paragraph text with default styling.
```

### Inline Usage

Using markdown inline within other text content.

```tsx
import { Block, Text } from '@plocks/ui';
import { Markdown } from '@plocks/code';
import content from './content.md';

export function Demo() {
  const [inlineContent, formatting, code] = content.trim().split(/\n\s*\n/);

  return (
    <Block fullWidth>
      <Text size="md" as="div">
        Inline markdown: <Markdown>{inlineContent}</Markdown>
      </Text>

      <Text size="md" as="div">
        Mix with regular text: Here's some regular text, then <Markdown>{formatting}</Markdown> and
        back to regular.
      </Text>

      <Text size="md" as="div">
        Code in context: Use <Markdown>{code}</Markdown> to declare a variable.
      </Text>
    </Block>
  );
}
```

`content.md`

```md
This is **bold text** and this is *italic text* with `inline code`.

**markdown formatting**

`const x = 42;`
```

### Media & Tables

Markdown with images, links, tables, and horizontal rules.

```tsx
import { Block } from '@plocks/ui';
import { Markdown } from '@plocks/code';
import content from './content.md';

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{content}</Markdown>
    </Block>
  );
}
```

`content.md`

```md
# Images

![plocks logo](https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png)

## Links

Visit [plocks.dev](https://plocks.dev) for more examples.

## Tables

| Feature | Status | Notes |
| --- | --- | --- |
| **Text Formatting** | ✅ | Bold, _italic_, `code` |
| Code Blocks | ✅ | Syntax highlighting |
| Tables | ✅ | Responsive layout |
| Images | ✅ | Auto-sizing |
| [Links](https://plocks.dev) | ✅ | External navigation |
```

### Table Support

Markdown tables with proper formatting and styling.

```tsx
import { Block } from '@plocks/ui';
import { Markdown } from '@plocks/code';
import content from './content.md';

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{content}</Markdown>
    </Block>
  );
}
```

`content.md`

```md
| Feature | Status | **Priority** | Notes |
|---------|--------|-------------|--------|
| Authentication | ✅ | **High** | _Complete_ |
| User Management | 🔄 | **Medium** | In progress |
| Analytics | ❌ | **Low** | `Not started` |
| API Integration | ✅ | **High** | [Documentation](https://example.com) |
```
