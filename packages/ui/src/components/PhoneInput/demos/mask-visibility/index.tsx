import { useState } from 'react';

import { Block, PhoneInput, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [withCountryCode, setWithCountryCode] = useState('');
  const [withoutCountryCode, setWithoutCountryCode] = useState('');

  return (
    <Block fullWidth>
      <Text weight="semibold">Country code visibility</Text>
      <Text size="sm" color="secondary">
        Toggle the country prefix while keeping the same underlying digits.
      </Text>

      <Block>
        <Block>
          <PhoneInput
            label="With country code"
            value={withCountryCode}
            onChange={(raw) => setWithCountryCode(raw)}
            country="US"
            showCountryCode
          />
          <Text size="xs" color="secondary">
            Raw digits: {withCountryCode || '—'}
          </Text>
        </Block>

        <Block>
          <PhoneInput
            label="Without country code"
            value={withoutCountryCode}
            onChange={(raw) => setWithoutCountryCode(raw)}
            country="US"
            showCountryCode={false}
          />
          <Text size="xs" color="secondary">
            Raw digits: {withoutCountryCode || '—'}
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
