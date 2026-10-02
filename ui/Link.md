# Link

A versatile component for creating styled hyperlinks and navigation elements with hover states and accessibility features.

## Metadata

- Import: `import { Link } from '@plocks/ui';`
- Tags: link, anchor, navigation, url, href
- Docs: https://plocks.dev/components/Link
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Link

## Props

- `children` (required): React.ReactNode — Link text content
- `href`: string — Destination URL. On web the link is a real `<a href>` (middle-click, open in new tab, …).
- `onPress`: () => void — Custom press handler (overrides navigating to `href`)
- `onNavigate`: () => void — Client-side navigation on an ordinary click/press. Modified web clicks keep the native anchor behavior.
- `size`: SizeValue = 'lg' — Size of the link text (default: 'lg' = 16px to match the Text component)
- `c`: ColorProp | 'inherit' — Palette token, `'primary.6'` shade syntax, CSS color, or `'inherit'`
- `variant`: 'default' | 'subtle' | 'hover-underline' = 'default' — Link variant
- `disabled`: boolean = false — Whether the link is disabled
- `external`: boolean = false — An external link: opens in a new tab on web (`target="_blank"`, `rel="noopener noreferrer"`), shows a ↗ indicator, and is announced as opening in a new tab.
- `textStyle`: StyleProp<TextStyle> — Additional text style (merged after `style`)
- `accessibilityLabel`: string — Accessible name (defaults to the link text)
- `target`: '_blank' | '_self' = '_self' — Whether this link opens in a new tab/window (web only)
- `newTabLabel`: string = 'opens in a new tab' — Label appended to the accessible name of links that open in a new tab. @default 'opens in a new tab'
- `ff`: string — Custom font family (overrides theme font)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { LinkBox } from '@plocks/ui';`

### LinkBox

- `href` (required): string
- `children` (required): React.ReactNode
- `style`: StyleProp<ViewStyle>
- `accessibilityLabel`: string
- `onNavigate`: () => void — Handles ordinary navigation. Modified browser clicks retain their native behavior.
- `onHoverIn`: () => void
- `onHoverOut`: () => void

## Examples

### Basics

Embed links directly inside supporting copy to guide readers toward related resources.

```tsx
import { Link, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Text>
      Before publishing, review the <Link href="#brand">brand guidelines</Link>, consult our{' '}
      <Link href="#voice">voice and tone guide</Link>, and confirm each launch in the{' '}
      <Link href="#releases">release checklist</Link>.
    </Text>
  );
}
```

### External Destinations

Use the `external` prop when pointing to destinations outside the current shell.

```tsx
import { Link } from '@plocks/ui';

export function Demo() {
  return (
    <Link href="https://reactnative.dev" external>
      React Native documentation
    </Link>
  );
}
```

### Size Options

Demonstrate how the `size` token scales link typography and spacing.

```tsx
import { Block, Link, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Link size={size} href="#">Link</Link>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Visual Variants

Compare persistent and hover-only underlines alongside subtle variants.

```tsx
import { Block, Link } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Link href="#">Default underline</Link>
      <Link href="#" variant="hover-underline">
        Hover underline
      </Link>
      <Link href="#" variant="subtle">
        Subtle primary
      </Link>
      <Link href="#" variant="subtle" c="gray">
        Subtle gray
      </Link>
    </Block>
  );
}
```
