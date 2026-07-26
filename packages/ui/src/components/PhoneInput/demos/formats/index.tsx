import { useState } from 'react';

import { Block, Card, Code, PhoneInput, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [us, setUs] = useState('');
  const [uk, setUk] = useState('');
  const [fr, setFr] = useState('');
  const [br, setBr] = useState('');

  return (
    <Block fullWidth>
      <Text weight="semibold">Country formatting</Text>
      <Text size="sm" colorVariant="secondary">
        Compare built-in masks for several countries. Each input stores digits only while rendering a localized format.
      </Text>

      <Block>
        <PhoneInput
          label="United States"
          country="US"
          value={us}
          onChange={(raw) => setUs(raw)}
          showCountryCode
        />
        <PhoneInput
          label="United Kingdom"
          country="GB"
          value={uk}
          onChange={(raw) => setUk(raw)}
          showCountryCode
        />
        <PhoneInput
          label="France"
          country="FR"
          value={fr}
          onChange={(raw) => setFr(raw)}
          showCountryCode
        />
        <PhoneInput
          label="Brazil"
          country="BR"
          value={br}
          onChange={(raw) => setBr(raw)}
          showCountryCode
        />
      </Block>

      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" colorVariant="secondary">
            Raw digit values
          </Text>
          <Code size="sm">{JSON.stringify({ us, uk, fr, br }, null, 2)}</Code>
        </Block>
      </Card>
    </Block>
  );
}
