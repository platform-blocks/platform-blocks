import { useState } from 'react';
import { Block, Rating, Text } from '@platform-blocks/ui';

export function Demo() {
  const [score, setScore] = useState<number>(3);

  return (
    <Block>
      <Rating
        value={score}
        onChange={setScore}
        size="lg"
        label="Rate the broadcast quality"
      />
      <Text variant="small" color="muted">
        Current score: {score} out of 5.
      </Text>
    </Block>
  );
}