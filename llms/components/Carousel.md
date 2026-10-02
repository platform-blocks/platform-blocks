# Carousel

The Carousel component displays a series of content in a horizontal scrollable view with optional navigation dots and controls.

## Metadata

- Import: `import { Carousel } from '@plocks/carousel';`
- Install: `npm install @plocks/carousel` — a separate package from `@plocks/ui`
- Tags: carousel, slider, gallery, swipe
- Docs: https://plocks.dev/components/Carousel
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/carousel/src/components/Carousel

## Props

- `children` (required): React.ReactNode[] — Array of carousel slide elements
- `orientation`: 'horizontal' | 'vertical' — Orientation of the carousel
- `showArrows`: boolean — Show navigation arrow buttons
- `showDots`: boolean — Show navigation dots
- `autoPlay`: boolean — Advance slides automatically. A pause / play button is shown whenever autoplay is on; autoplay pauses while the carousel is hovered or has focus, and starts paused when the user prefers reduced motion (they can press play).
- `autoPlayInterval`: number — Autoplay interval in ms
- `autoPlayPauseOnTouch`: boolean = true — Pause autoplay while the carousel is being touched. @default true
- `loop`: boolean — Enable looping
- `itemsPerPage`: number — Number of visible items per page
- `slidesToScroll`: number — Number of slides to advance per snap (defaults to itemsPerPage for backwards compatibility)
- `align`: 'start' | 'center' | 'end' — Align the visible slides within the viewport when there is extra space
- `containScroll`: false | 'trimSnaps' | 'keepSnaps' — Contain leading/trailing space by trimming or keeping snap points
- `startIndex`: number — Initial slide index to show on mount
- `dragFree`: boolean — Allow momentum scrolling without forced snaps
- `skipSnaps`: boolean — Permit gestures to skip over multiple snap points (default true)
- `dragThreshold`: number — Drag distance (in px) required before a swipe is committed
- `duration`: number — Duration (ms) for programmatic scroll animations
- `transitionDuration`: number — Slide transition length in ms. Cross-component spelling that takes precedence over `duration`; `0` jumps between slides with no animation (and also stills the pagination dots).
- `breakpoints`: Record<string, Partial<CarouselProps>> — Embla-style breakpoint overrides applied via media queries
- `slideSize`: number | string | { base?: number | string; xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string; xl?: number | string; } — Explicit slide size. Accepts: - percentage string: e.g. "70%" - fraction (0..1) number: 0.7 -> 70% of container - absolute pixel number (>1) When provided it overrides width derived from itemsPerPage. itemsPerPage still controls cloning + pagination grouping.
- `slideGap`: ResponsiveSize — Responsive gap between slides (overrides itemGap). Accepts spacing token string or number or responsive map.
- `itemGap`: number — Gap between slides in pixels
- `h`: number = 200 (horizontal) — Height of the slides in px — the dots below them are extra. A vertical carousel's dots sit beside the slides, so there it sizes the root.
- `onSlideChange`: (index: number) => void — Callback fired when the active slide changes
- `accessibilityLabel`: string = 'Carousel' — Accessible name of the carousel region. @default 'Carousel'
- `itemStyle`: StyleProp<ViewStyle> — Style override applied to each slide item
- `snapToItem`: boolean — Enable snapping to individual items
- `arrowPosition`: 'inside' | 'outside' = 'inside' — Arrows over the slides (`inside`) or beside them (`outside`, which insets the slides to make room). @default 'inside'
- `arrowSize`: ComponentSizeValue — Size of the navigation arrow buttons
- `dotSize`: ComponentSizeValue — Size of the navigation dots
- `scrollEnabled`: boolean = true — Enable or disable swipe gestures (arrows, dots and autoplay still work). @default true
- `reducedMotion`: boolean — Shorten slide transitions and keep autoplay paused. Defaults to the user's reduced-motion preference (`useReducedMotion()`); pass a boolean to override.
- `windowSize`: number — Number of logical pages to render for virtualization
- `w`: DimensionProp — Width
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Enable `autoPlay` and `loop` on `Carousel` to rotate a small set of slides without custom pagination controls.

