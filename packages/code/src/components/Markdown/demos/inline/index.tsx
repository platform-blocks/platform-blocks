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
