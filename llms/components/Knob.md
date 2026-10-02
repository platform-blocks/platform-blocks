# Knob

Knob provides a rotary control for selecting a value within a range.

## Metadata

- Import: `import { Knob } from '@plocks/ui';`
- Tags: knob, dial, rotary, gesture, input
- Docs: https://plocks.dev/components/Knob
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Knob

## Props

- `behavior`: 'level' | 'stepped' | 'endless' | 'dual' | 'status' = 'level' — What kind of control this is: how it behaves and what it reads out. @default 'level'
- `variant`: 'default' | 'minimal' | 'digital' | 'retro' | 'studio' = 'default' — Visual style preset. Merged under `appearance`, so single properties stay overridable.
- `mode`: 'bounded' | 'endless' — Interaction mode for bounded or endless rotary behavior
- `value`: number — Controlled value
- `defaultValue`: number — Uncontrolled initial value
- `min`: number — Minimum selectable value
- `max`: number — Maximum selectable value
- `step`: number — Step increment applied when interacting
- `onChange`: (value: number) => void — Called on every value change
- `onChangeEnd`: (value: number) => void — Called after interaction completes
- `onScrubStart`: () => void — Fired when the user begins dragging
- `onScrubEnd`: () => void — Fired when the user ends dragging
- `size`: ComponentSizeValue — Size token (`xs`–`3xl`) or an explicit diameter in pixels
- `thumbSize`: number — Diameter of the thumb indicator, in pixels. Defaults to a ratio of the resolved size.
- `disabled`: boolean — Disable all user interaction
- `readOnly`: boolean — Prevent interaction but keep visual state
- `formatLabel`: (value: number) => ReactNode — Custom formatter for the value label
- `withLabel`: boolean — Render the value label inside the knob
- `valueLabel`: KnobValueLabelConfig | false — Structured configuration for the value label block
- `marks`: KnobMark[] — Optional marks rendered around the control
- `restrictToMarks`: boolean — Restrict interaction to the supplied marks
- `label`: ReactNode — Optional visual label rendered outside the knob
- `description`: ReactNode — Optional helper text rendered with the label
- `labelPosition`: 'left' | 'right' | 'top' | 'bottom' — Placement for the external label
- `style`: StyleProp<ViewStyle> — Style overrides for the outer container
- `trackStyle`: StyleProp<ViewStyle> — Style overrides for the circular track
- `thumbStyle`: StyleProp<ViewStyle> — Style overrides for the thumb
- `markLabelStyle`: StyleProp<TextStyle> — Style overrides for mark labels
- `testID`: string — Accessibility identifier
- `accessibilityLabel`: string — Screen reader label
- `appearance`: KnobAppearance — Unified surface styling and interaction overrides
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

### Knob.Progress

