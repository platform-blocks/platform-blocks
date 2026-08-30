# Table

The Table component offers a minimal semantic wrapper (thead, tbody, tr, th, td) useful for simple static tabular data when the full DataTable is unnecessary.

## Metadata

- Canonical name: `Table`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Table } from '@platform-blocks/react-ui-library';`
- Status: experimental
- Category: data
- Tags: table, layout, semantic
- Docs: https://react-ui-library.com/components/Table
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Table

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | No |  |  |
| `data` | TableData | No |  | Table data for automatic generation of rows |
| `horizontalSpacing` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number | No |  | Horizontal spacing between cells |
| `verticalSpacing` | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number | No |  | Vertical spacing between cells |
| `striped` | boolean | No |  | Add striped styling to rows |
| `highlightOnHover` | boolean | No |  | Highlight rows on hover/press |
| `withTableBorder` | boolean | No |  | Add borders around table |
| `withColumnBorders` | boolean | No |  | Add borders between columns |
| `withRowBorders` | boolean | No |  | Add borders between rows |
| `captionSide` | 'top' \| 'bottom' | No |  | Caption position |
| `layout` | 'auto' \| 'fixed' | No |  | Table layout mode |
| `variant` | 'default' \| 'vertical' | No |  | Variant of table layout |
| `tabularNums` | boolean | No |  | Enable tabular numbers for better number alignment |
| `fullWidth` | boolean | No |  | Make table take full width of container |
| `columns` | Array<{ key?: string; width?: number \| string \| 'auto' \| 'min-content' \| 'max-content'; minWidth?: number; maxWidth?: number; flex?: number; }> | No |  | Column width configuration for auto-sizing |
| `style` | any | No |  | Additional styles |
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

### Data Prop
ID: `Table.basic` • Tags: table • Category: usage • Status: stable • Since: 1.0.0

Pass a dataset to the `data` prop to render the caption, header, and body without composing subcomponents.

```tsx
return (
    <Block>
      <Text size="sm" color="secondary">
        Provide the `data` prop to render the caption, header, and body automatically.
      </Text>
      <Table data={data} withTableBorder fullWidth />
    </Block>
  );
}
```

### Border Options
ID: `Table.borders` • Tags: table, borders • Category: appearance • Status: stable • Since: 1.0.0

Enable `withTableBorder`, `withColumnBorders`, and `withRowBorders` to emphasize cell boundaries.

```tsx
return (
    <Block>
      <Text size="sm" color="secondary">
        Combine table, column, and row borders to separate dense numeric data.
      </Text>
      <Table
        data={data}
        withTableBorder
        withColumnBorders
        withRowBorders
        striped
        fullWidth
      />
    </Block>
  );
}
```

### Manual Composition
ID: `Table.custom` • Tags: table, composition • Category: usage • Status: stable • Since: 1.0.0

Use the table subcomponents when you need custom cells, alignments, or dynamic rows beyond the `data` helper.

```tsx
return (
    <Block>
      <Text size="sm" color="secondary">
        Compose tables manually for rich cells, spanning, or custom headers.
      </Text>
      <Table withTableBorder fullWidth>
        <Table.Caption>Manually composed table with rich cell content</Table.Caption>
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
ID: `Table.scroll` • Tags: table, scroll • Category: layout • Status: stable • Since: 1.0.0

Use `Table.ScrollContainer` to clamp table width and let users horizontally scroll large matrices.

```tsx
return (
    <Block>
      <Text size="sm" color="secondary">
        Wrap wide datasets in `Table.ScrollContainer` to enable horizontal scrolling.
      </Text>
      <Table.ScrollContainer minW={900}>
        <Table
          data={{ head: columns, body, caption: 'Wide matrix sample (scroll to explore)' }}
          withTableBorder
          striped
        />
      </Table.ScrollContainer>
    </Block>
  );
}
```

### Column Sizing
ID: `Table.sizing` • Tags: table, columns • Category: layout • Status: stable • Since: 1.0.0

Define the `columns` array to set fixed widths, min widths, or flex growth for responsive tables.

```tsx
return (
    <Block>
      <Text size="sm" color="secondary">
        Pass column sizing rules to control flex growth, widths, and minimums.
      </Text>
      <Table data={data} columns={columns} withTableBorder fullWidth />
    </Block>
  );
}
```
