# Breadcrumbs

Breadcrumbs displays the path to the current page as navigation links.

## Metadata

- Import: `import { Breadcrumbs } from '@plocks/ui';`
- Tags: navigation, breadcrumb, path, hierarchy
- Docs: https://plocks.dev/components/Breadcrumbs
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Breadcrumbs

## Props

- `items` (required): BreadcrumbItem[] — Array of breadcrumb items
- `separator`: ReactNode = '/' — Custom separator between breadcrumbs (string, icon, or any React component). Hidden from assistive technology.
- `maxItems`: number — Maximum number of items to show (will collapse middle items)
- `size`: SizeValue = 'md' — Size of the breadcrumbs: a font-size token or a px font size. @default 'md'
- `showIcons`: boolean = true — Whether to show icons
- `textStyle`: StyleProp<TextStyle> — Custom text styles
- `separatorStyle`: StyleProp<ViewStyle> — Custom separator styles
- `accessibilityLabel`: string = 'Breadcrumb' — Accessible name of the navigation landmark. @default 'Breadcrumb'
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to each item's label `<Text>` (style, fw, ff, size, c).
- `separatorProps`: Omit<TextProps, 'children'> — Override props applied to the separator `<Text>` when it's a string.
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
export interface BreadcrumbItem {
  /** The label text for the breadcrumb */
  label: string;

  /**
   * The href/path for navigation. On web an item with `href` and no `onPress`
   * renders as a real link; with `onPress`, the press handler does the routing.
   */
  href?: string;

  /** Custom icon to display before the label (decorative) */
  icon?: ReactNode;

  /** Press handler for the breadcrumb item */
  onPress?: () => void;

  /** Whether this breadcrumb is disabled */
  disabled?: boolean;
}
```

## Examples

### Basics

Simple breadcrumb trail showing the current page within a product hierarchy.

```tsx
import { Breadcrumbs } from '@plocks/ui';

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Smartphones' },
];

export function Demo() {
  return <Breadcrumbs items={ITEMS} />;
}
```

### Separators

Shows how to replace the default slash with characters or React nodes via the `separator` prop.

```tsx
import { Block, Breadcrumbs, Icon } from '@plocks/ui';

const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Subcategory', href: '/category/subcategory' },
  { label: 'Product' },
];

export function Demo() {
  return (
    <Block>
      <Breadcrumbs items={ITEMS} />
      <Breadcrumbs items={ITEMS} separator=">" />
      <Breadcrumbs items={ITEMS} separator={<Icon name="chevron-right" size={14} />} />
      <Breadcrumbs items={ITEMS} separator="•" />
    </Block>
  );
}
```
