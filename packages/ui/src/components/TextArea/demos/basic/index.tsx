import { useState } from 'react';

import { Block, TextArea } from '@platform-blocks/ui';

export function Demo() {
  const [value, setValue] = useState('');

  return (
    <Block fullWidth>
      <TextArea
        label="Message"
        placeholder="Enter your message"
        value={value}
        onChangeText={setValue}
        description="Provide helpful context for your request."
        rows={4}
        fullWidth
      />
    </Block>
  );
}
