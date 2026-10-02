# Toggle

Toggle provides an intuitive way to select between multiple options. It supports both single and multi-selection modes with various visual styles and orientations for different use cases.

## Metadata

- Import: `import { Toggle } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Toggle
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Toggle

## Props

- `value` (required): ToggleValue — Value for this toggle button
- `selected`: boolean — Whether this button is selected (pressed). Standalone buttons are controlled by it; inside a ToggleGroup the group's value decides.
- `onPress`: (value: ToggleValue) => void — Callback when button is pressed (standalone buttons)
- `disabled`: boolean — Whether the button is disabled
- `children` (required): React.ReactNode — Button content
- `size`: SizeValue — Size of the toggle button
- `color`: ColorProp — Button color. A palette token, `'primary.6'` shade syntax, or any CSS color.
- `variant`: 'solid' | 'ghost' — Visual style variant
- `accessibilityLabel`: string — Accessible name; required when the content isn't text (an icon-only toggle).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), `radius`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { ToggleButton, ToggleGroup, ToggleBar } from '@plocks/ui';`

### ToggleButton

- `value` (required): ToggleValue — Value for this toggle button
- `selected`: boolean — Whether this button is selected (pressed). Standalone buttons are controlled by it; inside a ToggleGroup the group's value decides.
- `onPress`: (value: ToggleValue) => void — Callback when button is pressed (standalone buttons)
- `disabled`: boolean — Whether the button is disabled
- `children` (required): React.ReactNode — Button content
- `size`: SizeValue — Size of the toggle button
- `color`: ColorProp — Button color. A palette token, `'primary.6'` shade syntax, or any CSS color.
- `variant`: 'solid' | 'ghost' — Visual style variant
- `accessibilityLabel`: string — Accessible name; required when the content isn't text (an icon-only toggle).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), `radius`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ToggleGroup

- `value`: ToggleGroupValue — Current selected value(s) (controlled)
- `defaultValue`: ToggleGroupValue — Initial value(s) for uncontrolled usage
- `onChange`: (value: ToggleGroupValue) => void — Called when selection changes: the pressed value (or `[]` when it was deselected) in exclusive mode, the array of selected values otherwise.
- `exclusive`: boolean — Whether only one option can be selected at a time (a radio group)
- `disabled`: boolean — Whether the group is disabled
- `size`: SizeValue — Size of all toggle buttons
- `color`: ColorProp — Color for all buttons. A palette token, `'primary.6'` shade syntax, or any CSS color.
- `variant`: 'solid' | 'ghost' — Visual style variant for all buttons
- `orientation`: 'horizontal' | 'vertical' — Orientation of the toggle group (also the arrow keys that move focus)
- `required`: boolean — Whether selection is required (at least one must be selected)
- `accessibilityLabel`: string — Accessible name of the group
- `children` (required): React.ReactNode — Toggle buttons
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), `radius`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

### ToggleBar

- `value`: (string | number)[] — Selected values (controlled)
- `defaultValue`: (string | number)[] — Initial selected values (uncontrolled)
- `onChange`: (vals: (string | number)[]) => void — Called with updated values
- `options` (required): ToggleBarOption[] — Options to render
- `multiple`: boolean — Allow multiple selection (checkboxes). If false acts like a radio group.
- `required`: boolean — Require at least one selection
- `size`: SizeValue — Overall size passed to chips
- `chipVariant`: 'filled' | 'outline' | 'light' — Default chip variant when not selected
- `selectedVariant`: 'filled' | 'outline' | 'light' — Variant to use when selected (defaults to 'filled')
- `gap`: number — Gap between chips (px)
- `accessibilityLabel`: string — Accessible name of the group
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
export type ToggleValue = string | number;

export type ToggleGroupValue = ToggleValue | ToggleValue[];

export interface ToggleBarOption {
  /** Display label for the option */
  label: string;
  /** Value for the option */
  value: string | number;
  /** Optional leading content */
  startSection?: React.ReactNode;
  /** Optional trailing content */
  endSection?: React.ReactNode;
  /** Color for the chip when selected */
  color?: ColorProp;
  /** Override the unselected chip variant */
  chipVariant?: 'filled' | 'outline' | 'light';
  /** Disable this option */
  disabled?: boolean;
}
```

## Examples

### Basics

Render a simple `ToggleGroup` and listen for `onChange` to track the active value.

```tsx
import { useState } from 'react';

