# RollingNumber

RollingNumber animates changing digits in a numeric readout.

## Metadata

- Import: `import { RollingNumber } from '@plocks/ui';`
- Tags: number, counter, animation, odometer, metric
- Docs: https://plocks.dev/components/RollingNumber
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/RollingNumber

## Props

- `value` (required): number — Value to display. Each digit that changes rolls to its new position.
- `prefix`: string — Static text rendered before the number (e.g. `"$ "`).
- `suffix`: string — Static text rendered after the number (e.g. `" USD"`).
- `thousandSeparator`: boolean | string = false — `true` for `,`, or an explicit separator string.
- `decimalSeparator`: string = '.' — Character between the integer and decimal parts. Default `.`.
- `decimalScale`: number — Number of decimal places to render.
- `fixedDecimalScale`: boolean = false — Pad the decimal part with zeros up to `decimalScale`.
- `transitionDuration`: number — Roll duration in ms. Default `600`. `0` — and an active reduced-motion preference — snap straight to the new digits.
- `animationDuration`: number — alias for `transitionDuration`.
- `timingFunction`: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease' — Easing curve for the roll. Default `ease`.
- `stagger`: number = 0 — Per-column delay in ms, applied right-to-left so the least significant digit leads. Default `0` (all columns move together).
- `trend`: RollingNumberTrend — Which way the digits roll. By default they roll up when the number grows and down when it shrinks, so 19 → 20 carries the ones column forward 9 → 0 like an odometer. `1` or `-1` fix the direction, `0` moves each digit straight to its new value, and a function decides per change.
- `animateOnMount`: boolean = false — Animate from zero on first render instead of appearing settled. Default `false`.
- `size`: SizeValue = 'md' — Font size token or explicit number. Default `'md'`.
- `c`: string — Text color. Accepts a text role (`'muted'`), palette syntax (`'primary.6'`) or any CSS color.
- `fw`: TextStyle['fontWeight'] | 'normal' | 'medium' | 'semibold' | 'bold' — Font weight.
- `ff`: string — Custom font family.
- `tabularNums`: boolean = true — Use tabular (fixed-width) figures so columns do not shift width as digits change. Default `true`.
- `style`: StyleProp<ViewStyle> — Style for the row that wraps prefix, digits and suffix.
- `textStyle`: StyleProp<TextStyle> — Style applied to every glyph — digits, separators, prefix and suffix.
- `digitStyle`: StyleProp<TextStyle> — Style applied to digit glyphs only.
- `accessibilityLabel`: string — Screen-reader label. Defaults to the formatted value including prefix and suffix, so the rolling columns never have to be read digit by digit.
- `testID`: string

Also accepts the shared props — spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type RollingNumberTrend = -1 | 0 | 1 | ((previous: number, value: number) => number);
```

## Examples

### Basics

A counter whose digits roll to their new positions. Only the columns that changed move.

```tsx
import { useState } from 'react';
import { Button, Flex, RollingNumber } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(1234);

  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber value={value} size={48} fw="bold" />
      <Button variant="outline" onPress={() => setValue((current) => current + 1)}>+1</Button>
    </Flex>
  );
}
```

### Currency

`prefix`, `suffix` and the decimal options cover currency formatting without an external formatter. Copying the value on web yields the formatted string, not the digit strips.

```tsx
import { useState } from 'react';
import { Button, Flex, RollingNumber } from '@plocks/ui';

export function Demo() {
  const [total, setTotal] = useState(1299.99);

  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber
        value={total}
        prefix="$ "
        suffix=" USD"
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        size={36}
        fw="semibold"
      />
      <Button variant="outline" onPress={() => setTotal((current) => current + 149.5)}>
        Add item
      </Button>
    </Flex>
  );
}
```

### Timing

`transitionDuration`, `timingFunction` and `stagger` shape the roll. Stagger delays each column right-to-left, so the carries trail the ones place the way an odometer does.

```tsx
import { useState } from 'react';
import { Button, Flex, RollingNumber, Text } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(407219);

  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="xs">
        <Text size="xs" c="muted">Snappy — 200ms, no stagger</Text>
        <RollingNumber value={value} transitionDuration={200} size={32} thousandSeparator />
      </Flex>

      <Flex direction="column" gap="xs">
        <Text size="xs" c="muted">Odometer — 900ms, 60ms stagger</Text>
        <RollingNumber
          value={value}
          transitionDuration={900}
          timingFunction="ease-out"
          stagger={60}
          size={32}
          thousandSeparator
        />
      </Flex>

      <Button variant="outline" onPress={() => setValue(Math.floor(Math.random() * 999999))}>
        Shuffle
      </Button>
    </Flex>
  );
}
```

### Trend

By default the digits roll up when the number grows and down when it shrinks, so 19 → 20 carries the ones column forward like an odometer. `trend={1}` or `trend={-1}` fix the direction, `trend={0}` moves each digit straight to its new value, and a function `(previous, value) => number` decides per change.

```tsx
import { useState } from 'react';
import { Button, Flex, RollingNumber, Text } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(19);

  return (
    <Flex direction="column" gap="lg">
      <Flex gap="xl">
        <Flex direction="column" align="center" gap="xs">
          <Text size="xs" c="muted">Auto</Text>
          <RollingNumber value={value} size={32} />
        </Flex>
        <Flex direction="column" align="center" gap="xs">
          <Text size="xs" c="muted">Always up</Text>
          <RollingNumber value={value} trend={1} size={32} />
        </Flex>
        <Flex direction="column" align="center" gap="xs">
          <Text size="xs" c="muted">Per digit</Text>
          <RollingNumber value={value} trend={0} size={32} />
        </Flex>
      </Flex>

      <Flex gap="sm" justify="center">
        <Button variant="outline" onPress={() => setValue((current) => current - 1)}>−1</Button>
        <Button variant="outline" onPress={() => setValue((current) => current + 1)}>+1</Button>
      </Flex>
    </Flex>
  );
}
```

### Live metric

A ticking live metric. Values that change faster than the roll retarget mid-flight rather than snapping.

```tsx
import { useEffect, useState } from 'react';
import { Flex, RollingNumber, Text } from '@plocks/ui';

export function Demo() {
  const [requests, setRequests] = useState(84213);

  useEffect(() => {
    const timer = setInterval(() => {
      setRequests((current) => current + Math.floor(Math.random() * 40));
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <Flex direction="column" gap="xs">
      <Text size="xs" c="muted" tt="uppercase">Requests today</Text>
      <RollingNumber
        value={requests}
        thousandSeparator
        size={40}
        fw="bold"
        transitionDuration={500}
        stagger={40}
      />
    </Flex>
  );
}
```