- `value` (required): number — Completion, 0–100 (clamped).
- `size`: SizeValue = 'md' — Bar thickness: a control-size token (`getControlSize(theme, size).height`) or pixels. @default 'md'
- `color`: ThemeColor = 'primary' — Fill color: palette token, `'primary.6'` shade syntax, or any CSS color. @default 'primary'
- `radius`: RadiusValue = 'md' — Corner radius: theme radius token, px, `'none'` or `'full'`. @default 'md'
- `striped`: boolean
- `animate`: boolean — Animates the stripes. Requires `striped`. Off while reduced motion is on.
- `transitionDuration`: number = 0 — Animate fill changes over this many ms. `0` (and reduced motion) jumps straight to the value. @default 0
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Axis the bar fills along. Vertical bars fill bottom-up. @default 'horizontal'
- `length`: number | `${number}%` — Length along the main axis. Vertical bars default to 160.
- `trackColor`: string — Track (unfilled) color. Defaults to the theme's `backgrounds.border`.
- `aria-label`: string — Accessible name. Defaults to the `label` (web: by reference).
- `aria-valuetext`: string — Spoken value text, e.g. `"3 of 8 files"`. Defaults to the percentage.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `label`: React.ReactNode — Label rendered outside the track. Strings are styled; nodes render as-is.
- `description`: React.ReactNode — Helper text ("sublabel") rendered directly beneath the label. Hidden while `error` is set.
- `error`: React.ReactNode — Error message rendered below the bar (announced politely). Replaces `description` when present.
- `required`: boolean = false — Marks the field as required, rendering an asterisk beside the label. @default false
- `withAsterisk`: boolean = true — Whether the required marker is drawn. @default true
- `labelPosition`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Placement of the label block relative to the bar. @default 'top'
- `labelGap`: SizeValue = 'xs' — Gap between the label block and the bar — a theme spacing token or pixel value. @default 'xs'
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>`
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the description `<Text>`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Knob.Ring

- `value` (required): number — Current value represented by the ring
- `min`: number — Lower bound for normalization. Defaults to 0.
- `max`: number — Upper bound for normalization. Defaults to 100.
- `size`: number — Diameter of the ring in pixels. Defaults to 100.
- `thickness`: number — Stroke thickness in pixels. Defaults to 12.
- `caption`: React.ReactNode — Optional caption rendered beneath the ring
- `label`: React.ReactNode — Main label rendered in the ring center
- `subLabel`: React.ReactNode — Secondary label rendered below the main label
- `showValue`: boolean — Displays the computed percentage when no label/subLabel is provided. Defaults to true.
- `valueFormatter`: (value: number, percent: number) => React.ReactNode — Formats the displayed value or percentage
- `trackColor`: string — Track color behind the progress stroke. Defaults to the theme's `backgrounds.border`.
- `progressColor`: string | ((value: number, percent: number) => string) — Progress stroke color or resolver
- `colorStops`: RingColorStop[] — Optional color stops evaluated against the computed percent
- `neutral`: boolean — Forces the ring into a neutral state, disabling the progress stroke
- `roundedCaps`: boolean — Controls whether the progress stroke has rounded caps. Defaults to true.
- `ringStyle`: StyleProp<ViewStyle> — Style applied to the ring wrapper
- `contentStyle`: StyleProp<ViewStyle> — Style applied to the center content container
- `labelStyle`: StyleProp<TextStyle> — Style overrides for the main label
- `subLabelStyle`: StyleProp<TextStyle> — Style overrides for the secondary label
- `captionStyle`: StyleProp<TextStyle> — Style overrides for the caption
- `labelColor`: string — Color override for the main label
- `subLabelColor`: string — Color override for the secondary label
- `captionColor`: string — Color override for the caption
- `children`: React.ReactNode | ((context: RingRenderContext) => React.ReactNode) — Custom center content. Receives value info when passed as a function
- `accessibilityLabel`: string — Accessible name of the ring (a `progressbar`). Defaults to the text of `caption`, else of `label`. The value is exposed as aria-value* on its own.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Knob.Root

- `children`: ReactNode — Modular children composed of Knob.* sub-components
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Knob` props (`behavior` `variant` `mode` `value` `defaultValue` `min` `max` `step` `onChange` `onChangeEnd` `onScrubStart` `onScrubEnd` `size` `thumbSize` `disabled` `readOnly` `formatLabel` `withLabel` `valueLabel` `marks` `restrictToMarks` `label` `description` `labelPosition` `style` `trackStyle` `thumbStyle` `markLabelStyle` `testID` `accessibilityLabel` `appearance`): https://plocks.dev/llms/components/Knob.md

Also accepts the shared props — spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

`Knob.Fill`, `Knob.Pointer`, `Knob.RingSegment`, `Knob.Thumb`, `Knob.TickLayer`, `Knob.ValueLabel` have no props interface of their own.

## Types

