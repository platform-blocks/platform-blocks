# Wheel

Use one Wheel for a single choice or place columns together for related values.

## Metadata

- Import: `import { Wheel } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Wheel
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Wheel

## Props

- `items` (required): readonly WheelItem<T>[]
- `value`: T — Selected value (controlled).
- `defaultValue`: T — Initially selected value (uncontrolled). Default: the first item.
- `onChange`: (value: T) => void — Called with each value that crosses the center (during a spin, a tap, or a key press).
- `onChangeComplete`: (value: T) => void — Called once the wheel settles on a value.
- `label` (required): string — Accessible name for the wheel, such as "Hour".
- `h`: number = 200 — Column height in px; the selected item sits in its middle. @default 200
- `itemHeight`: number = 40
- `disabled`: boolean = false
- `haptics`: boolean = true — Play a selection detent as each value crosses the center.
- `w`: DimensionProp — Width
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface WheelItem<T extends WheelValue = WheelValue> {
  value: T;
  label?: ReactNode;
}

export type WheelValue = string | number;
```

## Examples

### Basics

Spin or tap the wheel to choose a season. The selected value updates as the wheel moves.

```tsx
import { useState } from 'react';
import { Block, Text, Wheel } from '@plocks/ui';

const seasons = [
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Autumn', label: 'Autumn' },
  { value: 'Winter', label: 'Winter' },
];

export function Demo() {
  const [season, setSeason] = useState('Summer');

  return (
    <Block align="center" gap="sm">
      <Wheel items={seasons} value={season} onChange={setSeason} label="Season" h={180} />
      <Text>Selected: {season}</Text>
    </Block>
  );
}
```

### Time columns

Pair two independently controlled wheels to select an hour and minute.

```tsx
import { useState } from 'react';
import { Block, Row, Text, Wheel } from '@plocks/ui';

const hours = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: String(index + 1).padStart(2, '0'),
}));

const minutes = [0, 15, 30, 45].map((value) => ({
  value,
  label: String(value).padStart(2, '0'),
}));

export function Demo() {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(30);

  return (
    <Block align="center" gap="sm">
      <Row gap="sm">
        <Wheel items={hours} value={hour} onChange={setHour} label="Hour" h={180} itemHeight={36} />
        <Wheel
          items={minutes}
          value={minute}
          onChange={setMinute}
          label="Minute"
          h={180}
          itemHeight={36}
        />
      </Row>
      <Text>
        Time: {hour}:{String(minute).padStart(2, '0')}
      </Text>
    </Block>
  );
}
```

### Disabled wheel

Disable a wheel when its value should remain visible but cannot be changed.

```tsx
import { Wheel } from '@plocks/ui';

const options = [
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Large', label: 'Large' },
];

export function Demo() {
  return <Wheel items={options} value="Medium" label="Size" disabled />;
}
```
