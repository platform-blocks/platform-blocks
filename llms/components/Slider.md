# Slider

Slider lets users select a value or range by moving handles along a track.

## Metadata

- Import: `import { Slider } from '@plocks/ui';`
- Tags: slider, range, input, numeric, control
- Docs: https://plocks.dev/components/Slider
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Slider

## Props

- `value`: number — Value (controlled).
- `defaultValue`: number — Initial value (uncontrolled).
- `onChange`: (value: number) => void — Called with every value change (each frame of a drag, each key press).
- `onChangeEnd`: (value: number) => void — Called once when an interaction settles: drag released, or after each key press.
- `valueLabel`: ((value: number) => string) | null — Value label formatter (also the spoken value text); `null` hides the label.
- `min`: number = 0 — Minimum value. Default 0.
- `max`: number = 100 — Maximum value. Default 100.
- `step`: number = 1 — Step increment (arrow keys, snapping). Default 1.
- `largeStep`: number — PageUp / PageDown distance. Default: a tenth of the range.
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Slider orientation. Default `'horizontal'`.
- `inverted`: boolean = false — Reverse the direction: the maximum sits at the start (left) of a horizontal slider, or at the bottom of a vertical one.
- `trackColor`: ThemeColor — Inactive track color.
- `activeTrackColor`: ThemeColor — Active track color.
- `thumbColor`: ThemeColor — Thumb color.
- `trackSize`: number — Track thickness (px).
- `thumbSize`: number — Thumb diameter (px).
- `color`: ThemeColor — Color driving the active track, thumb, and active ticks: a palette token, `'primary.6'` shade syntax, or any CSS color.
- `variant`: 'default' | 'filled' | 'outline' | 'minimal' | 'segmented' | 'unstyled' = 'default' — Visual variant of the slider track + thumb. Defaults to `'default'`.
- `trackStyle`: StyleProp<ViewStyle> — Additional styling for the inactive track.
- `activeTrackStyle`: StyleProp<ViewStyle> — Additional styling for the active track.
- `thumbStyle`: StyleProp<ViewStyle> — Additional styling for the thumb(s).
- `tickColor`: ThemeColor — Inactive tick color.
- `activeTickColor`: ThemeColor — Active tick color.
- `tickStyle`: StyleProp<ViewStyle> — Style applied to inactive tick marks (merged on top of color/size defaults).
- `activeTickStyle`: StyleProp<ViewStyle> — Style applied to active tick marks.
- `tickLabelProps`: Omit<TextProps, 'children'> — Props applied to the `<Text>` rendered for each tick label (style, ff, weight, size, color).
- `valueLabelAlwaysOn`: boolean = false — Keep the value label visible even when not interacting.
- `tooltip`: 'always' | 'hover' | 'never' = 'hover' — When the value label (the bubble over the thumb) shows: `hover` (default) while hovered, dragged or keyboard-focused; `always`; or `never`.
- `valueLabelPosition`: 'top' | 'bottom' | 'left' | 'right' — Where the value label sits relative to the thumb: 'top' / 'bottom' (horizontal), 'left' / 'right' (vertical).
- `valueLabelOffset`: number — Pixel gap between the thumb and the value label (default: 6 for top/bottom, 16 for left/right).
- `valueLabelStyle`: StyleProp<ViewStyle> — Style applied to the value label wrapper (Card/View).
- `valueLabelProps`: Omit<TextProps, 'children'> — Props applied to the value label `<Text>` (style, fw, ff, size, c).
- `valueLabelAsCard`: boolean = true — Wrap the value label in a `<Card>` (default true); false renders the bare `<Text>`.
- `showMarks`: boolean = false — Label the two ends of the track with the min / max values.
- `ticks`: SliderTick[] — Custom ticks/marks to display on the slider.
- `showTicks`: boolean = false — Show automatic tick marks at every `step`.
- `restrictToTicks`: boolean = false — Restrict value changes (pointer and keyboard) to tick positions.
- `containerSize`: number — Slider length when not `fullWidth` (width for horizontal, height for vertical).
- `precision`: number — Decimal places of the default value label. Default: inferred from `step`.
- `fullWidth`: boolean = true — Stretch to fill the parent width (height when vertical). Default true.
- `id`: string — Base id: the field's label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `name` `accessibilityLabel` `accessibilityHint` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { RangeSlider } from '@plocks/ui';`

### RangeSlider

