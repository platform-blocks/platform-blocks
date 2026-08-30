import { useState } from 'react';

import { Block, PhoneInput, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [intlRaw, setIntlRaw] = useState('');
  const [intlFormatted, setIntlFormatted] = useState('');
  const [extensionRaw, setExtensionRaw] = useState('');
  const [extensionFormatted, setExtensionFormatted] = useState('');

  return (
    <Block fullWidth>
      <Text weight="semibold">Advanced masking</Text>
      <Text size="sm" color="secondary">
        Apply custom mask patterns to control formatting for international numbers and extension fields.
      </Text>

      <Block>
        <PhoneInput
          label="International format"
          value={intlRaw}
          onChange={(raw, formatted) => {
            setIntlRaw(raw);
            setIntlFormatted(formatted);
          }}
          autoDetect={false}
          showCountryCode={false}
          mask="+00 (000) 000-0000"
          placeholder="+44 (7911) 123-456"
        />
        <Text size="xs" color="secondary">
          Raw digits: {intlRaw || '—'}
        </Text>
        <Text size="xs" color="secondary">
          Formatted: {intlFormatted || '—'}
        </Text>
      </Block>

      <Block>
        <PhoneInput
          label="North America with extension"
          value={extensionRaw}
          onChange={(raw, formatted) => {
            setExtensionRaw(raw);
            setExtensionFormatted(formatted);
          }}
          autoDetect={false}
          showCountryCode={false}
          mask="000-000-0000 x0000"
          placeholder="555-123-4567 x1234"
        />
        <Text size="xs" color="secondary">
          Raw digits: {extensionRaw || '—'}
        </Text>
        <Text size="xs" color="secondary">
          Formatted: {extensionFormatted || '—'}
        </Text>
      </Block>
    </Block>
  );
}