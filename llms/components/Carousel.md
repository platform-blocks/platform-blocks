# Carousel

The Carousel component displays a series of content in a horizontal scrollable view with optional navigation dots and controls.

## Metadata

- Canonical name: `Carousel`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Carousel } from '@platform-blocks/react-ui-library';`
- Category: display
- Tags: carousel, slider, gallery, swipe
- Docs: https://react-ui-library.com/components/Carousel
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Carousel

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode[] | Yes |  | Array of carousel slide elements |
| `orientation` | 'horizontal' \| 'vertical' | No |  | Orientation of the carousel |
| `showArrows` | boolean | No |  | Show navigation arrow buttons |
| `showDots` | boolean | No |  | Show navigation dots |
| `autoPlay` | boolean | No |  | Enable autoplay |
| `autoPlayInterval` | number | No |  | Autoplay interval in ms |
| `autoPlayPauseOnTouch` | boolean | No |  | Pause autoplay on user interaction |
| `loop` | boolean | No |  | Enable looping |
| `itemsPerPage` | number | No |  | Number of visible items per page |
| `slidesToScroll` | number | No |  | Number of slides to advance per snap (defaults to itemsPerPage for backwards compatibility) |
| `align` | 'start' \| 'center' \| 'end' | No |  | Align the visible slides within the viewport when there is extra space |
| `containScroll` | false \| 'trimSnaps' \| 'keepSnaps' | No |  | Contain leading/trailing space by trimming or keeping snap points |
| `startIndex` | number | No |  | Initial slide index to show on mount |
| `dragFree` | boolean | No |  | Allow momentum scrolling without forced snaps |
| `skipSnaps` | boolean | No |  | Permit gestures to skip over multiple snap points (default true) |
| `dragThreshold` | number | No |  | Drag distance (in px) required before a swipe is committed |
| `duration` | number | No |  | Duration (ms) for programmatic scroll animations |
| `transitionDuration` | number | No |  | Slide transition length in ms. Cross-component spelling that takes precedence over `duration`; `0` jumps between slides with no animation (and also stills the pagination dots). |
| `breakpoints` | Record<string, Partial<CarouselProps>> | No |  | Embla-style breakpoint overrides applied via media queries |
| `slideSize` | number \| string \| { base?: number \| string; xs?: number \| string; sm?: number \| string; md?: number \| string; lg?: number \| string; xl?: number \| string; } | No |  | Explicit slide size. Accepts: - percentage string: e.g. "70%" - fraction (0..1) number: 0.7 -> 70% of container - absolute pixel number (>1) When provided it overrides width derived from itemsPerPage. itemsPerPage still controls cloning + pagination grouping. |
| `slideGap` | ResponsiveSize | No |  | Responsive gap between slides (overrides itemGap). Accepts spacing token string or number or responsive map. |
| `itemGap` | number | No |  | Gap between slides in pixels |
| `height` | number | No |  | Fixed height of the carousel container |
| `onSlideChange` | (index: number) => void | No |  | Callback fired when the active slide changes |
| `style` | StyleProp<ViewStyle> | No |  | Style override for the carousel container |
| `itemStyle` | StyleProp<ViewStyle> | No |  | Style override applied to each slide item |
| `snapToItem` | boolean | No |  | Enable snapping to individual items |
| `arrowPosition` | 'inside' \| 'outside' | No |  | Position of navigation arrows relative to the carousel |
| `arrowSize` | ComponentSizeValue | No |  | Size of the navigation arrow buttons |
| `dotSize` | ComponentSizeValue | No |  | Size of the navigation dots |
| `scrollEnabled` | boolean | No |  | Enable or disable scroll gestures |
| `reducedMotion` | boolean | No |  | Disable animated width/color transitions for dots and snapping |
| `windowSize` | number | No |  | Number of logical pages to render for virtualization |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Basic usage
ID: `Carousel.basic` • Tags: auto-play, loop • Category: basics • Status: stable • Since: 0.3.0

Enable `autoPlay` and `loop` on `Carousel` to rotate a small set of slides without custom pagination controls.

```tsx
const slides = ['#4C1D95', '#155E75', '#166534'];
  return (
    <Carousel height={200} loop autoPlay autoPlayInterval={4500} showDots>
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h3" color="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Vertical orientation
ID: `Carousel.vertical` • Tags: vertical, navigation • Category: layout • Status: stable • Since: 0.3.0

Set `orientation="vertical"` to rotate content along the Y-axis while keeping arrow and dot controls aligned for keyboard and touch users. Vertical carousels size to their container, so give the carousel an explicit height.

```tsx
const slides = ['#DC2626', '#2563EB', '#0F766E'];
  return (
    <Carousel
      orientation="vertical"
      style={{ height: 280 }}
      loop
      autoPlay
      autoPlayInterval={4500}
      showArrows
      showDots
    >
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h3" color="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Image overlay
ID: `Carousel.imageOverlay` • Tags: hero, overlay • Category: media • Status: stable • Since: 0.3.0

Layer an absolutely positioned `Block` with a semi-transparent `bg` on top of each slide to keep text and buttons readable on photography.

```tsx
const scenes = [
  { title: 'Mountain escape', src: require('../../../../assets/images/scene-mountains.png') },
  { title: 'Forest retreat', src: require('../../../../assets/images/scene-forest.png') },
  { title: 'Desert journey', src: require('../../../../assets/images/scene-desert.png') },
];
  return (
    <Carousel height={280} loop showArrows showDots>
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
            <Text variant="h3" color="white">
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
ID: `Carousel.multi` • Tags: responsive, items-per-page • Category: layout • Status: stable • Since: 0.3.0

Combine `itemsPerPage` with the Embla-style `breakpoints` prop to show more slides as the viewport grows. Keep `slidesToScroll={1}` so only one card advances at a time, even when desktop layouts show multiple slides side-by-side.

```tsx
const slides = ['#1D4ED8', '#0F766E', '#C026D3', '#B45309', '#7C3AED'];
  return (
    <Carousel
      height={180}
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
          <Text variant="h4" color="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Performance tuning
ID: `Carousel.performance` • Tags: virtualization, reduced-motion • Category: performance • Status: stable • Since: 0.3.0

Pair `windowSize` with `reducedMotion` to keep large or data-heavy carousels responsive while still exposing arrow navigation.

```tsx
const slides = ['#1E3A8A', '#047857', '#9333EA', '#B91C1C', '#B45309', '#0F766E'];
  return (
    <Carousel height={180} loop showArrows windowSize={3} reducedMotion slideGap={12}>
      {slides.map((bg, index) => (
        <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
          <Text variant="h4" color="white">
            Slide {index + 1}
          </Text>
        </Block>
      ))}
    </Carousel>
  );
}
```

### Drag & motion
ID: `Carousel.motionControls` • Tags: drag-free, motion • Category: behavior • Status: stable • Since: 0.4.0

Tune the interaction model with `dragFree`, `skipSnaps`, `dragThreshold`, and `duration` to match Embla-style motion control.

```tsx
function slides(colors: string[]) {
  return colors.map((bg, index) => (
    <Block key={bg} bg={bg} radius="lg" h="full" align="center" justify="center">
      <Text variant="h4" color="white">
        Slide {index + 1}
      </Text>
    </Block>
  ));
}
  return (
    <Block fullWidth gap="lg">
      <Text variant="h5">Free momentum (dragFree)</Text>
      <Carousel height={160} dragFree itemsPerPage={2} slideGap={12}>
        {slides(['#0EA5E9', '#6366F1', '#8B5CF6', '#A855F7'])}
      </Carousel>
      <Text variant="h5">Locked snaps (skipSnaps off)</Text>
      <Carousel
        height={160}
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
