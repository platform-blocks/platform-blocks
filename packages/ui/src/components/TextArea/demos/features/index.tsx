import { useState } from 'react';

import { Block, Text, TextArea } from '@platform-blocks/ui';

export default function Demo() {
  const [autoResizeValue, setAutoResizeValue] = useState(
    'Type more text to see auto-resize in action...\n\nAdd multiple lines to watch the text area grow and shrink with content.'
  );
  const [counterValue, setCounterValue] = useState('');
  const [errorValue, setErrorValue] = useState('');

  return (
    <Block fullWidth>
        <TextArea
          label="Auto-resize message"
          placeholder="Adjusts height between two and six rows based on content."
          value={autoResizeValue}
          onChangeText={setAutoResizeValue}
          autoResize
          minRows={2}
          maxRows={6}
          fullWidth
        />

      <Block>
        <Text size="sm" weight="semibold">
          Character counter
        </Text>
        <Text size="sm" colorVariant="secondary">
          Enforces a maximum length while surfacing a live counter.
        </Text>
        <TextArea
          label="Support message"
          placeholder="Type to see the counter (max 100 characters)"
          value={counterValue}
          onChangeText={setCounterValue}
          maxLength={100}
          showCharCounter
          rows={3}
          helperText="Helpful for concise feedback or short-form inputs."
          fullWidth
        />
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          Error and required states
        </Text>
        <Text size="sm" colorVariant="secondary">
          Show validation messaging when the field is empty.
        </Text>
        <TextArea
          label="Required response"
          placeholder="This field cannot be empty"
          value={errorValue}
          onChangeText={setErrorValue}
          error={errorValue.length > 0 ? undefined : 'A response is required before submission.'}
          required
          rows={3}
          fullWidth
        />
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          Disabled field
        </Text>
        <Text size="sm" colorVariant="secondary">
          Communicates when editing is not allowed.
        </Text>
        <TextArea
          label="Disabled text area"
          placeholder="Disabled state"
          value="This text area is disabled and cannot be edited."
          disabled
          rows={2}
          fullWidth
        />
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          Required helper copy
        </Text>
        <Text size="sm" colorVariant="secondary">
          Pair helper text with the required badge to give extra guidance.
        </Text>
        <TextArea
          label="Required with helper"
          placeholder="Add details"
          required
          rows={2}
          helperText="Required fields display an asterisk and supporting guidance."
          fullWidth
        />
      </Block>
    </Block>
  );
}