import { useState } from 'react';

import { Block, Text, TextArea } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [value, setValue] = useState('');

  return (
    <Block fullWidth>
      <TextArea
        label="Message"
        placeholder="Enter your message"
        value={value}
        onChangeText={setValue}
        description="Provide helpful context for your request."
        error={value.length > 120 ? 'Message is too long. Keep it under 120 characters.' : undefined}
        rows={4}
        fullWidth
      />
      {value ? (
        <Text size="xs" color="secondary">
          Character count: {value.length}
        </Text>
      ) : null}
    </Block>
  );
}