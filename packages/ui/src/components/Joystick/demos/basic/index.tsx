import { useState } from 'react';
import { Joystick } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState({ x: 0, y: 0 });

  return (
    <Joystick
      value={value}
      onChange={setValue}
      showCrosshair
      valueLabel
    />
  );
}
