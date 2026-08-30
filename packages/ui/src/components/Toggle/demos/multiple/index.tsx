import { useState } from 'react';

import { Block, Text, ToggleButton, ToggleGroup } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [formats, setFormats] = useState(['bold']);

  const handleChange = (value: string | number | (string | number)[]) => {
    if (Array.isArray(value)) {
      setFormats(value.map(String));
    }
  };

  return (
    <Block>
      <Block>
        <Text weight="semibold">Multiple selection</Text>
        <Text size="xs" color="secondary">
          The default mode returns an array of selected values.
        </Text>
      </Block>

      <ToggleGroup value={formats} onChange={handleChange}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
        <ToggleButton value="color">Color</ToggleButton>
      </ToggleGroup>

      <Text size="xs" color="secondary">
        Active formatting: {formats.length > 0 ? formats.join(', ') : 'none'}
      </Text>
    </Block>
  );
}
