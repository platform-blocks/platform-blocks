# Sticky Note

StickyNote displays reminders and annotations on a colorful paper-like surface.

## Metadata

- Import: `import { StickyNote } from '@plocks/ui';`
- Tags: note, reminder, paper, pinboard
- Docs: https://plocks.dev/components/StickyNote
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/StickyNote

## Props

- `children`: React.ReactNode — Note body. Plain text receives the note's readable text color automatically.
- `title`: string — Optional heading above the body.
- `footer`: React.ReactNode — Optional content anchored below the body, such as a date or author.
- `color`: StickyNoteColor = 'yellow' — Paper color preset, theme palette token, or CSS color. @default 'yellow'
- `size`: number = 220 — Width and minimum height in pixels. @default 220
- `rotation`: number = 0 — Rotation in degrees for a casual pinboard layout. @default 0
- `onPress`: () => void — Makes the note an accessible button.
- `disabled`: boolean — Disables an interactive note.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type StickyNoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | ColorProp;
```

## Examples

### Basics

Use preset colors for a small collection of reminders. Each note can also carry a title and footer.

```tsx
import { Block, StickyNote } from '@plocks/ui';

export function Demo() {
  return (
    <Block direction="row" wrap="wrap" gap={24} p="lg">
      <StickyNote title="Today" footer="Tuesday · 9:30 AM" color="yellow" rotation={-2}>
        Review the sketches and share feedback with the team.
      </StickyNote>
      <StickyNote title="Idea" color="blue" rotation={2}>
        Keep the interface simple enough to understand at a glance.
      </StickyNote>
      <StickyNote title="Remember" color="pink" rotation={-1}>
        Bring the latest prototype to the design review.
      </StickyNote>
    </Block>
  );
}
```

### Interactive note

Add `onPress` to use a note as a button. The component supplies button semantics and a pressed state.

```tsx
import React, { useState } from 'react';
import { StickyNote } from '@plocks/ui';

export function Demo() {
  const [done, setDone] = useState(false);

  return (
    <StickyNote
      title={done ? 'Done!' : 'To do'}
      color={done ? 'green' : 'purple'}
      accessibilityLabel={done ? 'Mark note as to do' : 'Mark note as done'}
      onPress={() => setDone(value => !value)}
    >
      {done ? 'Tap to reopen this task.' : 'Tap this note when the task is complete.'}
    </StickyNote>
  );
}
```
