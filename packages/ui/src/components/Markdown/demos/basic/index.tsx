import { Block, Markdown, Text } from '@platform-blocks/ui';

const CONTENT = `# Hello Markdown

This is a **bold** statement and this is _italic_.

- Item one
- Item two
- Item three

> Blockquote with *inline emphasis* and **strong** text.

Inline code: \`const x = 42;\``;

export function Demo() {
  return (
    <Block fullWidth>
      <Markdown>{CONTENT}</Markdown>
      <Text size="sm" color="secondary">
        Rendered using the default Markdown renderer
      </Text>
    </Block>
  );
}
