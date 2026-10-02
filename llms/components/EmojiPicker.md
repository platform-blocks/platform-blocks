# EmojiPicker

EmojiPicker lets users browse and select Unicode emoji.

## Metadata

- Import: `import { EmojiPicker } from '@plocks/emoji-picker';`
- Install: `npm install @plocks/emoji-picker` — a separate package from `@plocks/ui`
- Status: beta
- Tags: emoji, reactions, chat, picker, search
- Docs: https://plocks.dev/components/EmojiPicker
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/emoji-picker/src/components/EmojiPicker

## Props

- `onSelect` (required): (selection: EmojiPickerSelection) => void — Called with the selected Unicode emoji and its metadata.
- `emojis`: readonly EmojiPickerItem[] = DEFAULT_EMOJIS — Replace the built-in Unicode catalog with app-specific emoji.
- `categoryLabels`: Record<string, string> — Labels for custom category keys.
- `skinTone`: 0 | 1 | 2 | 3 | 4 | 5 — Current skin tone; omit for internal state. 0 means the emoji's default appearance.
- `defaultSkinTone`: 0 | 1 | 2 | 3 | 4 | 5 = 0
- `onSkinToneChange`: (tone: EmojiSkinTone) => void
- `recent`: readonly string[] — Most recently selected Unicode strings; omit for internal session recents.
- `defaultRecent`: readonly string[] = []
- `onRecentChange`: (recent: string[]) => void
- `maxRecent`: number = 24 — Maximum number of recent emoji to retain. @default 24
- `searchPlaceholder`: string = 'Search emoji'
- `emptyText`: string = 'No emoji found'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface EmojiPickerSelection {
  id: string;
  emoji: string;
  name: string;
  category: string;
  skinTone: EmojiSkinTone;
}

export interface EmojiPickerItem {
  id: string;
  emoji: string;
  name: string;
  category: string;
  keywords?: readonly string[];
  /** Unicode variants ordered light through dark; use null for an unavailable tone. */
  skins?: readonly (string | null)[];
}

export type EmojiSkinTone = 0 | 1 | 2 | 3 | 4 | 5;
```

## Examples

### Basics

Pick an emoji to append it to a message. The picker provides Unicode text; the app owns the message state.

```tsx
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
```

### Reaction set

Replace the catalog with a small set of reactions and supply a custom category label.

```tsx
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
```
