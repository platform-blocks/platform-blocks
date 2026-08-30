# Breadcrumbs

The Breadcrumbs component displays hierarchical navigation links to help users understand their current location within the application. Item labels and string separators each accept the full `<Text>` API via `labelProps` / `separatorProps`.

## Metadata

- Canonical name: `Breadcrumbs`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Breadcrumbs } from '@platform-blocks/react-ui-library';`
- Category: navigation
- Tags: navigation, breadcrumb, path, hierarchy
- Docs: https://react-ui-library.com/components/Breadcrumbs
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Breadcrumbs

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | BreadcrumbItem[] | Yes |  | Array of breadcrumb items |
| `separator` | ReactNode | No | '/' | Custom separator between breadcrumbs (string, icon, or any React component) |
| `maxItems` | number | No |  | Maximum number of items to show (will collapse middle items) |
| `size` | ComponentSizeValue | No | 'md' | Size of the breadcrumbs |
| `showIcons` | boolean | No | true | Whether to show icons |
| `style` | StyleProp<ViewStyle> | No |  | Custom styles |
| `textStyle` | StyleProp<TextStyle> | No |  | Custom text styles |
| `separatorStyle` | StyleProp<ViewStyle> | No |  | Custom separator styles |
| `accessibilityLabel` | string | No | 'Breadcrumb navigation' | Accessibility label |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to each item's label `<Text>` (style, weight, ff, size, color). |
| `separatorProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the separator `<Text>` when it's a string. |
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

### Hierarchy
ID: `Breadcrumbs.basic` • Tags: breadcrumbs • Category: navigation • Status: stable • Since: 1.0.0

Simple breadcrumb trail showing the current page within a product hierarchy.

```tsx
const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Electronics', href: '/products/electronics' },
  { label: 'Smartphones' },
];
  return <Breadcrumbs items={ITEMS} />;
}
```

### Separators
ID: `Breadcrumbs.separators` • Tags: breadcrumbs • Category: navigation • Status: stable • Since: 1.0.0

Shows how to replace the default slash with characters or React nodes via the `separator` prop.

```tsx
const ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Category', href: '/category' },
  { label: 'Subcategory', href: '/category/subcategory' },
  { label: 'Product' },
];
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
