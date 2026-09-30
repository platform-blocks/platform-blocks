import { useState } from 'react';
import { Joystick } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState({ x: 0, y: 0 });

  return (
    <Joystick accessibilityLabel="Joystick"
      value={value}
      onChange={setValue}
      showCrosshair
      valueLabel
    />
  );
}
