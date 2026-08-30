import { useMemo, useState } from 'react';

import { Block, Knob } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [cutoff, setCutoff] = useState(3200);
  const percent = useMemo(() => Math.round(((cutoff - 200) / (8000 - 200)) * 100), [cutoff]);

  return (
    <Block fullWidth>
      <Knob
        value={cutoff}
        onChange={setCutoff}
        min={200}
        max={8000}
        step={50}
        behavior="dual"
        size={180}
        valueLabel={{
          position: 'center',
          formatter: (val) => `${Math.round(val)} Hz`,
          secondary: {
            position: 'bottom',
            formatter: () => `${percent}% span`,
          },
        }}
        marks={[
          { value: 400, label: 'Warm' },
          { value: 1200, label: 'Neutral' },
          { value: 6400, label: 'Bright' },
        ]}
      />
    </Block>
  );
}
