# Ring

Ring displays progress or status in a circular indicator.

## Metadata

- Import: `import { Ring } from '@plocks/ui';`
- Tags: ring, progress, indicator, radial
- Docs: https://plocks.dev/components/Ring
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Ring

## Props

- `value` (required): number — Current value represented by the ring
- `min`: number = 0 — Lower bound for normalization. Defaults to 0.
- `max`: number = 100 — Upper bound for normalization. Defaults to 100.
- `size`: number = 100 — Diameter of the ring in pixels. Defaults to 100.
- `thickness`: number = 12 — Stroke thickness in pixels. Defaults to 12.
- `caption`: React.ReactNode — Optional caption rendered beneath the ring
- `label`: React.ReactNode — Main label rendered in the ring center
- `subLabel`: React.ReactNode — Secondary label rendered below the main label
- `showValue`: boolean = true — Displays the computed percentage when no label/subLabel is provided. Defaults to true.
- `valueFormatter`: (value: number, percent: number) => React.ReactNode — Formats the displayed value or percentage
- `trackColor`: string — Track color behind the progress stroke. Defaults to the theme's `backgrounds.border`.
- `progressColor`: string | ((value: number, percent: number) => string) — Progress stroke color or resolver
- `colorStops`: RingColorStop[] — Optional color stops evaluated against the computed percent
- `neutral`: boolean = false — Forces the ring into a neutral state, disabling the progress stroke
- `roundedCaps`: boolean = true — Controls whether the progress stroke has rounded caps. Defaults to true.
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

## Types

```ts
export interface RingColorStop {
  /** Threshold (0-100) that determines when the color becomes active */
  value: number;
  /** Stroke color applied once the threshold is reached */
  color: string;
}

export interface RingRenderContext {
  /** Clamped value within the provided min/max range */
  value: number;
  /** Normalized percentage (0-100) for the current value */
  percent: number;
  /** Minimum bound used for normalization */
  min: number;
  /** Maximum bound used for normalization */
  max: number;
}
```

## Examples

### Basics

Drive multiple ring presentations from a single stateful value and expose how sizing and labels adapt.

```tsx
import { useState } from 'react';
import { Block, Button, Ring, Row } from '@plocks/ui';

export function Demo() {
  const [value, setValue] = useState(72);

  return (
    <Block align="center" gap="md">
      <Row gap="lg" align="center">
        <Ring value={value} caption="Completion" />
        <Ring value={value} size={72} thickness={8} caption="Compact" />
      </Row>
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

### Dynamic Color Stops

Display how `colorStops` shift the progress color as values cross threshold ranges.

```tsx
import { Ring, Row } from '@plocks/ui';

const colorStops = [
  { value: 0, color: '#f87171' },
  { value: 60, color: '#f59e0b' },
  { value: 90, color: '#14b8a6' },
];

export function Demo() {
  return (
    <Row gap="lg" justify="center" wrap="wrap">
      {[48, 72, 97].map((value) => (
        <Ring key={value} value={value} colorStops={colorStops} caption={`${value}%`} />
      ))}
    </Row>
  );
}
```

### Custom Center Content

Showcase the render-prop API for injecting icons, text, or status badges inside the ring.

```tsx
import { Block, Icon, Ring, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="lg" justify="center" wrap="wrap">
      <Ring value={86} caption="Pipeline">
        {({ percent }) => (
          <Block align="center">
            <Icon name="rocket" size="lg" color="primary" />
            <Text fw="700">{Math.round(percent)}%</Text>
          </Block>
        )}
      </Ring>

      <Ring value={0} neutral caption="Design system">
        <Block align="center">
          <Icon name="clock" size="lg" color="gray" />
          <Text size="xs" c="secondary">
            On hold
          </Text>
        </Block>
      </Ring>
    </Row>
  );
}
```