```ts
export interface KnobValueLabelConfig {
  /** Placement relative to the knob surface */
  position?: KnobValueLabelPosition;
  /** Primary formatter for the displayed value */
  formatter?: (value: number) => ReactNode;
  /** Optional prefix rendered before the value */
  prefix?: ReactNode;
  /** Optional suffix rendered after the value */
  suffix?: ReactNode;
  /** Style overrides for the wrapper */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style overrides for the primary text */
  textStyle?: StyleProp<TextStyle>;
  /** Secondary readout rendered at an independent slot */
  secondary?: {
    formatter?: (value: number) => ReactNode;
    position?: KnobValueLabelPosition;
    prefix?: ReactNode;
    suffix?: ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  };
}

export interface KnobMark {
  /** Absolute value within the knob range to display */
  value: number;
  /** Optional label rendered near the tick */
  label?: ReactNode;
  /** Optional accent color applied when the mark becomes active */
  accentColor?: string;
  /** Optional icon surfaced by status-oriented variants */
  icon?: ReactNode;
}

export interface KnobAppearance {
  /**
   * Take the knob's accent — thumb, arm, and progress arc — from the `accentColor` of the
   * mark nearest the current value, so the whole control matches the detent it is on.
   * `behavior="status"` already does this; this opts any other behavior in. Marks without
   * an `accentColor` leave the theme accent in place. @default false
   */
  accentFromMarks?: boolean;
  ring?: KnobRingStyle;
  fill?: KnobFillStyle;
  thumb?: KnobThumbStyle | false;
  ticks?: KnobTickLayer | KnobTickLayer[] | false;
  pointer?: KnobPointerStyle | false;
  arc?: KnobArcConfig;
  progress?: KnobProgressConfig | false;
  panning?: KnobPanningConfig;
  interaction?: KnobInteractionConfig;
}

export interface KnobRingStyle {
  thickness?: number;
  color?: string;
  trailColor?: string;
  backgroundColor?: string;
  cap?: 'butt' | 'round';
  radiusOffset?: number;
  shadow?: KnobRingShadow;
  /** Colored bands drawn over the ring, laid end to end from `min`. */
  segments?: KnobRingSegment[];
  /**
   * How `segments` relate to the current value.
   *
   * - `'track'` (default) paints every band across the whole ring as a static backdrop —
   *   zones you read the value against, with the progress arc drawn over the top.
   * - `'progress'` makes the bands the progress arc itself: they are clipped at the current
   *   value and nothing is drawn beyond it, so the dial fills through each color in turn.
   *   The plain progress stroke is suppressed, since the bands replace it.
   */
  segmentMode?: 'track' | 'progress';
}

export interface KnobFillStyle {
  color?: string;
  borderWidth?: number;
  borderColor?: string;
  radiusOffset?: number;
}

export interface KnobThumbStyle {
  size?: number;
  /**
   * Scale applied to the thumb while the knob is being scrubbed, as press feedback.
   * `1` disables it; values below 1 shrink instead. @default 1.25
   */
  activeScale?: number;
  shape?: KnobThumbShape;
  color?: string;
  strokeWidth?: number;
  strokeColor?: string;
  offset?: number;
  glow?: KnobThumbGlow;
  style?: StyleProp<ViewStyle>;
  renderThumb?: (context: KnobThumbRenderContext) => ReactNode;
}

export interface KnobTickLayer {
  source?: KnobTickSource;
  values?: number[];
  /**
   * With `source: 'count'`, how many evenly spaced ticks to lay around the arc — an LED
   * ring of a fixed resolution, independent of `step` and `marks`. Capped at 512.
   */
  count?: number;
  shape?: KnobTickShape;
  length?: number;
  width?: number;
  radiusOffset?: number;
  position?: 'inner' | 'center' | 'outer';
  /**
   * Color of an active tick. A resolver colors each tick individually; for
   * `source: 'marks'`, a mark's own `accentColor` is used ahead of a flat string, so
   * per-detent colors need no resolver at all.
   */
  color?: KnobTickColor;
  /** Color of a tick the layer's `activeMode` leaves unlit. Also accepts a resolver. */
  inactiveColor?: KnobTickColor;
  /**
   * What counts as an active tick in this layer.
   *
   * - `'fill'` (default) lights every tick from `min` up to the current value, the way a
   *   meter fills.
   * - `'nearest'` lights only the single tick the pointer is aimed at, the way a selector
   *   or detent indicator reads. Matched by angle, so it works on endless knobs too.
   */
  activeMode?: 'fill' | 'nearest';
  iconName?: string;
  label?: KnobTickLabelConfig;
  renderTick?: (context: {
    value: number;
    angle: number;
    index: number;
    isActive: boolean;
    center: { x: number; y: number };
    radius: number;
  }) => ReactNode;
}

export interface KnobPointerStyle {
  visible?: boolean;
  length?: number;
  width?: number;
  offset?: number;
  color?: string;
  cap?: 'round' | 'butt';
  counterweight?: { size?: number; color?: string };
}
```

## Examples

### Basics

Controlled knob with percentage formatting and a mirrored readout below the dial.

```tsx
import { useState } from 'react';
import { Knob } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(90);

  return (
    <Knob accessibilityLabel="Level"
      value={value}
      onChange={setValue}
      valueLabel={{
        formatter: (current) => Math.round(current),
        suffix: '°',
      }}
    />
  );
}
```

### Events

Demonstrates live value, committed value, and scrubbing lifecycle callbacks.

