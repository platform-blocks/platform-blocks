import { useMemo, useState } from 'react';
import { Block, Knob } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState(0);
  const normalizedAngle = useMemo(() => ((value % 360) + 360) % 360, [value]);
  const rotations = useMemo(() => value / 360, [value]);

  return (
    <Block fullWidth>
      <Knob
        value={value}
        onChange={setValue}
        behavior="endless"
        valueLabel={{
          formatter: () => `${Math.round(normalizedAngle)}°`,
          secondary: {
            formatter: () => `${rotations.toFixed(2)} turns`,
          },
        }}
      />
    </Block>
  );
}
