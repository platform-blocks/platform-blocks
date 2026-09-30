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
