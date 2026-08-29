import { useState } from 'react';
import { Knob } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState(90);

  return (
    <Knob
      value={value}
      onChange={setValue}
      valueLabel={{
        formatter: (current) => Math.round(current),
        suffix: '°',
      }}
    />
  );
}
