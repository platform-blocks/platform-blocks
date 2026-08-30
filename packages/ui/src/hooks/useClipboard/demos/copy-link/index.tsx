import { useState } from 'react';
import { Badge, Block, Button, Input, useClipboard } from '@platform-blocks/react-ui-library';

const INVITE_URL = 'https://app.example.com/invite/engineering';

export function Demo() {
  const { copy, copied, unsupported, lastValue } = useClipboard({ timeout: 1500 });
  const [value, setValue] = useState(INVITE_URL);

  return (
    <Block align="flex-start" maxW={460} fullWidth>
      <Input
        label="Invite URL"
        value={value}
        onChangeText={setValue}
        error={unsupported ? 'Clipboard access is not available in this environment.' : undefined}
        description="The copied state resets automatically after 1.5 seconds."
        textInputProps={{ autoCapitalize: 'none' }}
      />
      <Button onPress={() => copy(value)} disabled={unsupported}>
        {copied ? 'Copied!' : 'Copy link'}
      </Button>
      {lastValue ? (
        <Badge variant="subtle" color={copied ? 'success' : 'gray'}>
          Last copied: {lastValue}
        </Badge>
      ) : null}
    </Block>
  );
}
