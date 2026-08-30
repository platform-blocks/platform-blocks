import { useState } from 'react';
import { Flex, Joystick, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const position = pan.x === 0
    ? 'Center'
    : `${pan.x < 0 ? 'L' : 'R'} ${Math.round(Math.abs(pan.x) * 100)}`;

  return (
    <Flex direction="column" gap="md" align="flex-start">
      <Joystick
        label="Pan"
        lockAxis="x"
        size="sm"
        value={pan}
        onChange={setPan}
      />
      <Text size="sm" c="dimmed">{position}</Text>
    </Flex>
  );
}
