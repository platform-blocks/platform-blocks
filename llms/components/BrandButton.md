# BrandButton

The BrandButton component renders a branded pressable for any platform in the brand icon registry.

## Metadata

- Import: `import { BrandButton } from '@plocks/brands';`
- Install: `npm install @plocks/brands` — a separate package from `@plocks/ui`
- Tags: action, pressable, interactive, badge, app-store
- Docs: https://plocks.dev/components/BrandButton
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/brands/src/components/BrandButton

## Props

- `brand` (required): BrandPlatform — The brand/platform to style the button for
- `variant`: 'default' | 'filled' | 'light' | 'subtle' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'link' | 'none' | 'plain' = 'plain' — Visual variant. @default 'plain'
- `iconPosition`: 'left' | 'right' | 'start' | 'end' = 'left' — Side of the label the brand icon sits on (`left`/`right` follow the reading direction).
- `iconVariant`: 'full' | 'mono' — Icon variant: 'full' for multi-color, 'mono' for single-color outline
- `icon`: React.ReactNode — Override the default brand icon
- `title`: string — Button text. Omit when rendering a store badge.
- `color`: string — Override icon color (overrides brand default colors)
- `primaryText`: string — Badge lead-in line, e.g. "Download on the" / "Listen on". Supplying this or `secondaryText` switches the component to the two-line store-badge layout, where `variant`, `loading` and `fullWidth` do not apply.
- `secondaryText`: string — Badge headline, e.g. "App Store" / "Spotify"
- `borderColor`: string — Badge shell border color (badge layout only)
- `darkMode`: boolean — Force the badge's dark-mode styling instead of following the theme
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Button` props (`children` `onPress` `onPressIn` `onPressOut` `onHoverIn` `onHoverOut` `onLongPress` `onLayout` `size` `disabled` `loading` `loadingTitle` `fullWidth` `textColor` `tooltip` `transitionDuration` `accessibilityLabel` `accessibilityHint` `labelProps`): https://plocks.dev/llms/components/Button.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type BrandPlatform = BrandName;
```

## Examples

### Basics

Basic Button usage with a title prop.

```tsx
import { BrandButton } from '@plocks/brands';

export function Demo() {
  return (
    <BrandButton
      brand="google"
      title="Continue with Google"
    />
  );
}
```

### App Store Badges

Built in support for App Store badges

```tsx
import { BrandButton } from '@plocks/brands';
import { Flex } from '@plocks/ui';

export function Demo() {
  return (
    <Flex>
      <BrandButton
        brand="app-store"
        primaryText="Download on the"
        secondaryText="App Store"
      />
      <BrandButton
        brand="google-play"
        primaryText="Get it on"
        secondaryText="Google Play"
      />
    </Flex>
  );
}
```

### Variants

Compare the plain brand treatment with Button-style visual variants.

```tsx
import { Column } from '@plocks/ui';
import { BrandButton } from '@plocks/brands';

const variants = ['plain', 'default', 'filled', 'light', 'outline', 'ghost'] as const;

export function Demo() {
  return (
    <Column gap="sm" align="flex-start">
      {variants.map(variant => (
        <BrandButton key={variant} brand="google" title={`Continue with Google · ${variant}`} variant={variant} />
      ))}
    </Column>
  );
}
```
