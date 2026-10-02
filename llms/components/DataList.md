# DataList

DataList displays label and value pairs in an aligned list.

## Metadata

- Import: `import { DataList } from '@plocks/ui';`
- Tags: datalist, description, definition, key-value, label, value, details
- Docs: https://plocks.dev/components/DataList
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/DataList

## Props

- `children`: ReactNode — `DataList.Item` children. Ignored when `data` is provided.
- `data`: DataListDataItem[] — Shorthand for rendering items without composing `DataList.Item` manually
- `orientation`: 'horizontal' | 'vertical' — Layout direction of each label/value pair
- `withDivider`: boolean — Render a divider between items
- `size`: ComponentSizeValue — Controls font size and spacing (theme font-size / spacing tokens, or a px font size)
- `spacing`: ComponentSizeValue | number — Override the vertical gap between items (theme spacing token or px)
- `labelWidth`: number | string — Width of the label column in horizontal orientation (px or percentage)
- `labelColor`: string — Override the label text color for all items
- `valueColor`: string — Override the value text color for all items
- `dividerColor`: string — Override the divider color when `withDivider` is set
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

### DataList.Item

- `children`: ReactNode — Item content. Compose with `DataList.ItemLabel` / `DataList.ItemValue`.
- `label`: ReactNode — Shorthand label content (rendered when `children` is not provided)
- `value`: ReactNode — Shorthand value content (rendered when `children` is not provided)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### DataList.ItemLabel

- `children`: ReactNode
- `c`: string — Override the label text color
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### DataList.ItemValue

- `children`: ReactNode
- `c`: string — Override the value text color
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
export interface DataListDataItem {
  /** Label / term content */
  label: ReactNode;
  /** Value / definition content */
  value: ReactNode;
}
```

## Examples

### Basics

Compose `DataList.Item` with `DataList.ItemLabel` and `DataList.ItemValue` to render aligned label/value pairs.

```tsx
import { DataList } from '@plocks/ui';

export function Demo() {
  return (
    <DataList>
      <DataList.Item>
        <DataList.ItemLabel>Name</DataList.ItemLabel>
        <DataList.ItemValue>John Doe</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Email</DataList.ItemLabel>
        <DataList.ItemValue>john@example.com</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Role</DataList.ItemLabel>
        <DataList.ItemValue>Software Engineer</DataList.ItemValue>
      </DataList.Item>
    </DataList>
  );
}
```

### Vertical Orientation

Set `orientation="vertical"` to stack each label above its value — useful for longer values or narrow layouts.

```tsx
import { DataList } from '@plocks/ui';

export function Demo() {
  return (
    <DataList orientation="vertical">
      <DataList.Item>
        <DataList.ItemLabel>Shipping address</DataList.ItemLabel>
        <DataList.ItemValue>2825 Winding Way, Providence, RI 02908</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Tracking number</DataList.ItemLabel>
        <DataList.ItemValue>1Z 999 AA1 01 2345 6784</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Estimated delivery</DataList.ItemLabel>
        <DataList.ItemValue>July 12, 2026</DataList.ItemValue>
      </DataList.Item>
    </DataList>
  );
}
```

### Dividers & Aligned Labels

Enable `withDivider` to separate items with a border, and set `labelWidth` to keep the value column aligned.

```tsx
import { DataList } from '@plocks/ui';

export function Demo() {
  return (
    <DataList withDivider labelWidth={120}>
      <DataList.Item>
        <DataList.ItemLabel>Plan</DataList.ItemLabel>
        <DataList.ItemValue>Pro (annual)</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Seats</DataList.ItemLabel>
        <DataList.ItemValue>12 of 20 used</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Renews</DataList.ItemLabel>
        <DataList.ItemValue>January 1, 2027</DataList.ItemValue>
      </DataList.Item>
    </DataList>
  );
}
```

### Sizes

Use the `size` prop (`xs`–`3xl`, or a number) to scale font size and spacing together.

```tsx
import { Block, DataList, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" c="secondary">{size}</Text>
          <DataList size={size} labelWidth={90}>
            <DataList.Item label="Status" value="Active" />
            <DataList.Item label="Region" value="us-east-1" />
          </DataList>
        </Block>
      ))}
    </Block>
  );
}
```

### Data Prop Shorthand

Skip the composition and pass a `data` array of `{ label, value }` objects to render items automatically.

```tsx
import { DataList } from '@plocks/ui';

const details = [
  { label: 'Order', value: '#SS-10428' },
  { label: 'Placed', value: 'July 3, 2026' },
  { label: 'Total', value: '$248.00' },
  { label: 'Payment', value: 'Visa •••• 4242' },
];

export function Demo() {
  return <DataList data={details} withDivider labelWidth={100} />;
}
```
