import React, { useState } from 'react';
import { CopyButton, Card, Flex, Text } from '@platform-blocks/ui';

export function Demo() {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  return (
    <Card p={16} variant="outline">
      <Flex direction="column" gap={12}>
        <Flex direction="row" gap={8} align="center">
          <Text size="sm">Secret:</Text>
          <Text weight="semibold">hunter2</Text>
          <CopyButton value="hunter2" disableToast onCopy={(v) => setCopiedValue(v)} iconOnly={false} label="Copy" />
        </Flex>
        {copiedValue && <Text size="xs" color="success">Copied locally: {copiedValue}</Text>}
      </Flex>
    </Card>
  );
}
