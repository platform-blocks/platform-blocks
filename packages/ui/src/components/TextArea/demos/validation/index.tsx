import { useState } from 'react';

import { Block, Button, Text, TextArea } from '@platform-blocks/ui';

type ValidationErrors = {
  feedback?: string;
  message?: string;
};

export function Demo() {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState('');

  const validateForm = () => {
    const nextErrors: ValidationErrors = {};

    if (!feedback.trim()) {
      nextErrors.feedback = 'Feedback is required.';
    } else if (feedback.trim().length < 10) {
      nextErrors.feedback = 'Feedback must be at least 10 characters.';
    }

    if (message.length > 500) {
      nextErrors.message = 'Message cannot exceed 500 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setStatus('Feedback submitted successfully.');
      return;
    }

    setStatus('');
  };

  return (
    <Block fullWidth>

      <Block>
        <Text size="sm" weight="semibold">
          Required feedback
        </Text>
        <Text size="sm" color="secondary">
          Must include at least ten characters before the form can submit.
        </Text>
        <TextArea
          label="Feedback"
          placeholder="Share your thoughts (minimum 10 characters)"
          value={feedback}
          onChangeText={(value) => {
            setFeedback(value);
            if (errors.feedback) {
              setErrors((prev) => ({ ...prev, feedback: undefined }));
            }
          }}
          error={errors.feedback}
          required
          rows={4}
          helperText="Tell us what went well and what could improve."
          fullWidth
        />
      </Block>


      <Button variant="filled" onPress={handleSubmit}>
        Submit feedback
      </Button>

      {status ? (
        <Text size="xs" color="success">
          {status}
        </Text>
      ) : null}

      {Object.keys(errors).length > 0 && (
        <Block
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#FCA5A5',
            backgroundColor: '#FEF2F2',
            padding: 12,
          }}
        >
          <Text size="sm" weight="semibold" color="error">
            Please fix the following before submitting:
          </Text>
          {Object.values(errors)
            .filter(Boolean)
            .map((errorMessage) => (
              <Text key={errorMessage} size="xs" color="error">
                • {errorMessage}
              </Text>
            ))}
        </Block>
      )}
    </Block>
  );
}