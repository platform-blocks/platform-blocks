import { Flex, Card, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Card variant="outline" p="md">
      <Flex gap="md">
        <Card p="sm">
          <Text variant="p">Item 1</Text>
        </Card>
        <Card p="sm">
          <Text variant="p">Item 2</Text>
        </Card>
        <Card p="sm">
          <Text variant="p">Item 3</Text>
        </Card>
      </Flex>
    </Card>
  );
}