- `value`: [number, number] — Range value `[start, end]` (controlled).
- `defaultValue`: [number, number] — Initial range (uncontrolled). Default `[min, max]`.
- `onChange`: (value: [number, number]) => void — Called with every change.
- `onChangeEnd`: (value: [number, number]) => void — Called once when an interaction settles: drag released, or after each key press.
- `valueLabel`: ((value: number, index: number) => string) | null — Value label formatter for each thumb (also the spoken value text); `null` hides the labels.
- `minRange`: number — Minimum distance kept between the thumbs. Default 0.
- `allowCross`: boolean — Let a thumb be dragged past the other (it becomes the other end of the range). Default `!pushOnOverlap`.
- `pushOnOverlap`: boolean — Thumbs stop at each other instead of crossing (default true). `allowCross` wins when both are set.
- `rangeLabels`: [string, string] — Accessible names of the two thumbs. Default `['Minimum', 'Maximum']`.
- `min`: number — Minimum value. Default 0.
- `max`: number — Maximum value. Default 100.
- `step`: number — Step increment (arrow keys, snapping). Default 1.
- `largeStep`: number — PageUp / PageDown distance. Default: a tenth of the range.
- `orientation`: 'horizontal' | 'vertical' — Slider orientation. Default `'horizontal'`.
- `inverted`: boolean — Reverse the direction: the maximum sits at the start (left) of a horizontal slider, or at the bottom of a vertical one.
- `trackColor`: ThemeColor — Inactive track color.
- `activeTrackColor`: ThemeColor — Active track color.
- `thumbColor`: ThemeColor — Thumb color.
- `trackSize`: number — Track thickness (px).
- `thumbSize`: number — Thumb diameter (px).
- `color`: ThemeColor — Color driving the active track, thumb, and active ticks: a palette token, `'primary.6'` shade syntax, or any CSS color.
- `variant`: 'default' | 'filled' | 'outline' | 'minimal' | 'segmented' | 'unstyled' — Visual variant of the slider track + thumb. Defaults to `'default'`.
- `trackStyle`: StyleProp<ViewStyle> — Additional styling for the inactive track.
- `activeTrackStyle`: StyleProp<ViewStyle> — Additional styling for the active track.
- `thumbStyle`: StyleProp<ViewStyle> — Additional styling for the thumb(s).
- `tickColor`: ThemeColor — Inactive tick color.
- `activeTickColor`: ThemeColor — Active tick color.
- `tickStyle`: StyleProp<ViewStyle> — Style applied to inactive tick marks (merged on top of color/size defaults).
- `activeTickStyle`: StyleProp<ViewStyle> — Style applied to active tick marks.
- `tickLabelProps`: Omit<TextProps, 'children'> — Props applied to the `<Text>` rendered for each tick label (style, ff, weight, size, color).
- `valueLabelAlwaysOn`: boolean — Keep the value label visible even when not interacting.
- `tooltip`: 'always' | 'hover' | 'never' — When the value label (the bubble over the thumb) shows: `hover` (default) while hovered, dragged or keyboard-focused; `always`; or `never`.
- `valueLabelPosition`: 'top' | 'bottom' | 'left' | 'right' — Where the value label sits relative to the thumb: 'top' / 'bottom' (horizontal), 'left' / 'right' (vertical).
- `valueLabelOffset`: number — Pixel gap between the thumb and the value label (default: 6 for top/bottom, 16 for left/right).
- `valueLabelStyle`: StyleProp<ViewStyle> — Style applied to the value label wrapper (Card/View).
- `valueLabelProps`: Omit<TextProps, 'children'> — Props applied to the value label `<Text>` (style, fw, ff, size, c).
- `valueLabelAsCard`: boolean — Wrap the value label in a `<Card>` (default true); false renders the bare `<Text>`.
- `showMarks`: boolean — Label the two ends of the track with the min / max values.
- `ticks`: SliderTick[] — Custom ticks/marks to display on the slider.
- `showTicks`: boolean — Show automatic tick marks at every `step`.
- `restrictToTicks`: boolean — Restrict value changes (pointer and keyboard) to tick positions.
- `containerSize`: number — Slider length when not `fullWidth` (width for horizontal, height for vertical).
- `precision`: number — Decimal places of the default value label. Default: inferred from `step`.
- `fullWidth`: boolean — Stretch to fill the parent width (height when vertical). Default true.
- `id`: string — Base id: the field's label/description/error get `${id}-label` etc.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `name` `accessibilityLabel` `accessibilityHint` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Basic slider usage for selecting numeric values within a range.

