# BrandIcon Component

The `BrandIcon` component provides branded icons with their official colors or allows color overrides.

## Features

- **Multi-color support**: Icons like Google logo maintain their original brand colors
- **Color override**: Use the `color` prop to override all colors with a single color
- **Standard sizing**: Supports the same size system as other icons (sm, md, lg, xl, or number)
- **Accessibility**: Decorative (hidden from assistive technology) unless given a `label`, then announced as an image

## Usage

```tsx
import { BrandIcon } from '@plocks/brands';

// Use brand colors (default)
<BrandIcon brand="google" size="lg" />

// Override with single color
<BrandIcon brand="google" size="lg" color="#000" />

// Available brands
<BrandIcon brand="facebook" />
<BrandIcon brand="discord" />
<BrandIcon brand="google" />
```

## Available Brands

- `google` - Google logo with official multi-colors
- `facebook` - Facebook logo 
- `discord` - Discord logo

## Props

- `brand` - The brand name (required)
- `size` - Size of the icon (sm/md/lg/xl or number)
- `color` - Override color for all paths
- `style` - Additional styles
- `label` - Accessible name; a labelled logo is announced as an image
- `decorative` - Hide from assistive technology (default: `true` unless `label` is set)