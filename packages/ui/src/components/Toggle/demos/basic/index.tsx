import { useState } from 'react';

import { Block, Text, ToggleButton, ToggleGroup } from '@platform-blocks/ui';

export function Demo() {
  const [alignment, setAlignment] = useState('center');

  const handleChange = (nextValue: string | number | (string | number)[]) => {
    if (typeof nextValue === 'string' || typeof nextValue === 'number') {
      setAlignment(String(nextValue));
    }
  };

  return (
    <Block>
      <ToggleGroup value={alignment} exclusive onChange={handleChange}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleGroup>
      <Text size="xs" color="secondary">
        Selected alignment: {alignment}
      </Text>
    </Block>
  );
}
