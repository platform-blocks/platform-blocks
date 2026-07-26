import { Block, Card, Spoiler, Text } from '@platform-blocks/ui';

const examples = [
  {
    key: 'open',
    label: 'Initially open',
    description:
      'Starts expanded by default so the reader sees the full content on first render.',
    props: { initiallyOpen: true },
  },
  {
    key: 'closed',
    label: 'Initially closed',
    description:
      'Keeps the section compact to emphasize surrounding UI until the user opts in.',
    props: {},
  },
];

const bodyCopy =
  'Vivamus fermentum orci eget tortor facilisis, eu egestas eros maximus. Fusce vitae semper libero. Pellentesque habitant morbi tristique senectus et netus.';

export default function Demo() {
  return (
    <Card p="md">
      <Block>
        <Text size="sm" colorVariant="secondary">
          Control whether the content renders expanded on mount or waits for user input. Both states remain accessible to assistive tech.
        </Text>
        <Block>
          {examples.map((example) => (
            <Block key={example.key}>
              <Text size="xs" colorVariant="secondary">
                {example.label}
              </Text>
              <Spoiler maxHeight={72} {...example.props}>
                <Text size="sm">{bodyCopy}</Text>
              </Spoiler>
              <Text size="xs" colorVariant="muted">
                {example.description}
              </Text>
            </Block>
          ))}
        </Block>
      </Block>
    </Card>
  );
}
