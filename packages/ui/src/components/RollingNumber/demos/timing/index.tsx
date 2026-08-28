import { useState } from 'react';
import { Button, Flex, RollingNumber, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [value, setValue] = useState(407219);

  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="xs">
        <Text size="xs" c="dimmed">Snappy — 200ms, no stagger</Text>
        <RollingNumber value={value} transitionDuration={200} size={32} thousandSeparator />
      </Flex>

      <Flex direction="column" gap="xs">
        <Text size="xs" c="dimmed">Odometer — 900ms, 60ms stagger</Text>
        <RollingNumber
          value={value}
          transitionDuration={900}
          timingFunction="ease-out"
          stagger={60}
          size={32}
          thousandSeparator
        />
      </Flex>

      <Button variant="outline" onPress={() => setValue(Math.floor(Math.random() * 999999))}>
        Shuffle
      </Button>
    </Flex>
  );
}
