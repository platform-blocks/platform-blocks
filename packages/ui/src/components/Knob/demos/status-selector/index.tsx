import { useMemo, useState } from 'react';
import { Block, Icon, Knob } from '@platform-blocks/react-ui-library';

import { STATUS_SCENES } from './data';

export function Demo() {
  const [value, setValue] = useState(0);

  const statusMarks = useMemo(
    () => STATUS_SCENES.map(scene => ({
      ...scene,
      icon: <Icon name={scene.iconName} size="3xl" color={scene.accentColor} />,
    })),
    []
  );

  const activeStatus = useMemo(
    () => statusMarks.reduce((closest, mark) => (
      Math.abs(mark.value - value) < Math.abs(closest.value - value) ? mark : closest
    ), statusMarks[0]),
    [statusMarks, value]
  );

  return (
    <Block>
      <Knob
        value={value}
        onChange={setValue}
        min={0}
        max={360}
        step={90}
        my="3xl"
        marks={statusMarks}
        restrictToMarks
        behavior="status"
        size={200}
        valueLabel={{
          position: 'center',
          formatter: () => activeStatus.label,
        }}
      />
    </Block>
  );
}
