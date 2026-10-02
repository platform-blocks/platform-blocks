# TimePicker

TimePicker provides an inline panel for choosing hours, minutes, and optional seconds.

## Metadata

- Import: `import { TimePicker } from '@plocks/dates';`
- Install: `npm install @plocks/dates` — a separate package from `@plocks/ui`
- Status: beta
- Docs: https://plocks.dev/components/TimePicker
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/dates/src/components/TimePicker

## Props

- `value`: TimePickerValue | null — Controlled value. `null` shows the default time (00:00, or 12:00 AM).
- `defaultValue`: TimePickerValue | null
- `onChange`: (next: TimePickerValue) => void — Fired on every column selection.
- `onChangeComplete`: (next: TimePickerValue) => void — Fired when the user picks from the last meaningful column — minutes, or seconds when `withSeconds` is set. `TimePickerInput` uses this to drive `autoClose`.
- `format`: 12 | 24 = 24
- `withSeconds`: boolean = false
- `minuteStep`: number = 5
- `secondStep`: number = 5
- `columnWidth`: number = 88 — Width of each scroll column (hours/minutes/seconds).
- `columnHeight`: number = 200 — Max height of each scroll column.
- `disabled`: boolean = false
- `accessibilityLabel`: string = 'Time' — Accessible name of the column group. @default 'Time'
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
export interface TimePickerValue {
  hours: number; // 0-23 internal
  minutes: number; // 0-59
  seconds?: number; // 0-59
}
```

## Examples

### Basics

Basic controlled usage of the inline TimePicker panel with 24-hour format.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePicker } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 13, minutes: 30 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} />
      <Text size="sm" c="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
```

### Format 12h

Using 12-hour clock format with AM/PM toggle.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePicker } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 0, minutes: 15 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} format={12} />
      <Text size="sm" c="secondary">
        {`Internal (24h): ${formatted}`}
      </Text>
    </Block>
  );
}
```

### With Seconds

Including seconds selection in the TimePicker panel.

```tsx
import React, { useState } from 'react';
import { Block, Text } from '@plocks/ui';
import { TimePicker } from '@plocks/dates';
import type { TimePickerValue } from '@plocks/dates';

export function Demo() {
  const [value, setValue] = useState<TimePickerValue>({ hours: 9, minutes: 5, seconds: 30 });

  const formatted = `${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}:${String(value.seconds || 0).padStart(2, '0')}`;

  return (
    <Block fullWidth>
      <TimePicker value={value} onChange={setValue} withSeconds />
      <Text size="sm" c="secondary">{`Selected: ${formatted}`}</Text>
    </Block>
  );
}
```
