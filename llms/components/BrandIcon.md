# BrandIcon

Common brand logos rendered as SVG

## Metadata

- Canonical name: `BrandIcon`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { BrandIcon } from '@platform-blocks/react-ui-library';`
- Category: typography
- Tags: action, pressable, interactive
- Docs: https://react-ui-library.com/components/BrandIcon
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/BrandIcon

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `brand` | BrandName | Yes |  | Brand name from the registry. camelCase names are deprecated aliases. |
| `size` | SizeValue | No |  | Size of the icon |
| `color` | string | No |  | Override all colors with a single color |
| `variant` | 'full' \| 'mono' | No |  | Icon variant - 'full' for multi-color, 'mono' for single-color with clipping |
| `style` | StyleProp<ViewStyle> | No |  | Additional styles |
| `label` | string | No |  | Accessibility label |
| `decorative` | boolean | No |  | Whether the icon is purely decorative (skip a11y) |
| `invertInDarkMode` | boolean | No |  | Whether to automatically invert black colors in dark mode |
| `colorScheme` | 'light' \| 'dark' | No |  | Force color scheme for testing (overrides automatic detection) |

## Examples

### Overview
ID: `BrandIcon.basic` • Tags: overview, gallery • Category: basics • Status: stable • Since: 0.3.0

High-quality brand icons with multi-color support, mono variants, and automatic dark mode theming.

```tsx
return (
    <Row align="center" gap="md" wrap="wrap">
      {SAMPLE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
```

### Colors & Mono
ID: `BrandIcon.colors` • Tags: colors, branding, mono, custom-colors • Category: theming • Status: stable • Since: 0.3.0

Authentic brand palettes plus custom single-color overrides — passing `color` implies `variant="mono"`, so the two never need to be set together.

```tsx
return (
    <Block>
      <Block>
        <Text variant="small" color="secondary">
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
        <Text variant="small" color="secondary">
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
        <Text variant="small" color="secondary">
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

### Sizes
ID: `BrandIcon.sizes` • Tags: sizes, layout • Category: layout • Status: stable • Since: 0.3.0

Size presets from small through extra large for consistent placement.

```tsx
const SIZES: BrandIconProps['size'][] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
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
ID: `BrandIcon.dark-mode` • Tags: dark-mode, accessibility • Category: theming • Status: stable • Since: 0.3.0

Supported logos automatically invert for dark themes.

```tsx
return (
    <Row align="center" gap="lg" wrap="wrap">
      {DARK_MODE_BRANDS.map((brand) => (
        <BrandIcon key={brand} brand={brand} size="xl" />
      ))}
    </Row>
  );
}
```

### All Available Brands
ID: `BrandIcon.all-brands` • Tags: catalog, brands • Category: reference • Status: stable • Since: 0.3.0

Complete collection of every supported brand icon, laid out with `Grid` so the column count adapts from 3 on narrow screens up to 8 on wide ones.

```tsx
return (
    <Grid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} gap="md" fullWidth>
      {ALL_BRANDS.map((brand) => (
        <GridItem key={brand} span={1}>
          <Block align="center">
            <BrandIcon brand={brand} size={36} />
            <Text align="center" size={10}>
              {brand}
            </Text>
          </Block>
        </GridItem>
      ))}
    </Grid>
  );
}
```
