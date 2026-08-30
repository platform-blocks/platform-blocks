import { CopyButton, Card, Flex, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Card p={16} variant="outline">
      <Flex direction="column" gap={12}>
        <Text size="sm" weight="semibold">API Key</Text>
        <Flex direction="row" gap={8} align="center">
          <Text size="xs" style={{ maxWidth: 240 }}>sk_live_1a2b3c4d5e6f7g8h9i10</Text>
          <CopyButton value="sk_live_1a2b3c4d5e6f7g8h9i10" iconOnly={false} label="Copy Key" />
        </Flex>
      </Flex>
    </Card>
  );
}
