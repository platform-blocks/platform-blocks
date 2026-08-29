import { Block, Card, Text, Title } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Title>Default section heading</Title>
        <Text size="sm" color="secondary">
          Titles default to order 2, making them a natural choice for section headings.
        </Text>
      </Block>
    </Card>
  );
}
