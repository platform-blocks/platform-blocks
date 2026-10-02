# Image

The `Image` component displays images with optional captions and overlays, providing a flexible way to present visual content in your application.

## Metadata

- Import: `import { Image } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Image
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Image

## Props

- `src`: string | ImageSourcePropType — Remote image URI, or a bundled asset from `require('./photo.png')`
- `source`: ImageSourcePropType — Image source object (alternative to src)
- `alt`: string — Text alternative, announced by screen readers (`aria-label` on web, `accessibilityLabel` on native). Pass `alt=""` for a purely decorative image: it is then hidden from assistive technology. An image with neither `alt` nor `accessibilityLabel` is treated as decorative too.
- `accessibilityLabel`: string — Accessible name; takes precedence over `alt`.
- `resizeMode`: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center' = 'cover' — Image resize mode
- `size`: SizeValue — Size preset (`xs` 24 … `3xl` 96) or a square size in px. `w` / `h` win over it.
- `aspectRatio`: number — Aspect ratio
- `borderWidth`: number — Border width
- `borderColor`: ColorValue — Border color (defaults to the theme border color)
- `radius`: RadiusValue — Corner radius: size token, px number, `'none'` or `'full'`. Wins over `rounded`.
- `rounded`: boolean — Round the corners with the theme's `md` radius
- `circle`: boolean — Render as a circle (radius = half the width)
- `fallback`: React.ReactNode — Fallback element to show on error
- `loading`: React.ReactNode — Loading state element
- `onLoad`: () => void — Called when image loads successfully
- `onError`: (error: NativeSyntheticEvent<ImageErrorEventData>) => void — Called when image fails to load
- `onLoadStart`: () => void — Called when image starts loading
- `onLoadEnd`: () => void — Called when image finishes loading (success or error)
- `containerStyle`: StyleProp<ViewStyle> — Container style (applied before `style`)
- `imageStyle`: StyleProp<ImageStyle> — Image style overrides
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Pass a `src` and size the image with `w` and `h`; `alt` gives screen readers a text alternative.

```tsx
import { Image } from '@plocks/ui';

export function Demo() {
  return (
    <Image
      src={require('../../../../assets/images/scene-mountains.png')}
      alt="Mountain landscape"
      w={300}
      h={200}
    />
  );
}
```

### Sizes

Set the `size` prop to any token (`xs`–`3xl`) to scale the image box, or pass `w`/`h` when you need exact dimensions.

```tsx
import { Block, Image, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

/** Inline 8x8 PNG — keeps the demo offline and identical on web and native. */
const SAMPLE_SRC =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAALklEQVR42mNITvsIR409P+CIAasokMuAVRQqgSkKksAqiiKB5goGrKJQCawuBgC2Wnfh+zNA9wAAAABJRU5ErkJggg==';

export function Demo() {
  return (
    <Row align="flex-end" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Image src={SAMPLE_SRC} size={size} radius="md" alt={`Sample image at ${size}`} />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Shapes

Add `rounded` for the theme's corner radius or `circle` to crop the image into a circle.

```tsx
import { Block, Image, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row align="flex-start" gap="lg" wrap="wrap">
      <Block align="center">
        <Image
          src={require('../../../../assets/images/scene-lake.png')}
          size={80}
          alt="Default"
        />
        <Text variant="small">Default</Text>
      </Block>

      <Block align="center">
        <Image
          src={require('../../../../assets/images/scene-lake.png')}
          size={80}
          rounded
          alt="Rounded"
        />
        <Text variant="small">Rounded</Text>
      </Block>

      <Block align="center">
        <Image
          src={require('../../../../assets/images/scene-lake.png')}
          size={80}
          circle
          alt="Circle"
        />
        <Text variant="small">Circle</Text>
      </Block>
    </Row>
  );
}
```

### Fallback

When the image fails to load, whatever you pass to `fallback` (an icon, text, any element) renders in its place.

```tsx
import { Block, Icon, Image, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Row align="flex-start" gap="lg" wrap="wrap">
      <Block align="center">
        <Image
          src="https://invalid-url-that-will-fail.com/image.jpg"
          w={120}
          h={80}
          fallback={<Icon name="image-off" size={24} color="gray.5" />}
          alt="Failed to load"
        />
        <Text variant="small">Icon fallback</Text>
      </Block>

      <Block align="center">
        <Image
          src="https://another-invalid-url.com/image.jpg"
          w={120}
          h={80}
          fallback={
            <Text size="sm" c="gray.6" ta="center">
              Image not found
            </Text>
          }
          alt="Failed to load"
        />
        <Text variant="small">Text fallback</Text>
      </Block>
    </Row>
  );
}
```

### Spacing

Image accepts the universal margin props: theme tokens (`m="lg"`), pixel numbers (`m={20}`), axis shorthands (`mx`, `my`), and `auto` to center it.

```tsx
import { Block, Card, Image, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small">m="auto"</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Centered image"
            w={100}
            h={100}
            m="auto"
          />
        </Card>
      </Block>

      <Block>
        <Text variant="small">m="lg"</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Image with theme spacing"
            w={80}
            h={80}
            m="lg"
          />
        </Card>
      </Block>

      <Block>
        <Text variant="small">m={'{20}'}</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Image with numeric spacing"
            w={60}
            h={60}
            m={20}
          />
        </Card>
      </Block>

      <Block>
        <Text variant="small">mx="auto" my="md"</Text>
        <Card variant="subtle" p={0}>
          <Image
            src={require('../../../../assets/images/scene-meadow.png')}
            alt="Image with axis spacing"
            w={80}
            h={80}
            mx="auto"
            my="md"
          />
        </Card>
      </Block>
    </Block>
  );
}
```
