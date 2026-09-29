import { useState } from 'react';

import { Block, Text, ToggleButton, ToggleGroup } from '@platform-blocks/ui';

export function Demo() {
  const [formats, setFormats] = useState(['bold']);

  const handleChange = (value: string | number | (string | number)[]) => {
    if (Array.isArray(value)) {
      setFormats(value.map(String));
    }
  };

  return (
    <Block>
      <ToggleGroup value={formats} onChange={handleChange}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
        <ToggleButton value="color">Color</ToggleButton>
      </ToggleGroup>

      <Text size="xs" c="secondary">
        Active formatting: {formats.length > 0 ? formats.join(', ') : 'none'}
      </Text>
    </Block>
  );
}
