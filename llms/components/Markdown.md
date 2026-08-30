# Markdown

Markdown component provides a way to render Markdown content with custom styling and component mapping. It supports standard Markdown syntax including headers, lists, code blocks, and more.

## Metadata

- Canonical name: `Markdown`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Markdown } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: data
- Docs: https://react-ui-library.com/components/Markdown
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Markdown

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | string | Yes |  |  |
| `defaultCodeLanguage` | string | No |  | Override default code block language guess |
| `maxHeadingLevel` | number | No |  | Max heading level to render (others downgraded) |
| `allowHtml` | boolean | No |  | Whether to render inline HTML literally (ignored for now) |
| `components` | Partial<MarkdownComponentMap> | No |  | Custom renderer overrides |
| `onLinkPress` | (href: string) => void | No |  | Optional handler invoked when a markdown link is pressed |
| `fontFamily` | string | No |  | Custom font family applied to all rendered text (overrides the theme font) |
| `ff` | string | No |  | Shorthand alias for `fontFamily` |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basic Usage
ID: `Markdown.basic` • Category: general

Simple markdown rendering with headers, lists, and text formatting.

```tsx
const CONTENT = `# Hello Markdown
This is a **bold** statement and this is _italic_.
- Item one
- Item two
- Item three
> Blockquote with *inline emphasis* and **strong** text.
Inline code: \`const x = 42;\``;
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Rendered using the default Markdown renderer
      </Text>
    </Block>
  );
}
```

### Code Blocks
ID: `Markdown.code` • Category: general

Markdown rendering with syntax-highlighted code blocks.

```tsx
const CONTENT = `# Code examples
Here's some JavaScript:
\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`
And some TypeScript:
\`\`\`typescript
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
\`\`\`
Inline code: \`const result = fibonacci(10);\``;
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Showcases fenced code blocks with syntax highlighting
      </Text>
    </Block>
  );
}
```

### Custom Components
ID: `Markdown.custom` • Category: general

Custom component mapping for markdown elements.

```tsx
const CUSTOM_COMPONENTS = {
  h1: ({ children, ...props }: any) => (
    <Text size="xl" weight="bold" color="primary" mb={12} {...props}>
      {children}
    </Text>
  ),
  h2: ({ children, ...props }: any) => (
    <Text size="lg" weight="semibold" color="accent" mb={8} {...props}>
      {children}
    </Text>
  ),
  p: ({ children, ...props }: any) => (
    <Text size="md" mb={8} {...props}>
      {children}
    </Text>
  ),
  blockquote: ({ children, ...props }: any) => (
    <Card p={12} variant="outline" bg="muted" mb={8} {...props}>
      <Text size="sm" style={{ fontStyle: 'italic' }}>
        {children}
      </Text>
    </Card>
  ),
};
const CONTENT = `# Custom styled Markdown
## This is a subtitle
This paragraph uses custom styling and components.
> This blockquote is rendered with a custom Card component and muted background.
Regular paragraph text with default styling.
`;
  return (
    <Block fullWidth>
      <Markdown components={CUSTOM_COMPONENTS}>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Headings, paragraphs, and quotes use custom renderers
      </Text>
    </Block>
  );
}
```

### Inline Usage
ID: `Markdown.inline` • Category: general

Using markdown inline within other text content.

```tsx
const inlineContent = 'This is **bold text** and this is *italic text* with `inline code`.';
  return (
    <Block fullWidth>
      <Text size="md" as="div">
        Inline markdown: <Markdown>{inlineContent}</Markdown>
      </Text>
      <Text size="md" as="div">
        Mix with regular text: Here's some regular text, then <Markdown>**markdown formatting**</Markdown> and
        back to regular.
      </Text>
      <Text size="md" as="div">
        Code in context: Use <Markdown>`const x = 42;`</Markdown> to declare a variable.
      </Text>
    </Block>
  );
}
```

### Media & Tables
ID: `Markdown.media` • Category: general

Markdown with images, links, tables, and horizontal rules.

```tsx
const CONTENT = `# Media in Markdown
## Images
![PlatformBlocks Logo](https://raw.githubusercontent.com/platform-blocks/react-ui-library/main/apps/react-ui-library.com/assets/favicon.png)
## Links
Visit the [PlatformBlocks Documentation](https://react-ui-library.com) for more examples.
## Tables
| Feature | Status | Notes |
|---------|--------|-------|
| **Text Formatting** | ✅ | Bold, _italic_, \`code\` |
| Code Blocks | ✅ | Syntax highlighting |
| Tables | ✅ | Responsive layout |
| Images | ✅ | Auto-sizing |
| [Links](https://react-ui-library.com) | ✅ | External navigation |
## Horizontal Rule
Content above the line.
---
Content below the line.`;
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Images, links, tables, and horizontal rules render inline
      </Text>
    </Block>
  );
}
```

### Table Support
ID: `Markdown.table` • Category: general

Markdown tables with proper formatting and styling.

```tsx
const CONTENT = `# Table examples
## Basic table
| Name | Age | City |
|------|-----|------|
| John Doe | 30 | New York |
| Jane Smith | 25 | Los Angeles |
| Bob Johnson | 35 | Chicago |
## Table with formatting
| Feature | Status | **Priority** | Notes |
|---------|--------|-------------|--------|
| Authentication | ✅ | **High** | _Complete_ |
| User Management | 🔄 | **Medium** | In progress |
| Analytics | ❌ | **Low** | \`Not started\` |
| API Integration | ✅ | **High** | [Documentation](https://example.com) |
## Table with code
| Language | Extension | Sample code |
|----------|-----------|-------------|
| TypeScript | \`.tsx\` | \`const x: string = "hello";\` |
| JavaScript | \`.js\` | \`function hello() { return "world"; }\` |
| Python | \`.py\` | \`def hello(): return "world"\` |
## Complex table
| Component | **Props** | _Description_ | Example |
|-----------|----------|-------------|---------|
| Button | \`variant\`, \`size\`, \`disabled\` | Interactive button element | \`<Button variant="filled">Click me</Button>\` |
| Input | \`placeholder\`, \`value\`, \`onChange\` | Text input field | \`<Input placeholder="Enter text" />\` |
| Card | \`variant\`, \`padding\` | Container component | \`<Card variant="outline">Content</Card>\` |`;
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Multiple table layouts rendered with Markdown
      </Text>
    </Block>
  );
}
```
