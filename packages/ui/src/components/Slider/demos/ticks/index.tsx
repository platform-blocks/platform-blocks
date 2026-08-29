import { useState } from 'react';
import { Slider, Block } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState(50);

  return (
    <Block w={400}>
      <Slider
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        showTicks
        restrictToTicks
        ticks={[
          { value: 0, label: 'Min' },
          { value: 25 },
          { value: 50, label: 'Mid' },
          { value: 75 },
          { value: 100, label: 'Max' },
        ]}

      />
    </Block>
  );
}
