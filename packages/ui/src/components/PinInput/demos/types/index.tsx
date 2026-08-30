import { useState } from 'react';

import { Block, PinInput, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [numericValue, setNumericValue] = useState('');
  const [alphanumericValue, setAlphanumericValue] = useState('');

  return (
    <Block>
      <Text weight="semibold">PIN input types</Text>

      <Block>
        <Text size="sm" weight="semibold">
          Numeric (default)
        </Text>
        <Text size="sm" color="secondary">
          Restricts entry to digits 0-9 for PIN and OTP flows.
        </Text>
        <PinInput
          value={numericValue}
          onChange={setNumericValue}
          type="numeric"
          label="Numeric PIN"
        />
      </Block>

      <Block>
        <Text size="sm" weight="semibold">
          Alphanumeric
        </Text>
        <Text size="sm" color="secondary">
          Allow letters and numbers for recovery or backup codes.
        </Text>
        <PinInput
          value={alphanumericValue}
          onChange={setAlphanumericValue}
          type="alphanumeric"
          label="Alphanumeric code"
          length={6}
        />
      </Block>
    </Block>
  );
}


