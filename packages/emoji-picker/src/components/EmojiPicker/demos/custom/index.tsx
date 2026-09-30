import { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { EmojiPicker } from '@plocks/emoji-picker';
import type { EmojiPickerItem } from '@plocks/emoji-picker';

const REACTIONS: EmojiPickerItem[] = [
  { id: 'love', emoji: '❤️', name: 'Love', category: 'reactions', keywords: ['heart', 'like'] },
  { id: 'laugh', emoji: '😂', name: 'Laugh', category: 'reactions', keywords: ['funny'] },
  { id: 'wow', emoji: '😮', name: 'Wow', category: 'reactions', keywords: ['surprised'] },
  { id: 'sad', emoji: '😢', name: 'Sad', category: 'reactions' },
  { id: 'celebrate', emoji: '🎉', name: 'Celebrate', category: 'reactions', keywords: ['party'] },
];

export function Demo() {
  const [reaction, setReaction] = useState('❤️');
  return (
    <Block gap="md" w="100%" maw={430}>
      <EmojiPicker w="100%" h={290} emojis={REACTIONS} categoryLabels={{ reactions: 'Reactions' }} onSelect={({ emoji }) => setReaction(emoji)} />
      <Text>Selected reaction: {reaction}</Text>
    </Block>
  );
}
