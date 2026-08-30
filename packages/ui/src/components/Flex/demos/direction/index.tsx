import { Block, Card, Flex, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="h4">Row Direction</Text>
        <Card variant="outline" p="md">
          <Flex direction="row" gap="md">
            <Card p="sm"><Text variant="p">Item 1</Text></Card>
            <Card p="sm"><Text variant="p">Item 2</Text></Card>
            <Card p="sm"><Text variant="p">Item 3</Text></Card>
          </Flex>
        </Card>
      </Block>

      <Block>
        <Text variant="h4">Column Direction</Text>
        <Card variant="outline" p="md">
          <Flex direction="column" gap="md">
            <Card p="sm"><Text variant="p">Item 1</Text></Card>
            <Card p="sm"><Text variant="p">Item 2</Text></Card>
            <Card p="sm"><Text variant="p">Item 3</Text></Card>
          </Flex>
        </Card>
      </Block>
    </Block>
  );
}
