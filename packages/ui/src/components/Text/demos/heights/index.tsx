import { Block, Card, Text } from '@platform-blocks/react-ui-library';

const SAMPLE_TEXT =
  'This paragraph shows how line height changes the spacing between lines of text when content wraps across multiple lines.';

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Block>
          <Text variant="p" weight="medium">
            Tight line height (1.2)
          </Text>
          <Text lineHeight={1.2}>{SAMPLE_TEXT}</Text>
        </Block>

        <Block>
          <Text variant="p" weight="medium">
            Standard line height (1.5)
          </Text>
          <Text lineHeight={1.5}>{SAMPLE_TEXT}</Text>
        </Block>

        <Block>
          <Text variant="p" weight="medium">
            Relaxed line height (1.8)
          </Text>
          <Text lineHeight={1.8}>{SAMPLE_TEXT}</Text>
        </Block>

        <Block>
          <Text variant="p" weight="medium">
            Loose line height (2.0)
          </Text>
          <Text lineHeight={2}>{SAMPLE_TEXT}</Text>
        </Block>

        <Block>
          <Text variant="p" weight="medium">
            Absolute line height (24px)
          </Text>
          <Text lineHeight={24}>{SAMPLE_TEXT}</Text>
        </Block>
      </Block>
    </Card>
  );
}
