# ComboboxPopover

Use a ref-forwarding child inside Target. On phones the list opens in a centered dialog.

## Metadata

- Import: `import { ComboboxPopover } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/ComboboxPopover
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ComboboxPopover

## Props

- `multiple`: false | true = false — Allow several values.
- `value`: string | null | string[] — Controlled value. `null` = nothing selected. Controlled values.
- `defaultValue`: string | null | string[] — Initial value when uncontrolled. Initial values when uncontrolled.
- `onChange`: ((value: string | null, option: ComboboxPopoverOption<TItem> | null) => void) | ((value: string[], options: ComboboxPopoverOption<TItem>[]) => void) — Called with the new value and its option (`null, null` when deselected). Called with the new values and their options, in selection order.
- `allowDeselect`: boolean = true — Pressing the selected option again clears the value. @default true
- `children` (required): ReactNode — Content holding exactly one `ComboboxPopover.Target`.
- `data` (required): ComboboxPopoverData<TItem> — Options: strings, `{ value, label?, disabled? }` objects (extra fields allowed) or `{ group, items }` groups.
- `searchable`: boolean = false — Adds a search input at the top of the dropdown that filters the options.
- `searchValue`: string — Controlled search text.
- `defaultSearchValue`: string — Initial search text when uncontrolled.
- `onSearchChange`: (search: string) => void — Called with the new search text (typing, and `''` when the dropdown closes).
- `searchPlaceholder`: string = 'Search…' — Placeholder and accessible name of the search input. @default 'Search…'
- `filter`: ComboboxPopoverFilter<TItem> — Custom filter / sort, applied while `searchable`. Receives parsed options and groups; the default keeps options whose label contains the search text (case-insensitive).
- `limit`: number = Infinity — Maximum number of options shown at once, applied while `searchable`.
- `nothingFoundMessage`: ReactNode — Shown when no option matches (or `data` is empty). Without it, a dropdown with nothing to show doesn't open.
- `withCheckIcon`: boolean = true — Show a check mark on selected options. @default true
- `checkIconPosition`: 'start' | 'end' = 'start' — Side of the label the check mark sits on. @default 'start'
- `withAlignedLabels`: boolean = false — Reserve the check mark's slot on every option, so unchecked labels line up with checked ones. @default false
- `renderOption`: (input: ComboboxPopoverRenderOptionInput<TItem>) => ReactNode — Replaces an option's content (the row stays an accessible, selectable option named by its label).
- `maxDropdownHeight`: number = 260 — Maximum height of the option list before it scrolls, px. @default 260
- `selectFirstOptionOnDropdownOpen`: boolean = false — Highlight the first option when the dropdown opens, instead of the selected one. @default false
- `onOptionSubmit`: (value: string) => void — Called with an option's value when it is chosen (press, Enter or Space), before `onChange`.
- `dropdownOpened`: boolean — Controlled open state of the dropdown.
- `defaultDropdownOpened`: boolean = false — Initial open state when uncontrolled. @default false
- `onDropdownOpen`: () => void — Called when the dropdown asks to open (target press or key).
- `onDropdownClose`: () => void — Called when the dropdown asks to close (selection, Escape, outside press, Tab).
- `position`: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' = 'bottom-start' — Placement relative to the target, written for LTR (mirrored in RTL). @default 'bottom-start'
- `offset`: number = 6 — Gap between target and dropdown, px. @default 6
- `dropdownWidth`: number | 'target' = 'target' — Dropdown width: a number, or `'target'` — at least as wide as the target. @default 'target'
- `strategy`: 'absolute' | 'fixed' | 'portal' — 'fixed' (web default): viewport-fixed; 'absolute'; 'portal' (native default): rendered in an RN Modal at the app root. Phones use a sheet instead.
- `size`: SizeValue = 'sm' — Size of the option rows and search input. @default 'sm'
- `disabled`: boolean = false — Disables the target; the dropdown never opens. @default false
- `aria-label`: string — Accessible name of the option list (and of the phone sheet). Defaults to the target labelling it (web).
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

`import { ComboboxPopoverTarget } from '@plocks/ui';`

### ComboboxPopoverTarget

- `children` (required): ReactElement — One element that accepts a ref (a `Button`, `Pressable`, …). It becomes the dropdown's anchor and receives `onPress`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` and (web) the opening keys.

