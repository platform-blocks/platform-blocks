import { useState } from 'react';
import { Knob } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(90);

  return (
    <Knob accessibilityLabel="Level"
      value={value}
      onChange={setValue}
      valueLabel={{
        formatter: (current) => Math.round(current),
        suffix: '°',
      }}
    />
  );
}
