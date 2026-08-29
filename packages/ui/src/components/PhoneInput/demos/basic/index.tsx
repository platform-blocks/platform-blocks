import { useState } from 'react';

import { Block, Card, Code, PhoneInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [raw, setRaw] = useState('');
  const [formatted, setFormatted] = useState('');
  const [e164, setE164] = useState('');
  const [complete, setComplete] = useState(false);

  return (
    <Block fullWidth>
      <Text weight="semibold">Basic phone input</Text>
      <Text size="sm" color="secondary">
        Controlled phone field showing the raw national digits, the formatted display
        value, and the submittable E.164 form.
      </Text>
      <PhoneInput
        label="Phone number"
        value={raw}
        onChange={(rawDigits, formattedDisplay, meta) => {
          setRaw(rawDigits);
          setFormatted(formattedDisplay);
          setE164(meta.e164);
          setComplete(meta.isComplete);
        }}
        country="US"
        showCountryCode
      />
      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Current values
          </Text>
          <Code size="sm">{JSON.stringify({ raw, formatted, e164, complete }, null, 2)}</Code>
        </Block>
      </Card>
    </Block>
  );
}