### ComboboxPopover.Target

- `children` (required): ReactElement — One element that accepts a ref (a `Button`, `Pressable`, …). It becomes the dropdown's anchor and receives `onPress`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` and (web) the opening keys.

## Types

```ts
export type ComboboxPopoverOption<TItem extends ComboboxPopoverItem = ComboboxPopoverItem> = TItem & {
  label: string;
};

export interface ComboboxPopoverItem {
  /** Value reported by `onChange` / `onOptionSubmit`; unique across `data`. */
  value: string;
  /** Text shown in the dropdown and matched by the search. @default value */
  label?: string;
  /** Rendered but not selectable, and skipped by the arrow keys. */
  disabled?: boolean;
}
```

## Examples

### Basics

Attach an option list to any ref-forwarding trigger. Search filters labels.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

export function Demo() {
  return (
    <ComboboxPopover data={['Apple', 'Banana', 'Cherry', 'Date']} searchable>
      <ComboboxPopover.Target>
        <Button>Select fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Multiple Selection

`multiple` keeps the list open while options are toggled.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} multiple defaultValue={['Apple']}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Disabled Options

Disabled entries stay visible and are skipped by selection.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = [{ value: 'Apple' }, { value: 'Banana', disabled: true }, { value: 'Cherry' }];

export function Demo() {
  return (
    <ComboboxPopover data={data}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Groups

Group headings organize related options.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = [
  { group: 'Fruit', items: ['Apple', 'Banana'] },
  { group: 'Vegetables', items: ['Carrot', 'Pea'] },
];

export function Demo() {
  return (
    <ComboboxPopover data={data}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Searchable

Typing filters options by their labels.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} searchable>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Custom Sort

`filter` can sort the parsed options after filtering.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} searchable filter={({ options }) => [...options].reverse()}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Limit Results

`limit` caps the number of matching options.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} searchable limit={3}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Nothing Found

Show a message when no options match the search.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} searchable nothingFoundMessage="No fruit matches">
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Check Icon Position

Move the selected check mark to the end of each row.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} defaultValue="Apple" checkIconPosition="end" withAlignedLabels>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Disallow Deselect

`allowDeselect={false}` keeps a selected option selected on a second press.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} defaultValue="Apple" allowDeselect={false}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Custom Option

`renderOption` replaces row content while retaining option semantics.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} renderOption={({ option }) => option.label.toUpperCase()}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Dropdown Position

`position` chooses the side of the target.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} position="top-start">
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Dropdown Width

Use a numeric `dropdownWidth` instead of matching the target.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export function Demo() {
  return (
    <ComboboxPopover data={data} dropdownWidth={320}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Large Data

The dropdown scrolls when the data exceeds its height.

```tsx
import { Button, ComboboxPopover } from '@plocks/ui';

const data = Array.from({ length: 100 }, (_, index) => `Option ${index + 1}`);

export function Demo() {
  return (
    <ComboboxPopover data={data} maxDropdownHeight={180}>
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```

### Controlled Dropdown

`dropdownOpened` lets the parent own open state.

```tsx
import { useState } from 'react';
import { Button, ComboboxPopover } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  return (
    <ComboboxPopover
      data={['Apple', 'Banana']}
      dropdownOpened={opened}
      onDropdownOpen={() => setOpened(true)}
      onDropdownClose={() => setOpened(false)}
    >
      <ComboboxPopover.Target>
        <Button>Choose fruit</Button>
      </ComboboxPopover.Target>
    </ComboboxPopover>
  );
}
```
