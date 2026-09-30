import { Block, Card, Flex, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="span" size="sm" c="muted">direction="row"</Text>
        <Flex direction="row" gap="md">
          <Card p="sm"><Text>Item 1</Text></Card>
          <Card p="sm"><Text>Item 2</Text></Card>
          <Card p="sm"><Text>Item 3</Text></Card>
        </Flex>
      </Block>

      <Block>
        <Text variant="span" size="sm" c="muted">direction="column"</Text>
        <Flex direction="column" gap="md">
          <Card p="sm"><Text>Item 1</Text></Card>
          <Card p="sm"><Text>Item 2</Text></Card>
          <Card p="sm"><Text>Item 3</Text></Card>
        </Flex>
      </Block>
    </Block>
  );
}
