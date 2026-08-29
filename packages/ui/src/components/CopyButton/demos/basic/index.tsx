import { CopyButton, Card, Flex, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Card p={16} variant="outline">
      <Flex direction="row" align="center" gap={12}>
        <Text size="sm">Invite Code:</Text>
        <Text weight="semibold">ABCD-1234</Text>
        <CopyButton value="ABCD-1234" />
      </Flex>
    </Card>
  );
}
