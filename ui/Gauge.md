# Gauge

Use Gauge for a value within a known range. Configure ranges, ticks, and labels or compose its parts directly.

## Metadata

- Import: `import { Gauge } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Gauge
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Gauge

## Props

- `value` (required): number — Current value
- `min`: number = 0 — Minimum value
- `max`: number = 100 — Maximum value
- `size`: number | string = DEFAULT_SIZE — Gauge size in px (non-numeric values fall back to 200).
- `thickness`: number = 8 — Track thickness
- `startAngle`: number = 135 — Start angle in degrees (0° = top)
- `endAngle`: number = 45 — End angle in degrees
- `rotationOffset`: number = 0 — Rotation offset in degrees (rotates entire gauge)
- `color`: ColorValue | string = 'primary' — Accent color of the needle and center dot: palette token, `'primary.6'`, or any CSS color.
- `trackColor`: string — Track color. Defaults to the theme's `backgrounds.borderStrong`.
- `ranges`: GaugeRange[] — Color ranges
- `ticks`: GaugeTicks — Tick configuration
- `labels`: GaugeLabels — Label configuration
- `needle`: GaugeNeedle — Needle configuration
- `animationDuration`: number = 500 — Needle animation duration in ms. `0` (and reduced motion) moves the needle instantly.
- `animationEasing`: GaugeEasing | (string & {}) = 'ease-out' — Needle animation easing.
- `disabled`: boolean = false — Dims the gauge.
- `aria-label`: string — Accessible name of the gauge.
- `children`: React.ReactNode — Children for compound component pattern
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

### Gauge.Center

- `color`: string — Center dot color
- `size`: number — Center dot size
- `show`: boolean — Whether to show center
- `children`: React.ReactNode — Custom center content
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Gauge.Labels

- `config`: GaugeLabels — Labels configuration
- `positions`: number[] — Custom positions
- `formatter`: (value: number) => string — Label formatter
- `color`: string — Label color
- `fontSize`: number — Font size in px. Defaults to the theme's `sm` font size.
- `offset`: number — Offset from edge
- `labelStyle`: TextStyle — Style applied to every label text.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Gauge.Needle

- `value`: number — Needle value (angle will be calculated)
- `angle`: number — Direct angle override
- `config`: GaugeNeedle — Needle configuration
- `color`: string — Needle color
- `width`: number — Needle width
- `length`: number — Needle length
- `shape`: 'line' | 'arrow' | 'triangle' — Needle shape
- `animationDuration`: number — Animation duration
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Gauge.Range

- `from` (required): number — Range start value
- `to` (required): number — Range end value
- `color` (required): string — Range color
- `thickness`: number — Range thickness (inherits from parent if not specified)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Gauge.Ticks

- `config`: GaugeTicks — Tick configuration
- `major`: number — Major tick count
- `minor`: number — Minor tick count
- `positions`: number[] — Custom positions
- `length`: number — Tick length
- `color`: string — Tick color
- `width`: number — Tick width. Defaults to 2 for major ticks and 1 for minor ticks.
- `type`: 'major' | 'minor' — Tick type
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Gauge.Track

- `color`: string — Track color. Defaults to the gauge's `backgroundColor`, else `backgrounds.borderStrong`.
- `thickness`: number — Track thickness
- `opacity`: number — Track opacity
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface GaugeRange {
  /** Starting value for the range */
  from: number;
  /** Ending value for the range */
  to: number;
  /** Color for this range */
  color: string;
  /**
   * Name of the band (`'Normal'`, `'Danger'`). While the value falls inside the
   * band, the name is appended to the gauge's spoken value text.
   */
  label?: string;
}

export interface GaugeTicks {
  /** Number of major ticks */
  major?: number;
  /** Number of minor ticks */
  minor?: number;
  /** Custom major tick positions */
  majorPositions?: number[];
  /** Custom minor tick positions */
  minorPositions?: number[];
  /** Major tick length */
  majorLength?: number;
  /** Minor tick length */
  minorLength?: number;
  /** Tick color */
  color?: string;
  /** Tick width (stroke thickness). Defaults to 2 for major ticks and 1 for minor ticks. */
  width?: number;
}

export interface GaugeLabels {
  /** Whether to show labels */
  show?: boolean;
  /** Custom label positions */
  positions?: number[];
  /** Label formatter function. Also formats the gauge's spoken value. */
  formatter?: (value: number) => string;
  /** Label color */
  color?: string;
  /** Label font size */
  fontSize?: number;
  /** Label offset from gauge edge */
  offset?: number;
}

export interface GaugeNeedle {
  /** Needle color. Defaults to the gauge `color`. */
  color?: string;
  /** Needle width/thickness */
  width?: number;
  /** Needle length (0-1, percentage of radius) */
  length?: number;
  /** Needle shape */
  shape?: GaugeNeedleShape;
  /** Whether to show center dot */
  showCenter?: boolean;
  /** Center dot color */
  centerColor?: string;
  /** Center dot size */
  centerSize?: number;
}

export type GaugeEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
```

## Examples

### Basics

Adjust a measured value and watch the needle move across the scale.

```tsx
import { useState } from 'react';
import { Block, Button, Gauge, Row } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(65);

  return (
    <Block align="center" gap="md">
      <Gauge
        value={value}
        size={220}
        aria-label="Completion"
        ticks={{ major: 5 }}
        labels={{ show: true, formatter: (current) => `${current}%` }}
      />
      <Row gap="sm">
        <Button variant="outline" onPress={() => setValue(Math.max(0, value - 10))}>
          -10%
        </Button>
        <Button onPress={() => setValue(Math.min(100, value + 10))}>+10%</Button>
      </Row>
    </Block>
  );
}
```

### Colored ranges

Color the scale by operating range and include the current band in the spoken value.

```tsx
import { Gauge } from '@plocks/ui';

const ranges = [
  { from: 0, to: 40, color: '#3b82f6', label: 'Low' },
  { from: 40, to: 75, color: '#f59e0b', label: 'Elevated' },
  { from: 75, to: 100, color: '#ef4444', label: 'High' },
];

export function Demo() {
  return (
    <Gauge
      value={68}
      size={220}
      aria-label="System load"
      ranges={ranges}
      ticks={{ major: 5, minor: 4 }}
      labels={{ show: true }}
    />
  );
}
```

### Compound parts

Compose the track, range, ticks, needle, and center to control each part directly.

```tsx
import { Gauge } from '@plocks/ui';

export function Demo() {
  return (
    <Gauge value={72} size={220} aria-label="Battery charge">
      <Gauge.Track />
      <Gauge.Range from={0} to={25} color="#ef4444" />
      <Gauge.Range from={25} to={100} color="#22c55e" />
      <Gauge.Ticks major={5} />
      <Gauge.Labels formatter={(value) => `${value}%`} />
      <Gauge.Needle config={{ shape: 'arrow' }} />
      <Gauge.Center />
    </Gauge>
  );
}
```
