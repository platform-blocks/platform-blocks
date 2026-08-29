import { Block, Card, Spoiler, Text } from '@platform-blocks/ui';

const paragraphs = [
  'Spoilers collapse long sections of copy while keeping the content accessible to screen readers and keyboard users.',
  'Use them for optional detail or secondary information that might distract from a primary task. They expand inline, so the surrounding layout stays stable.',
];

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Keep the initial height short to hint that more detail is available without overwhelming the layout.
        </Text>
        <Spoiler maxHeight={96}>
          <Block>
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} size="sm">
                {paragraph}
              </Text>
            ))}
          </Block>
        </Spoiler>
      </Block>
    </Card>
  );
}
