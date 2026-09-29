import { useState } from 'react';
import { Block, Button, Progress } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState(50);

  return (
    <Block fullWidth>
      <Progress value={value} transitionDuration={400} />
      <Button onPress={() => setValue(Math.round(Math.random() * 100))}>Randomize value</Button>
    </Block>
  );
}
