import { useState } from 'react';

import { Block, Input } from '@platform-blocks/ui';

export default function Demo() {
  const [autoText, setAutoText] = useState('');
  const [fixedText, setFixedText] = useState('');

  return (
    <Block>
      <Input
        label="Auto-expanding"
        placeholder="Start typing — press Enter to add lines"
        value={autoText}
        onChangeText={setAutoText}
        multiline
        minLines={1}
        maxLines={5}
        helperText="Grows from 1 to 5 lines, then scrolls"
      />

      <Input
        label="Fixed height"
        placeholder="Always 3 lines tall"
        value={fixedText}
        onChangeText={setFixedText}
        multiline
        numberOfLines={3}
      />
    </Block>
  );
}
