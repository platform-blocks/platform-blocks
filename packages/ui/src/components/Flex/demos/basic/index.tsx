import { Card, Flex, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Flex gap="md" fullWidth>
      <Card p="sm">
        <Text>Item 1</Text>
      </Card>
      <Card p="sm">
        <Text>Item 2</Text>
      </Card>
      <Card p="sm">
        <Text>Item 3</Text>
      </Card>
    </Flex>
  );
}