```tsx
import { useState } from 'react';
import { Block, DataList, Knob } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(32);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [committed, setCommitted] = useState(value);

  return (
    <Block direction="row" align="center" justify="space-evenly">
      <Knob accessibilityLabel="Value"
        value={value}
        onChange={setValue}
        onChangeEnd={setCommitted}
        onScrubStart={() => setIsScrubbing(true)}
        onScrubEnd={() => setIsScrubbing(false)}
      />
      <DataList
        data={[
          { label: 'Current', value: Math.round(value) },
          { label: 'Last commit', value: Math.round(committed) },
          { label: 'State', value: isScrubbing ? 'Scrubbing' : 'Idle' },
        ]}
      />
    </Block>
  );
}
```

### Visual Variants

`variant` picks the dial's look, independent of `behavior`. Each preset sets stroke weights, caps, body fill, and which indicator carries the value, taking its colors from the theme so the same knob reads correctly in light and dark. Presets are merged *under* `appearance`, so any single property stays overridable.

```tsx
import { useState } from 'react';

import { Block, Knob, Row, Text } from '@plocks/ui';
import type { KnobVariant } from '@plocks/ui';

const VARIANTS: { variant: KnobVariant; blurb: string }[] = [
  { variant: 'default', blurb: 'Stock dial' },
  { variant: 'minimal', blurb: 'Hairline, dense UIs' },
  { variant: 'digital', blurb: 'Hard edges, lit marker' },
  { variant: 'retro', blurb: 'Solid body, indicator arm' },
  { variant: 'studio', blurb: 'Plugin rack' },
];

export function Demo() {
  const [value, setValue] = useState(62);

  return (
    <Block fullWidth direction="row" justify="space-between">
        {VARIANTS.map(({ variant, blurb }) => (
          <Block key={variant} align="center" gap="xs">
            <Knob accessibilityLabel={`${variant} knob`}
              value={value}
              onChange={setValue}
              variant={variant}
            />
            <Text size="sm" fw="600">{variant}</Text>
          </Block>
        ))}
    </Block>
  );
}
```

### Endless

Endless mode resets the dial each turn while tracking the cumulative rotation value.

```tsx
import { useMemo, useState } from 'react';
import { Block, Knob } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(0);
  const normalizedAngle = useMemo(() => ((value % 360) + 360) % 360, [value]);
  const rotations = useMemo(() => value / 360, [value]);

  return (
    <Block fullWidth>
      <Knob accessibilityLabel="Jog wheel"
        value={value}
        onChange={setValue}
        behavior="endless"
        valueLabel={{
          formatter: () => `${Math.round(normalizedAngle)}°`,
          secondary: {
            formatter: () => `${rotations.toFixed(2)} turns`,
          },
        }}
      />
    </Block>
  );
}
```

### Dual Readout

Demonstrates the `dual` behavior with a center frequency label and a derived percentage below the knob.

```tsx
import { useMemo, useState } from 'react';

import { Block, Knob } from '@plocks/ui';

export function Demo() {
  const [cutoff, setCutoff] = useState(3200);
  const percent = useMemo(() => Math.round(((cutoff - 200) / (8000 - 200)) * 100), [cutoff]);

  return (
    <Block fullWidth>
      <Knob accessibilityLabel="Cutoff"
        value={cutoff}
        onChange={setCutoff}
        min={200}
        max={8000}
        step={50}
        behavior="dual"
        size={180}
        valueLabel={{
          position: 'center',
          formatter: (val) => `${Math.round(val)} Hz`,
          secondary: {
            position: 'bottom',
            formatter: () => `${percent}% span`,
          },
        }}
        marks={[
          { value: 400, label: 'Warm' },
          { value: 1200, label: 'Neutral' },
          { value: 6400, label: 'Bright' },
        ]}
      />
    </Block>
  );
}
```

### Status Selector

Highlights the `status` behavior with icon-enhanced marks, accent colors, and the active scene named directly beneath the icon in the center slot.

