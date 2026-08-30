import { useState } from 'react';

import { Block, Card, Code, PhoneInput, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [country, setCountry] = useState('US');
  const [raw, setRaw] = useState('');
  const [e164, setE164] = useState('');

  return (
    <Block fullWidth>
      <Text weight="semibold">Country picker</Text>
      <Text size="sm" color="secondary">
        With selectableCountry the dial-code prefix becomes a dropdown. Changing the
        country remasks the digits already entered instead of clearing them, and the
        E.164 value is rebuilt against the new dial code.
      </Text>

      <PhoneInput
        label="Phone number"
        selectableCountry
        country={country}
        onCountryChange={setCountry}
        value={raw}
        onChange={(rawDigits, _formatted, meta) => {
          setRaw(rawDigits);
          setE164(meta.e164);
        }}
      />

      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Current values
          </Text>
          <Code size="sm">{JSON.stringify({ country, raw, e164 }, null, 2)}</Code>
        </Block>
      </Card>
    </Block>
  );
}
