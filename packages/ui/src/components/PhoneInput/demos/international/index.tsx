import { useState } from 'react';

import { Block, Card, Code, PhoneInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [autoDetectValue, setAutoDetectValue] = useState('');
  const [autoDetectE164, setAutoDetectE164] = useState('');
  const [autoDetectCountry, setAutoDetectCountry] = useState('US');
  const [intlValue, setIntlValue] = useState('');
  const [intlFormatted, setIntlFormatted] = useState('');

  return (
    <Block fullWidth>
      <Text weight="semibold">International detection</Text>
      <Text size="sm" color="secondary">
        With autoDetect, an explicit + prefix picks the country: type or paste
        +447911123456 and the mask, dial code and E.164 output follow along. A
        recognized dial code is stripped on paste either way, so a full international
        number never overflows the national mask.
      </Text>

      <Block>
        <PhoneInput
          label="Auto-detect from a + prefix"
          value={autoDetectValue}
          onChange={(raw, _formatted, meta) => {
            setAutoDetectValue(raw);
            setAutoDetectE164(meta.e164);
          }}
          defaultCountry="US"
          onCountryChange={setAutoDetectCountry}
          autoDetect
          showCountryCode
          placeholder="Try +447911123456 or +33123456789"
        />

        <PhoneInput
          label="Manual international"
          country="INTL"
          value={intlValue}
          onChange={(raw, formatted) => {
            setIntlValue(raw);
            setIntlFormatted(formatted);
          }}
          showCountryCode={false}
          placeholder="Enter any international number"
        />
      </Block>

      <Card variant="outline" p="sm">
        <Block>
          <Text size="xs" color="secondary">
            Values
          </Text>
          <Code size="sm">
            {JSON.stringify(
              {
                autoDetect: {
                  country: autoDetectCountry,
                  raw: autoDetectValue,
                  e164: autoDetectE164
                },
                international: { raw: intlValue, formatted: intlFormatted }
              },
              null,
              2
            )}
          </Code>
        </Block>
      </Card>
    </Block>
  );
}
