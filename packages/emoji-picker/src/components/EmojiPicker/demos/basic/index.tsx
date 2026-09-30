import { useState } from 'react';
import { Block, Input, Text } from '@plocks/ui';
import { EmojiPicker } from '@plocks/emoji-picker';

export function Demo() {
  const [message, setMessage] = useState('That looks great ');
  return (
    <Block gap="md" w="100%" maw={430}>
      <EmojiPicker w="100%" onSelect={({ emoji }) => setMessage(value => value + emoji)} />
      <Input label="Message" value={message} onChangeText={setMessage} />
      <Text c="muted" size="sm">Search, switch categories, or choose a skin tone before selecting.</Text>
    </Block>
  );
}
