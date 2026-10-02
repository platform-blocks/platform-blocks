# ShimmerText

Animated text highlight that sweeps a configurable gradient across the content. Ideal for loading states, premium callouts, and attention-grabbing text accents.

## Metadata

- Import: `import { ShimmerText } from '@plocks/ui';`
- Tags: text, shimmer, animation, gradient
- Docs: https://plocks.dev/components/ShimmerText
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ShimmerText

## Props

- `children`: ReactNode — Text node children. Overrides `text` when provided
- `text`: string — Text content to render when not using children
- `c`: string — Base text color rendered underneath the shimmer. Default: `theme.text.muted`.
- `colors`: string[] — Optional gradient stops override
- `shimmerColor`: string — Highlight color used for the shimmer pass. Default: `theme.text.primary`.
- `spread`: number — Width of the highlight band as a multiple of the text width (higher = wider highlight). The band always travels from fully clear of one edge to fully clear of the other, so this also sets how far it moves per cycle.
- `duration`: number — Duration of a single shimmer cycle in seconds
- `delay`: number — Delay before the shimmer starts (seconds)
- `repeatDelay`: number — Pause held at the end of each cycle, with the band off screen (seconds)
- `repeat`: boolean — Whether the shimmer should repeat indefinitely
- `once`: boolean — Animate only once after becoming visible
- `direction`: 'ltr' | 'rtl' — Direction of shimmer movement
- `debug`: boolean — Enable verbose logging for debugging
- `onLayout`: TextProps['onLayout'] — Called with the layout of the shimmer container
- `startOnView`: boolean — Start shimmering once the component enters the viewport (web only)
- `inViewMargin`: string — `rootMargin` for the `startOnView` IntersectionObserver (web only)
- `containerStyle`: StyleProp<ViewStyle> — Style for the wrapping container view (style props apply here too).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Text` props (`tx` `txParams` `variant` `textRole` `size` `fw` `ta` `lh` `lts` `tt` `fs` `td` `ff` `flex` `shrink` `position` `top` `right` `bottom` `left` `as` `selectable` `onPress` `numberOfLines` `ellipsizeMode` `id` `nativeID`): https://plocks.dev/llms/components/Text.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Wrap text in `ShimmerText` to add the default looping highlight with no additional configuration.

```tsx
import { Block, ShimmerText } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <ShimmerText size="xl" fw="bold">
        Weekly highlights go live
      </ShimmerText>
      <ShimmerText>
        New arrivals shimmer into view every Friday at noon.
      </ShimmerText>
    </Block>
  );
}
```

### Interactive controls

Expose `spread`, `repeat`, and `once` controls to let readers tune the shimmer loop at runtime.

```tsx
import { useState } from 'react';
import { Block, Row, ShimmerText, Slider, Switch, Text } from '@plocks/ui';

const MIN_SPREAD = 1;
const MAX_SPREAD = 4;
const SPREAD_STEP = 0.1;

export function Demo() {
  const [spread, setSpread] = useState(2);
  const [repeat, setRepeat] = useState(true);
  const [once, setOnce] = useState(false);

  const handleRepeatChange = (value: boolean) => {
    setRepeat(value);
    if (value) {
      setOnce(false);
    }
  };

  const handleOnceChange = (value: boolean) => {
    setOnce(value);
    if (value) {
      setRepeat(false);
    }
  };

  return (
    <Block align="flex-start" fullWidth>
      <ShimmerText
        spread={spread}
        repeat={repeat}
        once={once}
        repeatDelay={0.6}
        duration={1.6}
        shimmerColor="#38bdf8"
        fw="bold"
        size="lg"
      >
        Interactive shimmer headline
      </ShimmerText>

      <Block w="100%">
        <Text variant="small" fw="medium">
          Spread: {spread.toFixed(1)}
        </Text>
        <Slider
          value={spread}
          onChange={setSpread}
          min={MIN_SPREAD}
          max={MAX_SPREAD}
          step={SPREAD_STEP}
        />
      </Block>

      <Block w="100%">
        <Row align="center" justify="space-between">
          <Text variant="small">Repeat animation</Text>
          <Switch checked={repeat} onChange={handleRepeatChange} />
        </Row>
        <Row align="center" justify="space-between">
          <Text variant="small">Run once</Text>
          <Switch checked={once} onChange={handleOnceChange} />
        </Row>
      </Block>
    </Block>
  );
}
```

### Variants

Compare semantic text variants while the shimmer animation stays the same.

```tsx
import { Column, ShimmerText, Text } from '@plocks/ui';

const variants = ['h3', 'p', 'small'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">{variant}</Text>
          <ShimmerText variant={variant}>New arrivals this week</ShimmerText>
        </Column>
      ))}
    </Column>
  );
}
```

### Customization options

Combine custom color stops, timing tweaks, and direction to align the shimmer with your brand voice.

```tsx
import { Block, ShimmerText } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <ShimmerText shimmerColor="#facc15" spread={3} fw="bold" size="xl">
        Golden spotlight offer
      </ShimmerText>
      <ShimmerText
        c="#475569"
        shimmerColor="#38bdf8"
        spread={1.2}
        duration={1.2}
        repeatDelay={0.2}
      >
        Fast pulse notification
      </ShimmerText>
      <ShimmerText direction="rtl" repeatDelay={0.8}>
        Shimmer sweeps from right to left
      </ShimmerText>
      <ShimmerText once repeat={false} delay={0.5}>
        Single pass announcement
      </ShimmerText>
    </Block>
  );
}
```
