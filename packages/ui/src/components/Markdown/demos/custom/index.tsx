import { Block, Card, Markdown, Text } from '@platform-blocks/ui';

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

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown components={CUSTOM_COMPONENTS}>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Headings, paragraphs, and quotes use custom renderers
      </Text>
    </Block>
  );
}
