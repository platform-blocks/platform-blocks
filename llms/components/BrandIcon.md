# BrandIcon

Common brand logos rendered as SVG.

## Metadata

- Import: `import { BrandIcon } from '@plocks/brands';`
- Install: `npm install @plocks/brands` — a separate package from `@plocks/ui`
- Tags: brand, logo, icon, svg
- Docs: https://plocks.dev/components/BrandIcon
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/brands/src/components/BrandIcon

## Props

- `brand` (required): BrandName — Brand name from the registry.
- `size`: SizeValue = 'md' — Size token or px.
- `color`: string — Override all colors with a single color (brand logos otherwise keep their official colors).
- `variant`: 'full' | 'mono' — Icon variant - 'full' for multi-color, 'mono' for single-color with clipping
- `label`: string — Accessible name. A labelled brand icon is announced as an image; without a label it is decorative (hidden from assistive technology).
- `accessibilityLabel`: string — Alias of `label`.
- `decorative`: boolean — Hide the icon from assistive technology. Defaults to `true` unless a `label` is given — a logo next to (or inside) labelled content adds only noise.
- `invertInDarkMode`: boolean = false — Whether to automatically invert black colors in dark mode
- `colorScheme`: 'light' | 'dark' — Force color scheme for testing (overrides automatic detection)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

High-quality brand icons with multi-color support, mono variants, and automatic dark mode theming.

```tsx
import { Row } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import { SAMPLE_BRANDS } from '../data';

export function Demo() {
  return (
    <Row align="center" gap="md" wrap="wrap">
      {SAMPLE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
```

`data.ts`

```ts
import type { BrandName } from '@plocks/brands';

export const FEATURED_BRANDS: BrandName[] = [
  'google',
  'facebook',
  'apple',
  'github',
  'x',
  'microsoft',
  'linkedin',
  'discord',
  'slack',
  'chrome',
  'openai',
  'spotify',
  'youtube'
];

export const SAMPLE_BRANDS: BrandName[] = FEATURED_BRANDS.slice(0, 6);

export const DARK_MODE_BRANDS: BrandName[] = ['apple', 'github', 'x'];
```

### Colors & Mono

Authentic brand palettes plus custom single-color overrides — passing `color` implies `variant="mono"`, so the two never need to be set together.

```tsx
import { Block, Row, Text } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="small" c="secondary">
          Authentic brand palettes
        </Text>
        <Row align="center" gap="md" wrap="wrap">
          <BrandIcon brand="google" size="xl" />
          <BrandIcon brand="facebook" size="xl" />
          <BrandIcon brand="apple" size="xl" />
          <BrandIcon brand="github" size="xl" />
          <BrandIcon brand="x" size="xl" />
        </Row>
      </Block>

      <Block>
        <Text variant="small" c="secondary">
          Custom blue
        </Text>
        <Row align="center" gap="md" wrap="wrap">
          <BrandIcon brand="google" size="xl" color="#1976D2" />
          <BrandIcon brand="facebook" size="xl" color="#1976D2" />
          <BrandIcon brand="apple" size="xl" color="#1976D2" />
          <BrandIcon brand="github" size="xl" color="#1976D2" />
          <BrandIcon brand="x" size="xl" color="#1976D2" />
        </Row>
      </Block>

      <Block>
        <Text variant="small" c="secondary">
          Custom red
        </Text>
        <Row align="center" gap="md" wrap="wrap">
          <BrandIcon brand="google" size="xl" color="#D32F2F" />
          <BrandIcon brand="facebook" size="xl" color="#D32F2F" />
          <BrandIcon brand="apple" size="xl" color="#D32F2F" />
          <BrandIcon brand="github" size="xl" color="#D32F2F" />
          <BrandIcon brand="x" size="xl" color="#D32F2F" />
        </Row>
      </Block>
    </Block>
  );
}
```

### Variants

Full preserves the brand colors; mono uses a single supplied color.

```tsx
import { Column, Row, Text } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
  return (
    <Column gap="md">
      <Row align="center" gap="sm"><BrandIcon brand="google" variant="full" size="xl" /><Text>Full color</Text></Row>
      <Row align="center" gap="sm"><BrandIcon brand="google" variant="mono" color="royalblue" size="xl" /><Text>Monochrome</Text></Row>
    </Column>
  );
}
```

### Sizes

Size presets from small through extra large for consistent placement.

```tsx
import { Block, Row, Text } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import type { BrandIconProps } from '@plocks/brands';

const SIZES: BrandIconProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={String(size)} align="center">
          <BrandIcon brand="google" size={size} />
          <Text variant="small">{String(size)}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Dark Mode Support

Supported logos automatically invert for dark themes.

```tsx
import { Row } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import { DARK_MODE_BRANDS } from '../data';

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {DARK_MODE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
```

`data.ts` is the same file shown under “Basics” above.

### All Available Brands

Complete collection of every supported brand icon, laid out with `Grid` so the column count adapts from 3 on narrow screens up to 8 on wide ones.

```tsx
import { Block, Grid, GridItem, Text } from '@plocks/ui';
import { BrandIcon, brandNames } from '@plocks/brands';

export function Demo() {
  return (
    <Grid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} gap="md" fullWidth>
      {brandNames.map((brand) => (
        <GridItem key={brand} span={1}>
          <Block align="center">
            <BrandIcon brand={brand} size={36} />
            <Text ta="center" size={10}>
              {brand}
            </Text>
          </Block>
        </GridItem>
      ))}
    </Grid>
  );
}
```
