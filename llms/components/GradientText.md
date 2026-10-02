# GradientText

A text component that displays text with gradient colors. Supports customizable gradients with multiple colors, different angles, and animated transitions (web only).

## Metadata

- Import: `import { GradientText } from '@plocks/ui';`
- Tags: text, gradient, animation, color
- Docs: https://plocks.dev/components/GradientText
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/GradientText

## Props

- `colors` (required): string[] — Array of colors for the gradient (at least 2 required)
- `locations`: number[] — Color stops (0-1) for each color. If not provided, colors are evenly distributed
- `angle`: number — Gradient direction angle in degrees (0 = left to right, 90 = top to bottom, etc.)
- `start`: [number, number] — Start point [x, y] (0-1). Overrides angle if provided
- `end`: [number, number] — End point [x, y] (0-1). Overrides angle if provided
- `position`: number — Gradient position offset (0-1). Moves the gradient along the line
- `animation`: GradientTextAnimation — Sweep the gradient position continuously (web only). Runs as a CSS animation, so no JavaScript executes per frame. Overrides `position` while it is running; on native — and under reduced motion — the gradient stays static.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Text` props (`children` `tx` `txParams` `variant` `textRole` `size` `fw` `ta` `lh` `lts` `tt` `fs` `td` `ff` `flex` `shrink` `top` `right` `bottom` `left` `as` `selectable` `onPress` `onLayout` `value` `numberOfLines` `ellipsizeMode` `id` `nativeID`): https://plocks.dev/llms/components/Text.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface GradientTextAnimation {
  /** Position offset the sweep starts from (same space as `position`) */
  from: number;
  /** Position offset the sweep ends at */
  to: number;
  /** Seconds for a single sweep */
  duration: number;
  /** Seconds to wait before the first sweep */
  delay?: number;
  /** Repeat forever instead of running once */
  repeat?: boolean;
  /** Seconds held at `to` between repeats */
  repeatDelay?: number;
}
```

## Examples

### Basics

Pass two or more `colors` to fill text with a gradient. All other `Text` props still apply.

```tsx
import { GradientText } from '@plocks/ui';

export function Demo() {
  return (
    <GradientText colors={['#FF0080', '#7928CA']}>
      Hello World
    </GradientText>
  );
}
```

### Angles

Different gradient directions using the `angle` prop.

```tsx
import { Block, GradientText } from '@plocks/ui';

const angles = [0, 45, 90, 135];

export function Demo() {
  return (
    <Block gap="md">
      {angles.map((angle) => (
        <GradientText key={angle} colors={['#FF0080', '#7928CA']} angle={angle} size="lg">
          {angle}° gradient
        </GradientText>
      ))}
    </Block>
  );
}
```

### Variants

The text variant changes the semantic element while keeping the gradient fill.

```tsx
import { Column, GradientText, Text } from '@plocks/ui';

const variants = ['h3', 'p', 'strong'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">{variant}</Text>
          <GradientText variant={variant} colors={['#FF0080', '#7928CA']}>
            Gradient text with semantic markup
          </GradientText>
        </Column>
      ))}
    </Column>
  );
}
```

### Controlled

Control the gradient position manually using the `position` prop (0.0 to 1.0).

```tsx
import { useState } from 'react';
import { Block, GradientText, Slider } from '@plocks/ui';

export function Demo() {
  const [position, setPosition] = useState(0);

  return (
    <Block>
      <GradientText
        value="Controlled Gradient"
        position={position}
        colors={['#ff76ba', '#FF0080', '#7928CA', '#4F46E5']}
        size="3xl"
      />
      <Slider
        value={position}
        onChange={setPosition}
        min={0}
        max={1}
        step={0.01}
      />
    </Block>
  );
}
```
