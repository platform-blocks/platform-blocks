# @plocks/emoji-picker

A searchable emoji picker for React Native and web. It follows the host `@plocks/ui` theme and includes 1,914 Unicode emoji across nine categories. The list is virtualized, works offline, remembers recent selections for the current session, and offers five skin tone choices.

```sh
npm install @plocks/ui @plocks/emoji-picker
```

```tsx
import { useState } from 'react';
import { EmojiPicker, EmojiPickerInput } from '@plocks/emoji-picker';

function ChatComposer() {
  const [message, setMessage] = useState('');
  return <EmojiPicker onSelect={({ emoji }) => setMessage(text => text + emoji)} />;
}

function ReactionField() {
  const [reaction, setReaction] = useState<string | null>(null);
  return <EmojiPickerInput label="Reaction" value={reaction} onChange={setReaction} clearable />;
}
```

`onSelect` receives `{ id, emoji, name, category, skinTone }`. It returns the Unicode emoji selected, ready to append to a message or store as a reaction. The picker is inline, so the host app decides whether to put it in a popover, dialog, or sheet.

`EmojiPickerInput` is a form field that opens the picker in a popover on desktop and a sheet on smaller screens. It supports controlled or uncontrolled values, a clear button, validation messages, and the usual field styling props. `onChange` receives the Unicode emoji and its selection metadata (or `null, null` when cleared). Pass `pickerProps` to customize the catalog, categories, and skin tone controls.

Pass `emojis` to replace the default catalog with app-specific Unicode emoji. Each item has `id`, `emoji`, `name`, `category`, and optional `keywords` and five `skins` entries. Use `categoryLabels` to name custom categories. `skinTone` / `onSkinToneChange` and `recent` / `onRecentChange` allow controlled state; otherwise the picker keeps it locally. Recent selections are not persisted unless the host app saves them.

The built-in English names, keywords, and Unicode sequences are derived from Emojibase Data 17.0.0 (MIT). See [EMOJIBASE_LICENSE](./EMOJIBASE_LICENSE).
