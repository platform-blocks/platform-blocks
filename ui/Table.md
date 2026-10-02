# Table

Table provides semantic rows, columns, and cells for simple tabular content.

## Metadata

- Import: `import { Table } from '@plocks/ui';`
- Status: experimental
- Tags: table, layout, semantic
- Docs: https://plocks.dev/components/Table
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Table

## Props

- `children`: React.ReactNode
- `data`: TableData — Table data for automatic generation of rows
- `horizontalSpacing`: TableSpacing — Horizontal spacing between cells (`data` mode) — a theme spacing token or px
- `verticalSpacing`: TableSpacing — Vertical spacing between cells (`data` mode) — a theme spacing token or px
- `striped`: boolean — Add striped styling to rows (`data` mode)
- `highlightOnHover`: boolean — Highlight rows on hover (web / pointer devices) — applies to every `Table.Tr` inside the table
- `withTableBorder`: boolean — Add borders around table
- `withColumnBorders`: boolean — Add borders between columns (`data` mode)
- `withRowBorders`: boolean — Add borders between rows (`data` mode)
- `captionSide`: 'top' | 'bottom' — Caption position
- `layout`: 'auto' | 'fixed' — Table layout mode
- `variant`: 'default' | 'vertical' — `vertical` places data headers down the first column (`data` mode).
- `tabularNums`: boolean — Enable tabular numbers for better number alignment
- `fullWidth`: boolean — Make table take full width of container
- `columns`: TableColumnConfig[] — Column width configuration for auto-sizing (`data` mode)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `aria-rowindex`: number
- `aria-colindex`: number
- `aria-rowcount`: number
- `aria-colcount`: number
- `aria-colspan`: number
- `aria-sort`: 'ascending' | 'descending' | 'none' | 'other'

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { TableTh, TableTd, TableTr, TableThead, TableTbody, TableTfoot, TableCaption, TableScrollContainer } from '@plocks/ui';`

### TableScrollContainer

- `children`: React.ReactNode
- `miw`: number — Minimum width of the scrolled content — narrower viewports scroll horizontally. Defaults to `500`.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `aria-rowindex`: number
- `aria-colindex`: number
- `aria-rowcount`: number
- `aria-colcount`: number
- `aria-colspan`: number
- `aria-sort`: 'ascending' | 'descending' | 'none' | 'other'

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Table.ScrollContainer

- `children`: React.ReactNode
- `miw`: number — Minimum width of the scrolled content — narrower viewports scroll horizontally. Defaults to `500`.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`
- `aria-rowindex`: number
- `aria-colindex`: number
- `aria-rowcount`: number
- `aria-colcount`: number
- `aria-colspan`: number
- `aria-sort`: 'ascending' | 'descending' | 'none' | 'other'

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

`TableTh`, `TableTd`, `TableTr`, `TableThead`, `TableTbody`, `TableTfoot`, `TableCaption`, `Table.Caption`, `Table.Tbody`, `Table.Td`, `Table.Th`, `Table.Thead`, `Table.Tr` have no props interface of their own.

## Types

```ts
type TableSpacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface TableColumnConfig {
  /** Column key for identification */
  key?: string;
  /** Column width strategy */
  width?: number | string | 'auto' | 'min-content' | 'max-content';
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Flex grow factor */
  flex?: number;
}
```

## Examples

### Basics

Pass a dataset to the `data` prop to render the caption, header, and body without composing subcomponents.

```tsx
import { Block, Table } from '@plocks/ui';

const data = {
  caption: 'User accounts overview',
  head: ['Name', 'Role', 'Status', 'Posts'],
  body: [
    ['Alice', 'Admin', 'Active', 128],
    ['Bob', 'Editor', 'Invited', 42],
    ['Carol', 'Viewer', 'Active', 5],
    ['Dave', 'Editor', 'Suspended', 16],
  ],
};

export function Demo() {
  return (
    <Block fullWidth>
      <Table data={data} withTableBorder />
    </Block>
  );
}
```

### Variants

Compare the default and vertical table layout modes with the same data.

