import { useState } from 'react';
import { Block, Button, Progress } from '@platform-blocks/ui';

import { randomValue } from './randomValue';

const TRANSITION_MS = 400;

export default function Demo() {
  const [completion, setCompletion] = useState<number>(50);
  return (
    <Block fullWidth >
      <Progress value={completion} transitionDuration={TRANSITION_MS} />
      <Button onPress={() => setCompletion(randomValue)}>
        randomize value
      </Button>
    </Block>
  );
}
