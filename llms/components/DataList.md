# DataList

DataList displays a set of label/value pairs, such as user details or metadata, in a clean, aligned layout. Compose items with `DataList.Item`, `DataList.ItemLabel`, and `DataList.ItemValue`, or pass a `data` array for a quick setup.

## Metadata

- Canonical name: `DataList`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { DataList } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 0.10.1
- Category: data
- Tags: datalist, description, definition, key-value, label, value, details
- Docs: https://react-ui-library.com/components/DataList
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/DataList

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | ReactNode | No |  | `DataList.Item` children. Ignored when `data` is provided. |
| `data` | DataListDataItem[] | No |  | Shorthand for rendering items without composing `DataList.Item` manually |
| `orientation` | DataListOrientation | No |  | Layout direction of each label/value pair |
| `withDivider` | boolean | No |  | Render a divider between items |
| `size` | ComponentSizeValue | No |  | Controls font size and spacing |
| `spacing` | ComponentSizeValue \| number | No |  | Override the vertical gap between items |
| `labelWidth` | number \| string | No |  | Width of the label column in horizontal orientation |
| `labelColor` | string | No |  | Override the label text color for all items |
| `valueColor` | string | No |  | Override the value text color for all items |
| `dividerColor` | string | No |  | Override the divider color when `withDivider` is set |
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

### Basic Usage
ID: `DataList.basic` • Tags: datalist • Category: basics • Status: stable • Since: 0.10.1

Compose `DataList.Item` with `DataList.ItemLabel` and `DataList.ItemValue` to render aligned label/value pairs.

```tsx
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
ID: `DataList.vertical` • Tags: datalist, orientation • Category: basics • Status: stable • Since: 0.10.1

Set `orientation="vertical"` to stack each label above its value — useful for longer values or narrow layouts.

```tsx
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
ID: `DataList.dividers` • Tags: datalist, divider • Category: basics • Status: stable • Since: 0.10.1

Enable `withDivider` to separate items with a border, and set `labelWidth` to keep the value column aligned.

```tsx
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
ID: `DataList.sizes` • Tags: datalist, size • Category: basics • Status: stable • Since: 0.10.1

Use the `size` prop (`xs`–`3xl`, or a number) to scale font size and spacing together.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" color="secondary">{size}</Text>
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
ID: `DataList.data` • Tags: datalist, data • Category: basics • Status: stable • Since: 0.10.1

Skip the composition and pass a `data` array of `{ label, value }` objects to render items automatically.

```tsx
const details = [
  { label: 'Order', value: '#SS-10428' },
  { label: 'Placed', value: 'July 3, 2026' },
  { label: 'Total', value: '$248.00' },
  { label: 'Payment', value: 'Visa •••• 4242' },
];
  return <DataList data={details} withDivider labelWidth={100} />;
}
```