```tsx
import { useState } from 'react';
import { Block, Slider } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(25);

  return (
    <Block fullWidth>
      <Slider accessibilityLabel="Volume" value={value} onChange={setValue} />
    </Block>
  );
}
```

### Slider variants

```tsx
import { Block, Slider } from '@plocks/ui';

const VARIANTS = ['default', 'filled', 'outline', 'minimal', 'segmented', 'unstyled'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Slider
          key={variant}
          label={variant}
          variant={variant}
          defaultValue={40}
          step={5}
          showTicks={variant === 'segmented'}
          restrictToTicks={variant === 'segmented'}
        />
      ))}
    </Block>
  );
}
```

### Ticks and Marks

Slider with visible tick marks and labeled values for better precision.

```tsx
import { Block, Slider } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Slider
        accessibilityLabel="Milestone"
        defaultValue={50}
        restrictToTicks
        ticks={[
          { value: 0, label: 'Min' },
          { value: 25 },
          { value: 50, label: 'Mid' },
          { value: 75 },
          { value: 100, label: 'Max' },
        ]}
      />
    </Block>
  );
}
```

### Range Slider

`RangeSlider` puts two thumbs on one track and its `value` is a `[min, max]` tuple, for filters such as price ranges.

```tsx
import { useState } from 'react';
import { Block, RangeSlider } from '@plocks/ui';

export function Demo() {
  const [priceRange, setPriceRange] = useState<[number, number]>([25, 75]);

  return (
    <Block fullWidth>
      <RangeSlider label="Price range" value={priceRange} onChange={setPriceRange} />
    </Block>
  );
}
```

### Value label customization

`valueLabelPosition` chooses where the thumb tooltip sits (`top` / `bottom` for horizontal, `left` / `right` for vertical). `valueLabelOffset` tunes the gap from the thumb. `valueLabelProps` accepts any `<Text>` props — `ff`, `fw`, `size`, `c`, `style` — and `valueLabelStyle` overrides the wrapper Card's style. Set `valueLabelAsCard={false}` for a flat tooltip with no Card chrome. Both `<Slider>` and `<RangeSlider>` accept the same set of props.

```tsx
import { Block, Slider, RangeSlider, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">Bottom</Text>
        <Slider
          accessibilityLabel="Value label below"
          defaultValue={60}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelOffset={2}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Custom text</Text>
        <Slider
          accessibilityLabel="Custom label text"
          defaultValue={72}
          valueLabelAlwaysOn
          valueLabelProps={{
            ff: 'monospace',
            fw: '700',
            size: 'md',
            c: 'primary',
          }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Flat</Text>
        <Slider
          accessibilityLabel="Flat value label"
          defaultValue={72}
          valueLabelAlwaysOn
          valueLabelAsCard={false}
          valueLabelStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
          valueLabelProps={{ ff: 'monospace', fw: '600', c: '#fff' }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">RangeSlider</Text>
        <RangeSlider
          accessibilityLabel="Range with labels below"
          defaultValue={[20, 80]}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelProps={{ fw: '700', size: 'sm' }}
          valueLabel={(v, i) => (i === 0 ? `min ${Math.round(v)}` : `max ${Math.round(v)}`)}
        />
      </Block>

      <Block direction="row" justify="center" gap="xl">
        <Block align="center">
          <Text variant="small" c="secondary">Left</Text>
          <Block style={{ height: 200 }}>
            <Slider
              accessibilityLabel="Vertical, label left"
              defaultValue={40}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="left"
              valueLabelProps={{ fw: '700' }}
            />
          </Block>
        </Block>
        <Block align="center">
          <Text variant="small" c="secondary">Right</Text>
          <Block style={{ height: 200 }}>
            <Slider
              accessibilityLabel="Vertical, label right"
              defaultValue={60}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="right"
              valueLabelProps={{ fw: '700' }}
            />
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
```

### Decimal steps & precision

The thumb tooltip formats its value from the `step`: a fractional step like `0.01` shows two decimals, while an integer step rounds to a whole number (trailing zeros are trimmed, so `0.10` reads as `0.1`). Pass `precision` to force a fixed number of decimals regardless of the step.

