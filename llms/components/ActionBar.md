# ActionBar

Use ActionBar for actions that apply to selected content. It stays pinned while the page scrolls.

## Metadata

- Import: `import { ActionBar } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/ActionBar
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ActionBar

## Props

- `children`: React.ReactNode — Actions rendered in the bar.
- `opened` (required): boolean — Controls visibility.
- `onClose`: () => void — Called by the close button or Escape when enabled.
- `closeOnEscape`: boolean = false — Let Escape dismiss this bar once layers above it close. @default false
- `keepMounted`: boolean = false — Preserve the hidden bar in the tree. @default false
- `withinPortal`: boolean = true — Render at the application root. @default true
- `position`: { top?: number; bottom?: number; start?: number; end?: number } = { bottom: 24 } — Logical viewport insets. @default { bottom: 24 }
- `radius`: RadiusValue = 'md' — Corner radius. @default 'md'
- `shadow`: ShadowToken = 'md' — Surface shadow. @default 'md'
- `withBorder`: boolean = true — Draw a border. @default true
- `zIndex`: number — Stack order.
- `transition`: 'pop' | 'slide-up' | 'fade' = 'pop' — Entrance effect. @default 'pop'
- `transitionDuration`: number = 200 — Animation duration in ms. @default 200
- `aria-label`: string = 'Actions' — Accessible group label. @default 'Actions'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { ActionBarDivider, ActionBarCloseButton } from '@plocks/ui';`

### ActionBarDivider

- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ActionBarCloseButton

- `accessibilityLabel`: string
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ActionBar.CloseButton

- `accessibilityLabel`: string
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ActionBar.Divider

- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Open the bar when selection is active; CloseButton calls `onClose`.

```tsx
import { useState } from 'react';
import { ActionBar, Block, Button, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Select items</Button>
      <ActionBar opened={opened} onClose={() => setOpened(false)}>
        <Text>3 selected</Text>
        <ActionBar.Divider />
        <Button size="sm">Delete</Button>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
```

### Placement and Escape

Use logical viewport insets to place the bar and `closeOnEscape` to dismiss it with Escape.

```tsx
import { useState } from 'react';
import { ActionBar, Block, Button, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Show top bar</Button>
      <ActionBar
        opened={opened}
        onClose={() => setOpened(false)}
        position={{ top: 24, end: 24 }}
        transition="slide-up"
        closeOnEscape
      >
        <Text>Top end</Text>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
```

### Icon Buttons

IconButton actions can be grouped with dividers and tooltips.

```tsx
import { useState } from 'react';
import { ActionBar, Block, Button, IconButton, Tooltip } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Show actions</Button>
      <ActionBar opened={opened} onClose={() => setOpened(false)}>
        <Tooltip label="Archive">
          <IconButton icon="archive" accessibilityLabel="Archive" variant="ghost" />
        </Tooltip>
        <ActionBar.Divider />
        <Tooltip label="Delete">
          <IconButton icon="trash" accessibilityLabel="Delete" variant="ghost" />
        </Tooltip>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
```

### Transitions

`transition` changes how the bar enters and leaves.

```tsx
import { useState } from 'react';
import { ActionBar, Block, Button, Text } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened(true)}>Show slide transition</Button>
      <ActionBar
        opened={opened}
        onClose={() => setOpened(false)}
        transition="slide-up"
        transitionDuration={300}
      >
        <Text>Sliding actions</Text>
        <ActionBar.CloseButton />
      </ActionBar>
    </Block>
  );
}
```

### Keep Mounted

`keepMounted` preserves child state while the bar is hidden.

```tsx
import { useState } from 'react';
import { ActionBar, Block, Button, Checkbox } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <Block fullWidth>
      <Button onPress={() => setOpened((value) => !value)}>Toggle bar</Button>
      <ActionBar opened={opened} onClose={() => setOpened(false)} keepMounted>
        <Checkbox label="Keep this choice" />
      </ActionBar>
    </Block>
  );
}
```
