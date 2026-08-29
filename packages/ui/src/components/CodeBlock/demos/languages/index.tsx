import { Block, CodeBlock, Text } from '@platform-blocks/ui';

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
      <Text weight="semibold">Language presets</Text>
      <Text size="sm" color="secondary">
        CodeBlock detects syntax styles across languages like TypeScript, JSON, and Markdown.
      </Text>
      <Block>
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
    </Block>
  );
}
