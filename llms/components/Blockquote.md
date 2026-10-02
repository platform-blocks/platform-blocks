# Blockquote

Blockquote highlights a quotation or important passage.

## Metadata

- Import: `import { Blockquote } from '@plocks/ui';`
- Tags: blockquote, text, typography
- Docs: https://plocks.dev/components/Blockquote
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Blockquote

## Props

- `children` (required): React.ReactNode — Core content
- `variant`: 'default' | 'testimonial' | 'featured' | 'minimal' — Styling
- `size`: SizeValue — Quote text size. Quotes read two steps up the theme's font scale (`md` → `fontSizes.xl`).
- `color`: string
- `quoteIcon`: string | React.ReactNode — Quote icon
- `quoteIconPosition`: 'top-left' | 'top-center' | 'bottom-right' | 'none' — Glyph position. `left` / `right` are the leading / trailing corners (mirrored in RTL).
- `quoteIconSize`: SizeValue — Glyph size token (`lg` = 32px with the default theme) or px.
- `author`: BlockquoteAuthor — Author attribution
- `links`: BlockquoteLinks — Social/profile links
- `date`: Date | string — Metadata
- `rating`: BlockquoteRating
- `source`: BlockquoteSource — Brand/source
- `verified`: boolean — Verification
- `verifiedTooltip`: string
- `alignment`: 'left' | 'center' | 'right' — Layout
- `attributionAlignment`: 'left' | 'center' | 'right' — Which side the attribution block (avatar, name, source, meta) sits on. Defaults to `'right'`, or `'center'` when `alignment` is `'center'`.
- `border`: boolean
- `shadow`: boolean
- `onPress`: () => void — Makes the whole quote a button.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface BlockquoteAuthor {
  name: string;
  title?: string;
  organization?: string;
  /** Remote avatar URL, or a bundled asset from `require('./avatar.png')` */
  avatar?: string | ImageSourcePropType;
  avatarFallback?: string;
}

export interface BlockquoteLinks {
  website?: string;
  twitter?: string;
  linkedin?: string;
  [key: string]: string | undefined;
}

export interface BlockquoteRating {
  value: number;
  max?: number;
  showValue?: boolean;
}

export interface BlockquoteSource {
  name: string;
  /**
   * Icon registry name, or any node — e.g. a logo from `@plocks/brands`:
   * `icon: <BrandIcon brand="x" size="sm" />`.
   */
  icon?: string | React.ReactNode;
  logo?: string;
  url?: string;
}
```

## Examples

### Basics

Frames a simple pull quote with author details.

```tsx
import { Blockquote } from '@plocks/ui';

const AUTHOR = {
  name: 'Jamie Ortega',
  title: 'Principal Product Designer',
};

