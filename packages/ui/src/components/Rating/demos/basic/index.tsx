import { useState } from 'react';
import { Block, Rating, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [score, setScore] = useState<number>(3);

  return (
    <Block>
      <Rating
        value={score}
        onChange={setScore}
        size="lg"
        label="Rate the broadcast quality"
      />
      <Text variant="small" colorVariant="muted">
        Current score: {score} out of 5.
      </Text>
    </Block>
  );
}