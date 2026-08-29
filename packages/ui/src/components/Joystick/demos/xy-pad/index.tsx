import { useState } from 'react';
import { Flex, Joystick, Text } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState({ x: -0.4, y: 0.6 });

  // Map the pad onto a pair of parameters the way an effect unit would.
  const cutoff = Math.round(((value.x + 1) / 2) * 18000 + 200);
  const resonance = ((value.y + 1) / 2).toFixed(2);

  return (
    <Flex direction="column" gap="md">
      <Joystick
        shape="square"
        size="lg"
        value={value}
        onChange={setValue}
        showCrosshair
        label="Filter"
      />
      <Text size="sm" c="dimmed">Cutoff {cutoff} Hz · Resonance {resonance}</Text>
    </Flex>
  );
}