export function Demo() {
  return (
    <Blockquote author={AUTHOR}>
      The Blockquote component keeps editorial typography consistent so our brand voice always feels elevated.
    </Blockquote>
  );
}
```

### Testimonial card

Full-fidelity testimonial with avatar, organization, rating, verified badge, and shadow.

```tsx
import { Blockquote } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
  return (
    <Blockquote
      variant="testimonial"
      author={{
        name: 'Priya Shah',
        title: 'CTO',
        organization: 'Northwind Labs',
        avatar: require('../../../../assets/avatars/avatar-2.png'),
      }}
      rating={{ value: 5, max: 5, showValue: true }}
      source={{
        name: 'Google Business',
        icon: <BrandIcon brand="google" size="sm" />,
      }}
      date="2024-06-12"
      verified
    >
      plocks helped us ship an entirely new settings experience in a single sprint. The components feel native on every platform.
    </Blockquote>
  );
}
```

### Social proof

Maps social-style quotes into `Blockquote` with avatars, verification, and network metadata.

```tsx
import { Block, Blockquote } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
  return (
    <Block>
      <Blockquote
        variant="minimal"
        author={{
          name: '@futureshaper',
          avatar: require('../../../../assets/avatars/avatar-3.png'),
        }}
        source={{
          name: 'X (Twitter)',
          icon: <BrandIcon brand="x" size="sm" />,
          url: 'https://x.com/plocks_ui',
        }}
        date="3h"
        verified
      >
        The future is going to be wild 🚀
      </Blockquote>

      <Blockquote
        variant="testimonial"
        author={{
          name: 'Jordan Reeves',
          title: 'Developer Advocate',
          avatar: require('../../../../assets/avatars/avatar-1.png'),
        }}
        source={{
          name: 'LinkedIn',
          icon: <BrandIcon brand="linkedin" size="sm" />,
        }}
        date="1 day ago"
      >
        Just finished testing the new plocks UI library. The component quality and developer experience is outstanding!
      </Blockquote>

      <Blockquote
        variant="testimonial"
        author={{
          name: 'Sasha Lin',
          title: 'Staff Engineer',
        }}
        source={{
          name: 'GitHub',
          icon: <BrandIcon brand="github" size="sm" />,
        }}
        rating={{ value: 5, max: 5, showValue: true }}
        verified
      >
        This library has saved us countless hours of development time. Clean API, great documentation, and excellent TypeScript support.
      </Blockquote>
    </Block>
  );
}
```

### Attribution side

Attribution sits on the right by default. Use `attributionAlignment` to move the avatar, name, and metadata to the left or center it under the quote.

```tsx
import { Block, Blockquote, Text } from '@plocks/ui';

import { AUTHOR, QUOTE, SOURCE } from './data';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="h5" fw="semibold">
          Right (default)
        </Text>
        <Blockquote
          variant="testimonial"
          shadow
          author={AUTHOR}
          source={SOURCE}
        >
          {QUOTE}
        </Blockquote>
      </Block>

      <Block>
        <Text variant="h5" fw="semibold">
          Left
        </Text>
        <Blockquote
          variant="testimonial"
          shadow
          attributionAlignment="left"
          author={AUTHOR}
          source={SOURCE}
        >
          {QUOTE}
        </Blockquote>
      </Block>

    </Block>
  );
}
```

`data.ts`

```ts
export const AUTHOR = {
  name: 'Priya Shah',
  title: 'CTO',
  organization: 'Northwind Labs',
  avatar: require('../../../../assets/avatars/avatar-2.png'),
};

export const SOURCE = { name: 'G2', brand: 'google' as const };

export const QUOTE =
  'The components feel native on every platform, so we stopped maintaining three separate design systems.';
```

### Variants overview

Renders each preset to compare layout, alignment, and metadata options.

```tsx
import { Block, Blockquote, Text } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="h5" fw="semibold">
          Default
        </Text>
        <Blockquote author={{ name: 'Anonymous' }}>
          The best way to predict the future is to create it.
        </Blockquote>
      </Block>

      <Block>
        <Text variant="h5" fw="semibold">
          Testimonial
        </Text>
        <Blockquote
          variant="testimonial"
          author={{
            name: 'Sarah Johnson',
            title: 'Marketing Director',
            avatar: require('../../../../assets/avatars/avatar-4.png'),
          }}
          rating={{ value: 4, max: 5 }}
          shadow
        >
          Great experience with this service. The team was professional and delivered quality results.
        </Blockquote>
      </Block>

      <Block>
        <Text variant="h5" fw="semibold">
          Featured
        </Text>
        <Blockquote
          variant="featured"
          alignment="center"
          author={{
            name: 'Albert Einstein',
            title: 'Theoretical Physicist',
          }}
        >
          Imagination is more important than knowledge.
        </Blockquote>
      </Block>

      <Block>
        <Text variant="h5" fw="semibold">
          Minimal
        </Text>
        <Blockquote
          variant="minimal"
          quoteIconPosition="none"
          author={{ name: '@username' }}
          source={{ name: 'X (Twitter)', icon: <BrandIcon brand="x" size="sm" /> }}
          date="2 hours ago"
        >
          Just discovered this amazing new feature! 🚀
        </Blockquote>
      </Block>
    </Block>
  );
}
```
