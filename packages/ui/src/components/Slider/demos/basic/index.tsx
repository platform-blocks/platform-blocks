import { useState } from 'react';
import { Slider, Text, Card, Block } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState(25);

  return (
    <Block fullWidth>
      <Slider
        value={value}
        onChange={setValue}
        min={0}
        max={100}
      />
    </Block>
  );
}


