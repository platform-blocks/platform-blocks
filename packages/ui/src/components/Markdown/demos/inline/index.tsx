import { Block, Markdown, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
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
