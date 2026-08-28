import { useState } from 'react';
import { Flex, Joystick } from '@platform-blocks/ui';

export default function Demo() {
  const [free, setFree] = useState({ x: 0, y: 0 });
  const [stepped, setStepped] = useState({ x: 0, y: 0 });

  return (
    <Flex gap="xl" wrap="wrap">
      <Joystick
        label="Dead zone 0.25"
        deadZone={0.25}
        value={free}
        onChange={setFree}
        valueLabel
      />
      <Joystick
        label="Step 0.25"
        shape="square"
        step={0.25}
        returnToCenter={false}
        value={stepped}
        onChange={setStepped}
        showCrosshair
        valueLabel
      />
    </Flex>
  );
}
