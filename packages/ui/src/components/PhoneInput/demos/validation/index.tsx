import { useState } from 'react';

import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  const [usRaw, setUsRaw] = useState('');
  const [internationalRaw, setInternationalRaw] = useState('');

  const isValidUs = usRaw.length === 10;
  const isValidInternational = internationalRaw.length >= 7 && internationalRaw.length <= 15;

  return (
    <Block fullWidth>
      <PhoneInput
        label="US phone (10 digits required)"
        value={usRaw}
        onChange={(raw) => setUsRaw(raw)}
        error={usRaw.length > 0 && !isValidUs ? 'Enter a 10-digit US phone number' : undefined}
      />
      <PhoneInput
        label="International phone (7-15 digits)"
        country="INTL"
        value={internationalRaw}
        onChange={(raw) => setInternationalRaw(raw)}
        error={
          internationalRaw.length > 0 && !isValidInternational
            ? 'International numbers should be 7-15 digits'
            : undefined
        }
      />
    </Block>
  );
}
