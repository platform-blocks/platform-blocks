import { CopyButton, Card, Flex, Text } from '@platform-blocks/react-ui-library';

const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.long.payload.value.with.many.sections.and.characters.for.demo.purposes.only';

export function Demo() {
  return (
    <Card p={16} variant="outline">
      <Flex direction="column" gap={12}>
        <Text size="sm" weight="semibold">JWT Token</Text>
        <Text size="xs" style={{ maxWidth: 520 }}>{longToken}</Text>
        <CopyButton value={longToken} iconOnly={false} label="Copy Token" />
      </Flex>
    </Card>
  );
}
