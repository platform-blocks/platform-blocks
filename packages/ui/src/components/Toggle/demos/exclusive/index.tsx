import { useState } from 'react';

import { Block, Text, ToggleButton, ToggleGroup } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [alignment, setAlignment] = useState('center');

  const handleChange = (value: string | number | (string | number)[]) => {
    // For exclusive mode, value should be a single string or number
    if (typeof value === 'string' || typeof value === 'number') {
      setAlignment(String(value));
    }
  };

  return (
    <Block>
      <Block>
        <Text weight="semibold">Exclusive selection</Text>
        <Text size="xs" color="secondary">
          Set `exclusive` to enforce a single active value at a time.
        </Text>
      </Block>

      <ToggleGroup value={alignment} exclusive onChange={handleChange}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
        <ToggleButton value="justify">Justify</ToggleButton>
      </ToggleGroup>

      <Text size="xs" color="secondary">
        Active option: {alignment}
      </Text>
    </Block>
  );
}
