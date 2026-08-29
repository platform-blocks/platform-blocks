import { Block, Card, Spoiler, Text } from '@platform-blocks/ui';

const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Integer tincidunt condimentum risus, sit amet cursus massa fermentum non.';

const examples = [
  { key: 'small', label: '60px height', maxHeight: 60 },
  { key: 'medium', label: '100px height', maxHeight: 100 },
  { key: 'large', label: '150px height', maxHeight: 150 },
];

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Adjust maxHeight to control how much text stays visible before the rest collapses behind the toggle.
        </Text>
        <Block>
          {examples.map((example) => (
            <Block key={example.key}>
              <Text size="xs" color="secondary">
                {example.label}
              </Text>
              <Spoiler maxHeight={example.maxHeight}>
                <Text size="sm">{longText}</Text>
              </Spoiler>
            </Block>
          ))}
        </Block>
      </Block>
    </Card>
  );
}