```tsx
import { Block, Text } from '@plocks/ui';
import { Carousel } from '@plocks/carousel';

const slides = ['#4C1D95', '#155E75', '#166534'];

export function Demo() {
  return (
    <Carousel h={200} loop autoPlay autoPlayInterval={4500} showDots>
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h3" c="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Vertical orientation

Set `orientation="vertical"` to rotate content along the Y-axis while keeping arrow and dot controls aligned for keyboard and touch users. Vertical carousels size to their container, so give the carousel an explicit `h`.

```tsx
import { Block, Text } from '@plocks/ui';
import { Carousel } from '@plocks/carousel';

const slides = ['#DC2626', '#2563EB', '#0F766E'];

export function Demo() {
  return (
    <Carousel
      orientation="vertical"
      h={280}
      loop
      autoPlay
      autoPlayInterval={4500}
      showArrows
      showDots
    >
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h3" c="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Image overlay

Layer an absolutely positioned `Block` with a semi-transparent `bg` on top of each slide to keep text and buttons readable on photography.

```tsx
import { Block, Image, Text } from '@plocks/ui';
import { Carousel } from '@plocks/carousel';

const scenes = [
  { title: 'Mountain escape', src: require('../../../../assets/images/scene-mountains.png') },
  { title: 'Forest retreat', src: require('../../../../assets/images/scene-forest.png') },
  { title: 'Desert journey', src: require('../../../../assets/images/scene-desert.png') },
];

export function Demo() {
  return (
    <Carousel h={280} loop showArrows showDots>
      {scenes.map(({ title, src }) => (
        <Block key={title} h="full" radius="lg" style={{ overflow: 'hidden' }}>
          <Image src={src} w="100%" h="100%" resizeMode="cover" />
          <Block
            position="absolute"
            top={0}
            right={0}
            bottom={0}
            left={0}
            bg="rgba(15,23,42,0.45)"
            p="lg"
            justify="flex-end"
          >
            <Text variant="h3" c="white">
              {title}
            </Text>
          </Block>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Multiple slides

Combine `itemsPerPage` with the Embla-style `breakpoints` prop to show more slides as the viewport grows. Keep `slidesToScroll={1}` so only one card advances at a time, even when desktop layouts show multiple slides side-by-side.

```tsx
import { Block, Text } from '@plocks/ui';
import { Carousel } from '@plocks/carousel';

const slides = ['#1D4ED8', '#0F766E', '#C026D3', '#B45309', '#7C3AED'];

export function Demo() {
  return (
    <Carousel
      h={180}
      loop
      showDots
      slideGap={12}
      itemsPerPage={1}
      slidesToScroll={1}
      breakpoints={{
        '@media (min-width: 768px)': { itemsPerPage: 2 },
        '@media (min-width: 1200px)': { itemsPerPage: 4 },
      }}
    >
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h4" c="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Performance tuning

Pair `windowSize` with `reducedMotion` to keep large or data-heavy carousels responsive while still exposing arrow navigation.

```tsx
import { Block, Text } from '@plocks/ui';
import { Carousel } from '@plocks/carousel';

const slides = ['#1E3A8A', '#047857', '#9333EA', '#B91C1C', '#B45309', '#0F766E'];

export function Demo() {
  return (
    <Carousel h={180} loop showArrows windowSize={3} reducedMotion slideGap={12}>
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h4" c="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Drag & motion

Tune the interaction model with `dragFree`, `skipSnaps`, `dragThreshold`, and `duration` to match Embla-style motion control.

```tsx
import { Block, Text } from '@plocks/ui';
import { Carousel } from '@plocks/carousel';

function slides(colors: string[]) {
  return colors.map((bg, index) => (
    <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
      <Text variant="h4" c="white">
        Slide {index + 1}
      </Text>
    </Block>
  ));
}

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Text variant="h5">Free momentum (dragFree)</Text>
      <Carousel h={160} dragFree itemsPerPage={2} slideGap={12}>
        {slides(['#0EA5E9', '#6366F1', '#8B5CF6', '#A855F7'])}
      </Carousel>

      <Text variant="h5">Locked snaps (skipSnaps off)</Text>
      <Carousel
        h={160}
        itemsPerPage={2}
        slidesToScroll={1}
        skipSnaps={false}
        dragThreshold={45}
        duration={650}
        slideGap={12}
      >
        {slides(['#F97316', '#EA580C', '#C2410C', '#9A3412'])}
      </Carousel>
    </Block>
  );
}
```
