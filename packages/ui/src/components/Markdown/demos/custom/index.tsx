import { Block, Card, Markdown, Text } from '@platform-blocks/ui';
import type { MarkdownComponentMap } from '@platform-blocks/ui';

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

const CONTENT = `# Custom styled Markdown

## This is a subtitle

This paragraph uses custom styling and components.

> This blockquote is rendered with a custom Card component and muted background.

Regular paragraph text with default styling.
`;

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown components={CUSTOM_COMPONENTS}>{CONTENT}</Markdown>
    </Block>
  );
}