```tsx
import { useMemo, useState } from 'react';
import { Block, Icon, Knob } from '@plocks/ui';

import { STATUS_SCENES } from './data';

export function Demo() {
  const [value, setValue] = useState(0);

  const statusMarks = useMemo(
    () => STATUS_SCENES.map(scene => ({
      ...scene,
      icon: <Icon name={scene.iconName} size="3xl" color={scene.accentColor} />,
    })),
    []
  );

  const activeStatus = useMemo(
    () => statusMarks.reduce((closest, mark) => (
      Math.abs(mark.value - value) < Math.abs(closest.value - value) ? mark : closest
    ), statusMarks[0]),
    [statusMarks, value]
  );

  return (
    <Block>
      <Knob accessibilityLabel="Status"
        value={value}
        onChange={setValue}
        min={0}
        max={360}
        step={90}
        my="3xl"
        marks={statusMarks}
        restrictToMarks
        behavior="status"
        size={200}
        valueLabel={{
          position: 'center',
          formatter: () => activeStatus.label,
        }}
      />
    </Block>
  );
}
```

`data.ts`

```ts
/**
 * The scenes the knob selects between, one per detent around the dial. Icons are named
 * rather than built here so this stays plain data; the demo turns each name into an
 * `<Icon>` tinted with the same accent.
 */
export type StatusScene = {
  /** Position on the 0–360 dial. */
  value: number;
  label: string;
  accentColor: string;
  iconName: string;
};

export const STATUS_SCENES: StatusScene[] = [
  { value: 0, label: 'Sleep', accentColor: '#64748b', iconName: 'moon' },
  { value: 90, label: 'Focus', accentColor: '#0ea5e9', iconName: 'target' },
  { value: 180, label: 'Charge', accentColor: '#22c55e', iconName: 'bolt' },
  { value: 270, label: 'Party', accentColor: '#f97316', iconName: 'sparkles' },
];
```

### Segmented Progress

The same bands with `ring.segmentMode: 'progress'`, which makes them the progress arc itself: they stop at the current value and nothing is drawn beyond it, so the fill runs through each color in turn.

```tsx
import { useState } from 'react';
import { Block, Knob } from '@plocks/ui';

const ZONES = [
  { value: 60, color: '#22c55e' },
  { value: 25, color: '#f59e0b' },
  { value: 15, color: '#ef4444' },
];

export function Demo() {
  const [load, setLoad] = useState(72);

  return (
    <Block align="center">
      <Knob accessibilityLabel="Load"
        value={load}
        onChange={setLoad}
        variant="minimal"
        max={100}
        appearance={{
          arc: { startAngle: -135, sweepAngle: 270 },
          ring: {  segments: ZONES, segmentMode: 'progress' },
          fill: { radiusOffset: -20 },
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val)}%` }}
      />
    </Block>
  );
}
```

### Tick Selector

A twelve-position rotary switch using `activeMode: 'nearest'`, which lights only the tick the pointer is aimed at. The default `'fill'` instead lights every tick up to the value, the way a meter fills.

```tsx
import { useState } from 'react';
import { Block, Knob } from '@plocks/ui';
import { POSITION_COLORS } from './data';

// Twelve detents on a full circle. `max` is 12 rather than 11 so position 11 sits one step
// short of the top instead of overlapping position 0. Each detent carries its own
const POSITIONS = POSITION_COLORS.map((accentColor, index) => ({ value: index, accentColor }));

