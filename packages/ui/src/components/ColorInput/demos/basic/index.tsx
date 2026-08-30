import { useState } from 'react';
import { Block, ColorInput, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [color, setColor] = useState('#FF6B6B');

  return (
    <Block fullWidth>
      <ColorInput
        value={color}
        onChange={setColor}
        label="Favorite color"
        placeholder="Select a color"
        clearable
        fullWidth
      />
      <Text size="sm" color="secondary">
        Selected: {color || 'none'}
      </Text>
    </Block>
  );
}
