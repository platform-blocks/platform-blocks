import { useState } from 'react';

import { Block, PhoneInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [raw, setRaw] = useState('');
  const [formatted, setFormatted] = useState('');

  return (
    <Block fullWidth>
      <PhoneInput
        label="Phone number"
        value={raw}
        onChange={(rawDigits, formattedDisplay) => {
          setRaw(rawDigits);
          setFormatted(formattedDisplay);
        }}
      />
      <Text size="sm">
        Raw: {raw || '—'} · Formatted: {formatted || '—'}
      </Text>
    </Block>
  );
}