export function Demo() {
  const [position, setPosition] = useState(3);

  return (
    <Block >
      <Knob accessibilityLabel="Position"
        value={position}
        onChange={setPosition}
        min={0}
        max={12}
        marks={POSITIONS}
        restrictToMarks
        appearance={{
          accentFromMarks: true,
          ticks: [
            {
              source: 'marks',
              shape: 'line',
              // Only the detent the arm is aimed at lights up. The default 'fill' would
              // instead light every tick from 0 up to the current position.
              activeMode: 'nearest',
              length: 14,
              width: 20,
              position: 'outer',
              inactiveColor: ({ mark }) => (mark?.accentColor ? `${mark.accentColor}44` : '#475569'),
            },
          ],
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val) + 1}` }}
      />
    </Block>
  );
}
```

`data.ts`

```ts
/** One hue per detent, walking the spectrum so neighbouring positions stay tellable apart. */
export const POSITION_COLORS = [
  '#f87171',
  '#fb923c',
  '#fbbf24',
  '#facc15',
  '#a3e635',
  '#4ade80',
  '#34d399',
  '#22d3ee',
  '#38bdf8',
  '#818cf8',
  '#c084fc',
  '#f472b6',
];
```

### Compound Panning

Stereo-style panning knob composed with `Knob.Root`, split progress, and custom tick labels to highlight the compound sub-component API.

```tsx
import { useMemo, useState } from 'react';

import { Block, Knob, Text } from '@plocks/ui';

// The split arc reads the same on both sides of center: direction is carried by which way
// the arc grows and by the L/R label, not by a color change.
const PAN_COLOR = '#4ade80';

export function Demo() {
  const [pan, setPan] = useState(-18);

  const readout = useMemo(() => {
    if (pan === 0) return 'Center';
    return pan > 0 ? `Right ${Math.abs(pan)}` : `Left ${Math.abs(pan)}`;
  }, [pan]);

  return (
    <Block align="center">
      <Knob.Root accessibilityLabel="Pan"
        min={-100}
        max={100}
        value={pan}
        onChange={setPan}
        step={1}
        size={220}
        appearance={{
          arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
          panning: {
            pivotValue: 0,
            positiveColor: PAN_COLOR,
            negativeColor: PAN_COLOR,
          },
        }}
      >
        <Knob.Fill
          radiusOffset={-28}
          color="#0f172a"
          borderWidth={2}
          borderColor="rgba(148, 163, 184, 0.4)"
        />
        <Knob.Ring color="#0f172a" trailColor="#1f2937" />
        <Knob.Progress mode="split" thickness={14} roundedCaps />
        <Knob.Thumb  color="#f8fafc" strokeWidth={3} strokeColor="#0f172a" />
        <Knob.ValueLabel
          position="center"
          formatter={(value) => `${value > 0 ? 'R' : value < 0 ? 'L' : ''}${Math.abs(Math.round(value))}`}
          textStyle={{ fontSize: 30, fontWeight: '700', color: '#f8fafc' }}
        />
      </Knob.Root>
      <Text size="sm" c="secondary">
        Stereo balance · {readout}
      </Text>
    </Block>
  );
}
```

### Pointer Clock

Read-only analog clock face built with the compound `Knob.Root` API: a bezel ring, 60 minute marks with bolder hour marks, hour numerals, and `Knob.Pointer` as the hour hand driven by the value (minutes past 12). The minute and second hands are plain rotated views composed over the same center, synced to the system clock each second.

```tsx
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Block, Knob, Text, useTheme } from '@plocks/ui';

const SIZE = 240;
const CENTER = SIZE / 2;
const MINUTES_PER_TURN = 12 * 60;

const HOUR_VALUES = Array.from({ length: 12 }, (_, index) => index * 60);
const HOUR_LABELS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
// 60 minute marks around the dial; hour positions are drawn by the layer above.
const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index * 12).filter(
  (value) => value % 60 !== 0
);

const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  return `${hour === 0 ? 12 : hour}:${(minutes % 60).toString().padStart(2, '0')}`;
};

/** Hand pivoting on the dial center: the wrapper is twice the hand length, so it rotates around it. */
const Hand = ({
  angle,
  length,
  width,
  color,
  tail = 0,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  tail?: number;
}) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      left: CENTER - width / 2,
      top: CENTER - length,
      width,
      height: length * 2,
      transform: [{ rotate: `${angle}deg` }],
    }}
  >
    <View
      style={{
        width,
        height: length + tail,
        borderRadius: width / 2,
        backgroundColor: color,
      }}
    />
  </View>
);

export function Demo() {
  const theme = useTheme();
  const face = theme.backgrounds.surface;
  const ink = theme.text.primary;
  const accent = theme.colors.primary[6];

  // Start on a fixed time so server-rendered and client markup match, then sync on mount.
  const [time, setTime] = useState({ minutes: 10 * 60 + 10, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        minutes: (now.getHours() % 12) * 60 + now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Block align="center" gap="sm">
      <View style={{ width: SIZE, height: SIZE }}>
        <Knob.Root
          min={0}
          max={MINUTES_PER_TURN}
          value={time.minutes}
          size={SIZE}
          readOnly
          withLabel={false}
          accessibilityLabel={`Clock showing ${formatTime(time.minutes)}`}
          appearance={{
            arc: { startAngle: 0, sweepAngle: 360, clampInput: true },
          }}
        >
          <Knob.Ring thickness={12} color={ink} trailColor={ink} backgroundColor={face} />
          {/* Chapter ring just inside the minute marks */}
          <Knob.Fill
            color={face}
            radiusOffset={-18}
            borderWidth={1}
            borderColor={theme.backgrounds.border}
          />
          <Knob.Progress visible={false} />
          <Knob.Thumb visible={false} />
          <Knob.TickLayer
            source="values"
            values={MINUTE_VALUES}
            shape="line"
            length={6}
            width={1.5}
            position="inner"
            color={theme.text.muted}
            inactiveColor={theme.text.muted}
          />
          <Knob.TickLayer
            source="values"
            values={HOUR_VALUES}
            shape="line"
            length={12}
            width={3}
            position="inner"
            color={ink}
            inactiveColor={ink}
            label={{
              show: true,
              formatter: (_, index) => HOUR_LABELS[index],
              position: 'inner',
              offset: -26,
              style: { color: ink, fontSize: 15, fontWeight: '600' },
            }}
          />
          {/* Hour hand — the knob value is minutes past 12, so it advances gradually. */}
          <Knob.Pointer visible length={58} width={6} color={ink} counterweight={{ size: 12, color: ink }} />
        </Knob.Root>

        <Hand angle={((time.minutes % 60) / 60) * 360} length={88} width={4} color={ink} />
        <Hand angle={(time.seconds / 60) * 360} length={94} width={1.5} color={accent} tail={18} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: CENTER - 4,
            top: CENTER - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: accent,
          }}
        />
      </View>

      <Text size="xl" fw="700">
        {formatTime(time.minutes)}
      </Text>
    </Block>
  );
}
```

### Semicircle Gauge

Semicircle gauge layout that uses `Knob.Root` with custom ring thickness, contiguous progress, and a pointer hand for instrumentation-style readouts.

```tsx
import { useMemo, useState } from 'react';

import { Block, Knob, Text } from '@plocks/ui';

const TEMPERATURE_STOPS = [0, 25, 50, 75, 100];

export function Demo() {
  const [level, setLevel] = useState(62);

  const status = useMemo(() => {
    if (level >= 85) return 'Critical';
    if (level >= 60) return 'Elevated';
    if (level >= 35) return 'Nominal';
    return 'Idle';
  }, [level]);

  return (
    <Block align="center">
      <Knob.Root accessibilityLabel="Level"
        min={0}
        max={100}
        value={level}
        onChange={setLevel}
        step={1}
        size={260}
        appearance={{
          arc: { startAngle: -120, sweepAngle: 240, clampInput: true },
          interaction: { spinStopAtLimits: true },
        }}
      >
        <Knob.Fill visible={false} />
        <Knob.Ring thickness={30} color="#0f172a" trailColor="#1f2937" radiusOffset={-4} />
        <Knob.RingSegment value={35} color="#1e3a8a" />
        <Knob.RingSegment value={25} color="#155e75" />
        <Knob.RingSegment value={25} color="#854d0e" />
        <Knob.RingSegment value={15} color="#7f1d1d" />
        <Knob.Progress
          mode="contiguous"
          thickness={14}
          color="#22d3ee"
          roundedCaps
        />
        <Knob.TickLayer
          source="values"
          values={TEMPERATURE_STOPS}
          shape="line"
          length={22}
          width={3}
          position="outer"
          radiusOffset={10}
          label={{
            show: true,
            formatter: (_, index) => `${TEMPERATURE_STOPS[index]}%`,
            offset: 24,
            style: { color: '#cbd5f5', fontSize: 12, fontWeight: '600' },
          }}
        />
        <Knob.Pointer length={90} width={4} color="#f8fafc" offset={-8} cap="round" />
        <Knob.Thumb visible={false} />
        <Knob.ValueLabel
          position="bottom"
          formatter={(value) => `${Math.round(value)}% capacity`}
          textStyle={{ fontSize: 18, fontWeight: '600', color: '#f8fafc' }}
          secondary={{
            formatter: () => status,
            position: 'bottom',
            textStyle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
          }}
        />
      </Knob.Root>
      <Text size="sm" c="secondary">
        Thermal headroom · {status}
      </Text>
    </Block>
  );
}
```

### Tick Layers

Stacks two tick layers on one dial: labelled lines driven by `marks`, over a finer dot scale from an explicit step list.

```tsx
import { useState } from 'react';

import { Block, Knob } from '@plocks/ui';

const LEVEL_MARKS = [
  { value: 0, label: 'Mute' },
  { value: 25, label: 'Low' },
  { value: 50, label: 'Mid' },
  { value: 75, label: 'High' },
  { value: 100, label: 'Max' },
];

export function Demo() {
  const [level, setLevel] = useState(48);

  return (
    <Block align="center">
      <Knob accessibilityLabel="Level"
        value={level}
        onChange={setLevel}
        min={0}
        max={100}
        step={1}
        marks={LEVEL_MARKS}
        size={180}
        appearance={{
          // A full circle would put the 0 and 100 marks on the same point, overprinting
          // their labels; the 270deg arc gives each end of the scale its own position.
          arc: { startAngle: -135, sweepAngle: 270 },
          ring: { thickness: 16 },
          fill: { radiusOffset: -24 },
          progress: { mode: 'contiguous', color: '#f97316' },
          ticks: [
            // Two layers over the same dial: labelled lines from `marks`, and a finer
            // dot scale from an explicit step list underneath them.
            {
              source: 'marks',
              shape: 'line',
              length: 16,
              width: 3,
              position: 'outer',
              label: { show: true, position: 'outer' },
            },
            {
              source: 'steps',
              values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
              shape: 'dot',
              radiusOffset: -6,
              color: '#475569',
              inactiveColor: 'rgba(71, 85, 105, 0.4)',
            },
          ],
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val)}%` }}
      />
    </Block>
  );
}
```

### Interaction modes

Showcases spin, vertical-slide, horizontal-slide, and scroll gestures enabled through `appearance.interaction`, updating the label as each mode locks in.

```tsx
import { useState } from 'react';
import { Block, DataList, Knob, Row, Text, useTheme } from '@plocks/ui';

