import { useState } from 'react';
import { Block, DataList, Knob } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState(32);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [committed, setCommitted] = useState(value);

  return (
    <Block direction="row" align="center" justify="space-evenly">
      <Knob
        value={value}
        onChange={setValue}
        onChangeEnd={setCommitted}
        onScrubStart={() => setIsScrubbing(true)}
        onScrubEnd={() => setIsScrubbing(false)}
      />
      <DataList
        data={[
          { label: 'Current', value: Math.round(value) },
          { label: 'Last commit', value: Math.round(committed) },
          { label: 'State', value: isScrubbing ? 'Scrubbing' : 'Idle' },
        ]}
      />
    </Block>
  );
}