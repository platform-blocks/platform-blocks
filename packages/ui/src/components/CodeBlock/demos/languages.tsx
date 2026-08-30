import { CodeBlock, Flex } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Flex direction="column" gap={16}>
      <CodeBlock language="tsx" title="React Component">
        {`interface Props {
  title: string;
  onPress?: () => void;
}

export const Button: React.FC<Props> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};`}
      </CodeBlock>

      <CodeBlock language="json" title="Package Configuration">
        {`{
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
}`}
      </CodeBlock>

      <CodeBlock language="markdown" title="Documentation">
        {`# Getting Started

This is a **markdown** example with \`inline code\`.

## Features

- Syntax highlighting
- Multiple languages
- Copy functionality

> Blockquote with *emphasis* and **bold** text.`}
      </CodeBlock>
    </Flex>
  );
}
