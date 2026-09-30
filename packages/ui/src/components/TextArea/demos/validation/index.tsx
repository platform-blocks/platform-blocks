import { useState } from 'react';

import { Block, Button, TextArea } from '@plocks/ui';

export function Demo() {
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string>();

  const handleSubmit = () => {
    if (!feedback.trim()) {
      setError('Feedback is required.');
    } else if (feedback.trim().length < 10) {
      setError('Feedback must be at least 10 characters.');
    }
  };

  return (
    <Block fullWidth>
      <TextArea
        label="Feedback"
        placeholder="Share your thoughts (minimum 10 characters)"
        value={feedback}
        onChangeText={(value) => {
          setFeedback(value);
          setError(undefined);
        }}
        error={error}
        required
        rows={4}
        helperText="Tell us what went well and what could improve."
        fullWidth
      />
      <Button variant="filled" onPress={handleSubmit}>
        Submit feedback
      </Button>
    </Block>
  );
}
