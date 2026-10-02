# Joystick

Joystick captures two-axis input as a spring-return stick or persistent XY pad.

## Metadata

- Import: `import { Joystick } from '@plocks/ui';`
- Tags: joystick, xy, pad, gesture, two-axis, input
- Docs: https://plocks.dev/components/Joystick
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Joystick

## Props

- `value`: JoystickValue — Controlled value. Both axes are normalized to −1…1.
- `defaultValue`: JoystickValue — Initial value while uncontrolled. Default `{ x: 0, y: 0 }`.
- `onChange`: (value: JoystickValue) => void — Fired for every position change, including each frame of a drag.
- `onChangeEnd`: (value: JoystickValue) => void — Fired once when the gesture ends, with the value it settled on.
- `onChangeStart`: (value: JoystickValue) => void — Fired when a drag or keyboard interaction begins.
- `shape`: 'circle' | 'square' = 'circle' — `circle` clamps the handle to a disc — a stick. `square` clamps each axis on its own so the corners are reachable — an XY pad. Default `circle`.
- `returnToCenter`: boolean — Spring the handle back to the centre when released, the way a physical stick does. Defaults to `true` for `circle` and `false` for `square`.
- `lockAxis`: 'x' | 'y' — Restrict travel to a single axis.
- `deadZone`: number = 0 — Report `0` until the handle travels this far from centre (0–1). Default `0`.
- `step`: number = 0 — Snap each axis to this increment. Default `0` (continuous).
- `keyboardStep`: number — Increment applied by a single arrow key press. Defaults to `step` or `0.1`.
- `invertY`: boolean = true — Report a positive `y` when the handle is pushed up. Default `true`.
- `size`: ComponentSizeValue = 'md' — Outer size in px, or a size token. Default `'md'`.
- `handleSize`: number — Handle diameter in px. Defaults to ~32% of `size`.
- `variant`: 'default' | 'filled' | 'outline' | 'minimal' | 'unstyled' = 'default' — Visual preset. Default `'default'`.
- `color`: string — Accent color: a palette token (`'primary'`), `'primary.6'` shade syntax, or any CSS color.
- `baseColor`: string — Base surface color override.
- `handleColor`: string — Handle color override.
- `showGuides`: boolean = true — Draw the static centre guides. Default `true`.
- `showCrosshair`: boolean = false — Draw accent rules that track the handle on each axis — the XY-pad readout. Default `false`.
- `valueLabel`: boolean | ((value: JoystickValue) => string) = false — Render the current value under the pad. Pass a function to format it.
- `label`: React.ReactNode — Field label rendered above the pad.
- `disabled`: boolean = false — Ignore all input and dim the control.
- `readOnly`: boolean = false — Ignore all input while keeping full contrast.
- `transitionDuration`: number — Spring-back / keyboard transition duration in ms. Default `220`.
- `baseStyle`: StyleProp<ViewStyle> — Style for the pad surface.
- `handleStyle`: StyleProp<ViewStyle> — Style for the handle.
- `valueLabelStyle`: StyleProp<TextStyle> — Style for the value label text.
- `accessibilityLabel`: string — Accessible name when there is no visible `label`.
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
export interface JoystickValue {
  x: number;
  y: number;
}
```

## Examples

### Basics

A stick that springs back to centre on release. Drag anywhere on the pad — the gesture keeps tracking even when the finger leaves it.

```tsx
import { useState } from 'react';
import { Joystick } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState({ x: 0, y: 0 });

  return (
    <Joystick accessibilityLabel="Joystick"
      value={value}
      onChange={setValue}
      showCrosshair
      valueLabel
    />
  );
}
```

### Variants

Compare the joystick presets, including the unstyled base for custom skins.

```tsx
import { Column, Flex, Joystick, Text } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'minimal', 'unstyled'] as const;

export function Demo() {
  return (
    <Flex direction="row" gap="lg" wrap="wrap">
      {variants.map(variant => (
        <Column key={variant} gap="xs" align="center">
          <Text size="sm">{variant}</Text>
          <Joystick variant={variant} accessibilityLabel={`${variant} joystick`} />
        </Column>
      ))}
    </Flex>
  );
}
```

### XY pad

`shape="square"` clamps each axis independently so the corners are reachable, and the handle holds its position on release — the shape a filter or effect pad wants.

```tsx
import { useState } from 'react';
import { Flex, Joystick, Text } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState({ x: -0.4, y: 0.6 });

  // Map the pad onto a pair of parameters the way an effect unit would.
  const cutoff = Math.round(((value.x + 1) / 2) * 18000 + 200);
  const resonance = ((value.y + 1) / 2).toFixed(2);

  return (
    <Flex direction="column" gap="md">
      <Joystick
        shape="square"
        size="lg"
        value={value}
        onChange={setValue}
        showCrosshair
        label="Filter"
      />
      <Text size="sm" c="muted">Cutoff {cutoff} Hz · Resonance {resonance}</Text>
    </Flex>
  );
}
```

### Dead zone and steps

`deadZone` ignores small deflections around centre and rescales the rest, so full travel still reports 1. `step` snaps each axis onto a grid.

```tsx
import { useState } from 'react';
import { Flex, Joystick } from '@plocks/ui';

export function Demo() {
  const [free, setFree] = useState({ x: 0, y: 0 });
  const [stepped, setStepped] = useState({ x: 0, y: 0 });

  return (
    <Flex gap="xl" wrap="wrap">
      <Joystick
        label="Dead zone 0.25"
        deadZone={0.25}
        value={free}
        onChange={setFree}
        valueLabel
      />
      <Joystick
        label="Step 0.25"
        shape="square"
        step={0.25}
        returnToCenter={false}
        value={stepped}
        onChange={setStepped}
        showCrosshair
        valueLabel
      />
    </Flex>
  );
}
```

### Axis lock

`lockAxis` restricts travel to one direction. A single-axis pad also leaves the perpendicular direction to the page, so vertical scrolling still works over a horizontal control.

```tsx
import { useState } from 'react';
import { Flex, Joystick, Text } from '@plocks/ui';

export function Demo() {
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const position = pan.x === 0
    ? 'Center'
    : `${pan.x < 0 ? 'L' : 'R'} ${Math.round(Math.abs(pan.x) * 100)}`;

  return (
    <Flex direction="column" gap="md" align="flex-start">
      <Joystick
        label="Pan"
        lockAxis="x"
        size="sm"
        value={pan}
        onChange={setPan}
      />
      <Text size="sm" c="muted">{position}</Text>
    </Flex>
  );
}
```
