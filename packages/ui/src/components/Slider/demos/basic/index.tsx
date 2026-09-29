import { useState } from 'react';
import { Block, Slider } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState(25);

  return (
    <Block fullWidth>
      <Slider accessibilityLabel="Volume" value={value} onChange={setValue} />
    </Block>
  );
}
