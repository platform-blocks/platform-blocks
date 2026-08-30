# ShimmerText

Animated text highlight that sweeps a configurable gradient across the content. Ideal for loading states, premium callouts, and attention-grabbing text accents.

## Metadata

- Canonical name: `ShimmerText`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ShimmerText } from '@platform-blocks/react-ui-library';`
- Category: typography
- Tags: text, shimmer, animation, gradient
- Docs: https://react-ui-library.com/components/ShimmerText
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ShimmerText

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | ReactNode | No |  | Text node children. Overrides `text` when provided |
| `text` | string | No |  | Text content to render when not using children |
| `color` | string | No |  | Base text color rendered underneath the shimmer |
| `colors` | string[] | No |  | Optional gradient stops override |
| `shimmerColor` | string | No |  | Highlight color used for the shimmer pass |
| `spread` | number | No |  | Width of the highlight band as a multiple of the text width (higher = wider highlight). The band always travels from fully clear of one edge to fully clear of the other, so this also sets how far it moves per cycle. |
| `duration` | number | No |  | Duration of a single shimmer cycle in seconds |
| `delay` | number | No |  | Delay before the shimmer starts (seconds) |
| `repeatDelay` | number | No |  | Pause held at the end of each cycle, with the band off screen (seconds) |
| `repeat` | boolean | No |  | Whether the shimmer should repeat indefinitely |
| `once` | boolean | No |  | Animate only once after becoming visible |
| `direction` | ShimmerDirection | No |  | Direction of shimmer movement |
| `debug` | boolean | No |  | Enable verbose logging for debugging |
| `onLayout` | TextProps['onLayout'] | No |  | Called with the layout of the shimmer container |
| `startOnView` | boolean | No |  | Start shimmering once the component enters the viewport (web only) |
| `inViewMargin` | string | No |  | `rootMargin` for the `startOnView` IntersectionObserver (web only) |
| `containerStyle` | any | No |  | Optional container style |
| `testID` | string | No |  | Optional test identifier |

## Examples

### Basic shimmer
ID: `ShimmerText.basic` • Tags: animation, text • Category: basics • Status: stable • Since: 0.3.0

Wrap text in `ShimmerText` to add the default looping highlight with no additional configuration.

```tsx
return (
    <Block align="flex-start">
      <ShimmerText size="xl" weight="bold">
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
ID: `ShimmerText.controls` • Tags: animation, controls • Category: behavior • Status: stable • Since: 0.3.0

Expose `spread`, `repeat`, and `once` controls to let readers tune the shimmer loop at runtime.

```tsx
const MIN_SPREAD = 1;
const MAX_SPREAD = 4;
const SPREAD_STEP = 0.1;
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
        weight="bold"
        size="lg"
      >
        Interactive shimmer headline
      </ShimmerText>
      <Block w="100%">
        <Text variant="small" weight="medium">
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

### Customization options
ID: `ShimmerText.customization` • Tags: color, timing • Category: theming • Status: stable • Since: 0.3.0

Combine custom color stops, timing tweaks, and direction to align the shimmer with your brand voice.

```tsx
return (
    <Block align="flex-start">
      <ShimmerText shimmerColor="#facc15" spread={3} weight="bold" size="xl">
        Golden spotlight offer
      </ShimmerText>
      <ShimmerText
        color="#475569"
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
