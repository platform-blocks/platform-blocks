# Grid

Grid arranges items in responsive columns and spans.

## Metadata

- Import: `import { Grid } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Grid
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Grid

## Props

- `columns`: ResponsiveProp<number> — Number of columns (can be responsive)
- `gap`: SizeValue — Gap between items
- `rowGap`: SizeValue — Row gap between items
- `columnGap`: SizeValue — Column gap between items
- `fullWidth`: boolean — Make the grid take full width (100%)
- `children`: React.ReactNode — Children elements
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

`import { GridItem } from '@plocks/ui';`

### GridItem

- `span`: ResponsiveProp<number> — Column span (how many columns this item should span) - can be responsive
- `children`: React.ReactNode — Children elements
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Basic 12-column grid with equal width items.

```tsx
import { Block, Card, Grid, GridItem, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {Array.from({ length: 12 }).map((_, index) => (
          <GridItem key={index} span={1}>
            <Card variant="outline">
              <Text size="sm" ta="center">
                {index + 1}
              </Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Block>
  );
}
```

### Gaps

Row and column gutters come from the container: `gap` sets both, `rowGap` and `columnGap` override one each. Items never carry their own padding or margin.

```tsx
import { Block, Card, Grid, GridItem, Text } from '@plocks/ui';

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

export function Demo() {
  return (
    <Block fullWidth>
      {sections.map(({ label, props }) => (
        <Block key={label} fullWidth>
          <Text size="sm" fw="semibold">
            {label}
          </Text>
          <Grid columns={6} {...props}>
            {Array.from({ length: 12 }).map((_, index) => (
              <GridItem key={index} span={1}>
                <Card variant="outline">
                  <Text size="sm" ta="center">
                    Item {index + 1}
                  </Text>
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

Nested grids demonstrating composition inside a grid item.

```tsx
import { Block, Card, Grid, GridItem, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        <GridItem span={8}>
          <Card variant="outline">
            <Block>
              <Text size="sm" ta="center">
                Parent span=8
              </Text>
              <Grid columns={6} gap="sm">
                {Array.from({ length: 6 }).map((_, index) => (
                  <GridItem key={index} span={2}>
                    <Card variant="filled" p="xs">
                      <Text size="xs" ta="center">
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
            <Text size="sm" ta="center">
              Sidebar span=4
            </Text>
          </Card>
        </GridItem>
      </Grid>
    </Block>
  );
}
```

### Responsive

Pass breakpoint objects such as `{ base: 4, md: 8, lg: 12 }` to `columns` and `span` so the layout adapts at `base`, `md` and `lg`; each label lists its span at those three breakpoints.

```tsx
import { Block, Card, Grid, GridItem, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Grid columns={{ base: 4, md: 8, lg: 12 }} gap="md">
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Hero (4/4/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 4, lg: 6 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Hero (4/4/6)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 2, md: 4, lg: 3 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Side (2/4/3)</Text>
          </Card>
        </GridItem>
        <GridItem span={{ base: 4, md: 8, lg: 12 }}>
          <Card variant="outline">
            <Text size="sm" ta="center">Footer (4/8/12)</Text>
          </Card>
        </GridItem>
      </Grid>
    </Block>
  );
}
```

### Spans

Demonstrates varying column spans within a 12-column grid.

```tsx
import { Block, Card, Grid, GridItem, Text } from '@plocks/ui';

export function Demo() {
  const spans = [6, 6, 4, 4, 4, 3, 3, 3, 3];

  return (
    <Block fullWidth>
      <Grid columns={12} gap="md">
        {spans.map((span, index) => (
          <GridItem key={`${span}-${index}`} span={span}>
            <Card variant="outline">
              <Text size="sm" ta="center">{`span=${span}`}</Text>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Block>
  );
}
```
