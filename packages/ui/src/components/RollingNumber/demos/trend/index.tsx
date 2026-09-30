import { useState } from 'react';
import { Button, Flex, RollingNumber, Text } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(19);

  return (
    <Flex direction="column" gap="lg">
      <Flex gap="xl">
        <Flex direction="column" align="center" gap="xs">
          <Text size="xs" c="muted">Auto</Text>
          <RollingNumber value={value} size={32} />
        </Flex>
        <Flex direction="column" align="center" gap="xs">
          <Text size="xs" c="muted">Always up</Text>
          <RollingNumber value={value} trend={1} size={32} />
        </Flex>
        <Flex direction="column" align="center" gap="xs">
          <Text size="xs" c="muted">Per digit</Text>
          <RollingNumber value={value} trend={0} size={32} />
        </Flex>
      </Flex>

      <Flex gap="sm" justify="center">
        <Button variant="outline" onPress={() => setValue((current) => current - 1)}>−1</Button>
        <Button variant="outline" onPress={() => setValue((current) => current + 1)}>+1</Button>
      </Flex>
    </Flex>
  );
}
