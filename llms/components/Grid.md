# Grid

Responsive 12‑column layout primitive with span-based children. Each `GridItem` declares how many columns it consumes; container controls total columns and gaps. Supports responsive values for `columns` and `span` using breakpoint-aware props.

## Metadata

- Canonical name: `Grid`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Grid } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: layout
- Docs: https://react-ui-library.com/components/Grid
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Grid

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `columns` | ResponsiveProp<number> | No |  | Number of columns (can be responsive) |
| `gap` | SizeValue | No | 0 | Gap between items |
| `rowGap` | SizeValue | No |  | Row gap between items |
| `columnGap` | SizeValue | No |  | Column gap between items |
| `fullWidth` | boolean | No | false | Make the grid take full width (100%) |
| `children` | React.ReactNode | No |  | Children elements |
| `style` | StyleProp<ViewStyle> | No |  | Custom styles |
| `testID` | string | No |  | Test ID for testing |
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

### Basic
ID: `Grid.basic` • Category: general

Basic 12-column grid with equal width items.

```tsx
return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {Array.from({ length: 12 }).map((_, index) => (
          <GridItem key={index} span={1}>
            <Card variant="outline">
              <Text size="sm" align="center">
                {index + 1}
              </Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
      <Text size="sm" color="secondary">
        Twelve even columns, each spanning a single track
      </Text>
    </Block>
  );
}
```

### Gaps
ID: `Grid.gaps` • Category: general

Row and column gutters come from the container: `gap` sets both, `rowGap` and `columnGap` override one each. Items never carry their own padding or margin.

```tsx
const sections = [
  {
    label: 'Compact gap (xs)',
    props: { gap: 'xs' as const },
  },
  {
    label: 'Roomy gap (2xl)',
    props: { gap: '2xl' as const },
  },
  {
    label: 'Wide rows, tight columns',
    props: { rowGap: '2xl' as const, columnGap: 'xs' as const },
  },
];
  return (
    <Block fullWidth>
      {sections.map(({ label, props }) => (
        <Block key={label} fullWidth>
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <Grid columns={6} {...props}>
            {Array.from({ length: 12 }).map((_, index) => (
              <GridItem key={index} span={1}>
                <Card>
                  <Text size="sm">Item {index + 1}</Text>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </Block>
      ))}
    </Block>
  );
}
```

### Nesting
ID: `Grid.nesting` • Category: general

Nested grids demonstrating composition inside a grid item.

```tsx
return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        <GridItem span={8}>
          <Card variant="outline">
            {/* Block's own gap separates the label from the nested grid — no
                margin on either one. */}
            <Block>
              <Text weight="semibold" size="sm">
                Parent span=8
              </Text>
              <Grid columns={6} gap="sm">
                {Array.from({ length: 6 }).map((_, index) => (
                  <GridItem key={index} span={2}>
                    <Card variant="filled" p="xs">
                      <Text size="xs" align="center">
                        Nested {index + 1}
                      </Text>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </Block>
          </Card>
        </GridItem>
        <GridItem span={4}>
          <Card variant="outline">
            <Text weight="semibold" size="sm">
              Sidebar span=4
            </Text>
          </Card>
        </GridItem>
      </Grid>
      <Text size="sm" color="secondary">
        GridItem components can render another Grid to illustrate nested layouts
      </Text>
    </Block>
  );
}
```

### Responsive
ID: `Grid.responsive` • Category: general

Responsive columns and item spans using breakpoint-aware props.

```tsx
// Responsive props match the breakpoint configuration used in Grid
  return (
    <Block fullWidth>
      <Grid columns={{ base: 4, md: 8, lg: 12 }} gap="md">
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card>
            <Text>Hero (4/8/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card>
            <Text>Hero (4/8/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card>
            <Text>Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card>
            <Text>Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 8, lg: 12 }}>
          <Card>
            <Text>Footer (4/8/12)</Text>
          </Card>
        </GridItem>
      </Grid>
      <Text size="sm" color="secondary">
        Column and span props adapt at base, md, and lg breakpoints
      </Text>
    </Block>
  );
}
```

### Spans
ID: `Grid.spans` • Category: general

Demonstrates varying column spans within a 12-column grid.

```tsx
const spans = [6, 6, 4, 4, 4, 3, 3, 3, 3];
  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {spans.map((span, index) => (
          <GridItem key={`${span}-${index}`} span={span}>
            <Card>
              <Text>{`span=${span}`}</Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
      <Text size="sm" color="secondary">
        Mix spans within a 12-column grid to create varied layouts
      </Text>
    </Block>
  );
}
```
