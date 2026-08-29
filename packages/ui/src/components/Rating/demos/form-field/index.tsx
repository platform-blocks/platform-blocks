import { useState } from 'react';
import { Block, Button, Rating, Text } from '@platform-blocks/ui';

export function Demo() {
  const [score, setScore] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const error = submitted && score === 0 ? 'Please choose a rating' : undefined;

  return (
    <Block>
      <Rating
        value={score}
        onChange={setScore}
        clearable
        required
        size="lg"
        label="Overall experience"
        description="Select a star again to clear your rating."
        error={error}
      />
      <Button onPress={() => setSubmitted(true)}>Submit</Button>
      <Text variant="small" color="muted">
        {score === 0 ? 'No rating selected.' : `You rated ${score} out of 5.`}
      </Text>
    </Block>
  );
}
