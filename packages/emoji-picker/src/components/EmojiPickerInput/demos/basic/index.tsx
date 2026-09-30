import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { EmojiPickerInput } from '@plocks/emoji-picker';

export function Demo() {
  const [emoji, setEmoji] = useState<string | null>(null);

  return (
    <Block gap="sm" w="100%" maw={360}>
      <EmojiPickerInput label="Reaction" placeholder="Choose an emoji" value={emoji} onChange={setEmoji} clearable />
      <Text c="muted" size="sm">Selected: {emoji ?? 'None'}</Text>
    </Block>
  );
}
