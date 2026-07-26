import { useMemo, useState } from 'react';

import { Block, PhoneInput, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [usRaw, setUsRaw] = useState('');
  const [usFormatted, setUsFormatted] = useState('');
  const [internationalRaw, setInternationalRaw] = useState('');
  const [internationalFormatted, setInternationalFormatted] = useState('');

  const isValidUs = useMemo(() => usRaw.length === 10, [usRaw]);
  const isValidInternational = useMemo(
    () => internationalRaw.length >= 7 && internationalRaw.length <= 15,
    [internationalRaw]
  );

  return (
    <Block fullWidth>
      <Text weight="semibold">Validation states</Text>
      <Text size="sm" colorVariant="secondary">
        Surface validation messages based on raw digit counts for domestic and international numbers.
      </Text>

      <Block>
        <Block>
          <PhoneInput
            label="US phone (10 digits required)"
            value={usRaw}
            onChange={(raw, formatted) => {
              setUsRaw(raw);
              setUsFormatted(formatted);
            }}
            country="US"
            showCountryCode
            error={usRaw.length > 0 && !isValidUs ? 'Enter a 10-digit US phone number' : undefined}
          />
          <Text size="xs" colorVariant={isValidUs || usRaw.length === 0 ? 'success' : 'error'}>
            {usRaw.length === 0
              ? 'Enter a phone number'
              : isValidUs
                ? `✓ ${usFormatted}`
                : `${usRaw.length}/10 digits entered`}
          </Text>
        </Block>

        <Block>
          <PhoneInput
            label="International phone (7-15 digits)"
            value={internationalRaw}
            onChange={(raw, formatted) => {
              setInternationalRaw(raw);
              setInternationalFormatted(formatted);
            }}
            defaultCountry="INTL"
            autoDetect
            showCountryCode
            error={
              internationalRaw.length > 0 && !isValidInternational
                ? 'International numbers should be 7-15 digits'
                : undefined
            }
          />
          <Text
            size="xs"
            colorVariant={isValidInternational || internationalRaw.length === 0 ? 'success' : 'error'}
          >
            {internationalRaw.length === 0
              ? 'Enter an international phone number'
              : isValidInternational
                ? `✓ ${internationalFormatted}`
                : 'Adjust to 7-15 digits'}
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