const MODES = [
  {
    key: 'spin',
    name: 'Spin',
    detail: 'Drag in a circular path. Move away from the thumb for finer adjustments.',
  },
  {
    key: 'vertical-slide',
    name: 'Vertical slide',
    detail: 'Grab either side of the knob and drag up or down for mixer-style throws.',
  },
  {
    key: 'horizontal-slide',
    name: 'Horizontal slide',
    detail: 'Start above or below the center, then drag left or right for sideways sweeps.',
  },
  {
    key: 'scroll',
    name: 'Scroll',
    detail: 'Hover with a mouse or trackpad and use the wheel/two-finger scroll.',
  },
] as const;

type ModeName = (typeof MODES)[number]['key'];

const MODE_LABELS: Record<ModeName, string> = MODES.reduce((acc, mode) => {
  acc[mode.key] = mode.name;
  return acc;
}, {} as Record<ModeName, string>);

export function Demo() {
  const theme = useTheme();
  const [value, setValue] = useState(12);
  const [activeMode, setActiveMode] = useState<ModeName | null>(null);

  return (
    <Block fullWidth>
      <Row gap="xl" align="center" wrap="wrap">
        <Block align="center">
          <Text size="sm" fw="500">
            Multimodal control
          </Text>
          <Knob accessibilityLabel="Pan"
            value={value}
            onChange={setValue}
            min={-100}
            max={100}
            step={1}
            size={180}
            behavior="endless"
            valueLabel={{
              position: 'center',
              formatter: (current) => `${current > 0 ? '+' : ''}${Math.round(current)}`,
              secondary: {
                position: 'bottom',
                formatter: () => (activeMode ? `${MODE_LABELS[activeMode]} mode` : 'Try a gesture'),
              },
            }}
            appearance={{
              arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
              ring: { thickness: 16, color: '#0f172a', trailColor: '#1e293b' },
              fill: { color: '#020617', radiusOffset: -14 },
              progress: {
                mode: 'split',
                roundedCaps: true,
                thickness: 10,
                color: '#38bdf8',
                trailColor: '#475569',
              },
              interaction: {
                modes: MODES.map((mode) => mode.key),
                lockThresholdPx: 32,
                slideRatio: 1.5,
                variancePx: 6,
                spinPrecisionRadius: 80,
                respectStartSide: true,
                scroll: { enabled: true, ratio: 0.8, preventPageScroll: true },
                onModeChange: setActiveMode,
              },
            }}
          />
        </Block>
        <Block style={{ minWidth: 140, flex: 1 }}>
          <DataList spacing="2xl" labelWidth={140}>
            {MODES.map((mode) => (
              <DataList.Item key={mode.key}>
                {/* The mode currently driving the knob is pulled up to full-contrast text. */}
                <DataList.ItemLabel
                  c={activeMode === mode.key ? theme.text.primary : theme.text.muted}
                >
                  {mode.name}
                </DataList.ItemLabel>
                <DataList.ItemValue c={theme.text.secondary}>{mode.detail}</DataList.ItemValue>
              </DataList.Item>
            ))}
          </DataList>
        </Block>
      </Row>
    </Block>
  );
}
```