```tsx
import { Block, Slider, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">step 0.01</Text>
        <Slider
          accessibilityLabel="Position"
          defaultValue={0.25}
          max={1}
          step={0.01}
          valueLabelAlwaysOn
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">step 0.5</Text>
        <Slider
          accessibilityLabel="Temperature"
          defaultValue={21.5}
          min={16}
          max={30}
          step={0.5}
          valueLabelAlwaysOn
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">precision 2</Text>
        <Slider
          accessibilityLabel="Ratio"
          defaultValue={0.5}
          max={1}
          step={0.1}
          precision={2}
          valueLabelAlwaysOn
        />
      </Block>
    </Block>
  );
}
```

### Slot styling

Each visual layer of the slider is independently customizable: `trackStyle` and `activeTrackStyle` for the track halves, `thumbStyle` for the handle, `tickStyle` / `activeTickStyle` for tick marks, and `tickLabelProps` for tick labels. Per-tick `style` overrides on individual `ticks[i].style` win over the global tick styles. Combined with the value-label slot props (`valueLabelStyle`, `valueLabelProps`) you can fully reskin the slider without forking it.

```tsx
import { Block, Slider, RangeSlider, Text } from '@plocks/ui';

const milestoneTicks = [
  { value: 0, label: '0' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
];

const milestoneTicksWithHighlight = milestoneTicks.map((t) =>
  t.value === 50
    ? {
        ...t,
        style: {
          width: 4,
          height: 14,
          backgroundColor: '#facc15',
          borderRadius: 2,
          top: 11,
        },
      }
    : t,
);

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">Track and thumb</Text>
        <Slider
          accessibilityLabel="Track and thumb overrides"
          defaultValue={35}
          trackStyle={{ height: 10, borderRadius: 2 }}
          activeTrackStyle={{ height: 10, borderRadius: 2 }}
          thumbStyle={{ borderRadius: 4, borderWidth: 0 }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Ticks and tick labels</Text>
        <Slider
          accessibilityLabel="Tick styling"
          defaultValue={50}
          ticks={milestoneTicks}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 12, borderRadius: 1.5, top: 12 }}
          tickLabelProps={{ ff: 'monospace', size: 'xs', fw: '700' }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Per-tick style</Text>
        <Slider
          accessibilityLabel="Per-tick override"
          defaultValue={50}
          ticks={milestoneTicksWithHighlight}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          tickLabelProps={{ size: 'xs' }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">RangeSlider</Text>
        <RangeSlider
          accessibilityLabel="Range with slot styling"
          defaultValue={[20, 80]}
          ticks={milestoneTicks}
          activeTrackColor="#a855f7"
          trackStyle={{ height: 8, borderRadius: 4 }}
          activeTrackStyle={{ height: 8, borderRadius: 4 }}
          thumbStyle={{ backgroundColor: '#a855f7', borderColor: '#7e22ce', borderWidth: 2 }}
          tickStyle={{ width: 2, height: 8, top: 14 }}
          activeTickStyle={{ width: 2, height: 8, top: 14, backgroundColor: '#a855f7' }}
          tickLabelProps={{ size: 'xs', c: 'muted' }}
          valueLabelAlwaysOn
          valueLabelProps={{ fw: '700', size: 'sm' }}
        />
      </Block>
    </Block>
  );
}
```

### Vertical Orientation

Vertical slider orientation for space-efficient layouts and different use cases.

```tsx
import { Block, Slider } from '@plocks/ui';

export function Demo() {
  return (
    <Block style={{ height: 200 }}>
      <Slider accessibilityLabel="Level" defaultValue={60} orientation="vertical" />
    </Block>
  );
}
```

### CustomStyles

Restyle the slider with `color`, `trackSize` / `thumbSize`, and the `trackStyle`, `activeTrackStyle`, and `thumbStyle` overrides. `RangeSlider` accepts the same props.

```tsx
import { Block, RangeSlider, Slider } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Slider
        label="Success palette"
        defaultValue={65}
        color="success"
        trackSize={12}
        thumbSize={30}
        trackStyle={{ opacity: 0.25 }}
        activeTrackStyle={{
          shadowColor: '#34C759',
          shadowOpacity: 0.35,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
        thumbStyle={{ borderColor: '#1F5520', borderWidth: 3 }}
      />
      <RangeSlider
        label="Warning palette"
        defaultValue={[20, 80]}
        color="warning"
        trackSize={10}
        thumbSize={26}
        trackStyle={{ opacity: 0.2 }}
        activeTrackStyle={{ opacity: 0.55 }}
        thumbStyle={{ borderColor: '#B45309', borderWidth: 2 }}
      />
    </Block>
  );
}
```