import { Block, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

export function Demo() {
  const [alignment, setAlignment] = useState('center');

  const handleChange = (nextValue: string | number | (string | number)[]) => {
    if (typeof nextValue === 'string' || typeof nextValue === 'number') {
      setAlignment(String(nextValue));
    }
  };

  return (
    <Block>
      <ToggleGroup value={alignment} exclusive onChange={handleChange}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleGroup>
      <Text size="xs" c="secondary">
        Selected alignment: {alignment}
      </Text>
    </Block>
  );
}
```

### Exclusive Mode

Enable the `exclusive` prop so the group behaves like radio buttons with a single active value.

```tsx
import { ToggleButton, ToggleGroup } from '@plocks/ui';

export function Demo() {
  return (
    <ToggleGroup defaultValue="center" exclusive>
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
      <ToggleButton value="justify">Justify</ToggleButton>
    </ToggleGroup>
  );
}
```

### Variants

Compare solid and ghost toggle groups with the same selected value.

```tsx
import { Column, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

const variants = ['solid', 'ghost'] as const;

export function Demo() {
  return (
    <Column gap="lg">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text fw="semibold">{variant}</Text>
          <ToggleGroup variant={variant} defaultValue="center" exclusive accessibilityLabel={`${variant} alignment`}>
            <ToggleButton value="left">Left</ToggleButton>
            <ToggleButton value="center">Center</ToggleButton>
            <ToggleButton value="right">Right</ToggleButton>
          </ToggleGroup>
        </Column>
      ))}
    </Column>
  );
}
```

### Multiple Values

Read the array returned by `onChange` to keep several toggles activated together.

```tsx
import { useState } from 'react';

import { Block, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

export function Demo() {
  const [formats, setFormats] = useState(['bold']);

  const handleChange = (value: string | number | (string | number)[]) => {
    if (Array.isArray(value)) {
      setFormats(value.map(String));
    }
  };

  return (
    <Block>
      <ToggleGroup value={formats} onChange={handleChange}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
        <ToggleButton value="color">Color</ToggleButton>
      </ToggleGroup>

      <Text size="xs" c="secondary">
        Active formatting: {formats.length > 0 ? formats.join(', ') : 'none'}
      </Text>
    </Block>
  );
}
```

### Orientation

Use the `orientation` prop to switch between horizontal rows (the default) and vertical stacks of toggle buttons.

```tsx
import { Block, Row, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="lg" align="flex-start" wrap="wrap">
      <Block>
        <Text variant="small" c="secondary">Horizontal</Text>
        <ToggleGroup defaultValue="list" exclusive orientation="horizontal">
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="card">Card</ToggleButton>
        </ToggleGroup>
      </Block>

      <Block>
        <Text variant="small" c="secondary">Vertical</Text>
        <ToggleGroup defaultValue="list" exclusive orientation="vertical">
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="grid">Grid</ToggleButton>
          <ToggleButton value="card">Card</ToggleButton>
        </ToggleGroup>
      </Block>
    </Row>
  );
}
```

### Size Variants

Set the `size` prop (`xs` through `3xl`) to match the footprint of surrounding controls.

```tsx
import { Block, Text, ToggleButton, ToggleGroup } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" c="secondary">{size}</Text>
          <ToggleGroup size={size}>
            <ToggleButton value="left">Left</ToggleButton>
            <ToggleButton value="center">Center</ToggleButton>
            <ToggleButton value="right">Right</ToggleButton>
          </ToggleGroup>
        </Block>
      ))}
    </Block>
  );
}
```

### Standalone Toggle

Drive a single toggle without a surrounding group by pairing its `selected` state with `onPress`.

```tsx
import { useState } from 'react';

import { ToggleButton } from '@plocks/ui';

export function Demo() {
  const [selected, setSelected] = useState(false);

  return (
    <ToggleButton
      value="favorite"
      selected={selected}
      onPress={() => setSelected((current) => !current)}
    >
      Mark favorite
    </ToggleButton>
  );
}
```