```tsx
import { Column, Table, Text } from '@plocks/ui';

const data = { head: ['Name', 'Status'], body: [['Avery', 'Active'], ['Jordan', 'Pending']] };
const variants = ['default', 'vertical'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <Table variant={variant} data={data} withTableBorder fullWidth />
        </Column>
      ))}
    </Column>
  );
}
```

### Border Options

Enable `withTableBorder`, `withColumnBorders`, and `withRowBorders` to emphasize cell boundaries.

```tsx
import { Block, Table } from '@plocks/ui';

const data = {
  head: ['ID', 'Region', 'Sales', 'Growth %'],
  body: [
    ['#1001', 'NA', '$120,340', '+12.4%'],
    ['#1002', 'EU', '$98,210', '+4.1%'],
    ['#1003', 'APAC', '$76,003', '+8.9%'],
    ['#1004', 'LATAM', '$23,554', '+15.2%'],
  ],
  caption: 'Quarterly regional performance',
};

export function Demo() {
  return (
    <Block fullWidth>
      <Table data={data} withTableBorder withColumnBorders withRowBorders />
    </Block>
  );
}
```

### Manual Composition

Use the table subcomponents when you need custom cells, alignments, or dynamic rows beyond the `data` helper.

```tsx
import { Block, Chip, Table } from '@plocks/ui';

const rows = [
  { name: 'plocks', stack: 'RN / Expo', status: 'stable', stars: 4210 },
  { name: 'ignite', stack: 'RN', status: 'active', stars: 9230 },
  { name: 'tamagui', stack: 'RN / Web', status: 'active', stars: 16000 },
  { name: 'nativewind', stack: 'RN', status: 'active', stars: 7600 },
];

export function Demo() {
  return (
    <Block fullWidth>
      <Table withTableBorder>
        <Table.Caption>React Native UI libraries</Table.Caption>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Stack</Table.Th>
            <Table.Th align="center">Status</Table.Th>
            <Table.Th align="right">Stars</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.name}>
              <Table.Td>{row.name}</Table.Td>
              <Table.Td>{row.stack}</Table.Td>
              <Table.Td align="center">
                <Chip size="xs" color={row.status === 'stable' ? 'success' : 'primary'} variant="light">
                  {row.status}
                </Chip>
              </Table.Td>
              <Table.Td align="right" widthStrategy="min-content">
                {row.stars.toLocaleString()}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Block>
  );
}
```

### Horizontal Scroll

Use `Table.ScrollContainer` to clamp table width and let users horizontally scroll large matrices.

```tsx
import { Block, Table } from '@plocks/ui';

const columns = Array.from({ length: 12 }, (_, index) => `Col ${index + 1}`);

const body = Array.from({ length: 8 }, (_, rowIndex) =>
  columns.map((_, columnIndex) => `R${rowIndex + 1}C${columnIndex + 1}`)
);

export function Demo() {
  return (
    <Block fullWidth>
      <Table.ScrollContainer miw={900}>
        <Table
          data={{ head: columns, body, caption: 'Wide matrix sample' }}
          withTableBorder
          striped
        />
      </Table.ScrollContainer>
    </Block>
  );
}
```

### Column Sizing

Define the `columns` array to set fixed widths, min widths, or flex growth for responsive tables.

```tsx
import { Block, Table } from '@plocks/ui';

const columns = [
  { key: 'name', minWidth: 140 },
  { key: 'email', flex: 2, minWidth: 200 },
  { key: 'plan', width: 90 },
  { key: 'usage', flex: 1, minWidth: 120 },
];

const data = {
  head: ['Name', 'Email', 'Plan', 'Usage'],
  body: [
    ['Alice Carter', 'alice@example.com', 'Pro', '13.4 GB'],
    ['Brandon Lee', 'brandon@example.com', 'Free', '1.1 GB'],
    ['Chloe Mills', 'chloe@example.com', 'Business', '54.2 GB'],
    ['Daniel Stone', 'daniel@example.com', 'Pro', '8.7 GB'],
  ],
};

export function Demo() {
  return (
    <Block fullWidth>
      <Table data={data} columns={columns} withTableBorder />
    </Block>
  );
}
```
