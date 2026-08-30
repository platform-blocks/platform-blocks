# Flex

Flex provides a powerful and intuitive way to create flexible layouts using CSS Flexbox principles. It handles spacing, alignment, and direction with a clean API that works consistently across platforms.

## Metadata

- Canonical name: `Flex`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Flex } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: layout
- Docs: https://react-ui-library.com/components/Flex
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Flex

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `direction` | 'row' \| 'column' \| 'row-reverse' \| 'column-reverse' | No |  | Flex direction |
| `align` | 'flex-start' \| 'flex-end' \| 'center' \| 'stretch' \| 'baseline' | No |  | Align items on the cross axis |
| `justify` | 'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly' | No |  | Justify content on the main axis |
| `wrap` | 'nowrap' \| 'wrap' \| 'wrap-reverse' | No |  | Flex wrap |
| `gap` | SizeValue | No |  | Gap between children (applies to both row and column gap) |
| `rowGap` | SizeValue | No |  | Row gap between children |
| `columnGap` | SizeValue | No |  | Column gap between children |
| `grow` | number | No |  | Flex grow |
| `shrink` | number | No |  | Flex shrink |
| `basis` | DimensionValue | No |  | Flex basis |
| `children` | React.ReactNode | No |  | Children elements |
| `style` | StyleProp<ViewStyle> | No |  | Custom styles |
| `testID` | string | No |  | Test ID for testing |
| `disableRTLMirroring` | boolean | No |  | Disable automatic RTL mirroring for row direction |
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
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |

## Examples

### Align Items
ID: `Flex.align` • Tags: align, items, cross-axis, alignment, stretch • Category: general

Item alignment options along the cross axis (flex-start, center, stretch, etc.).

```tsx
const ALIGNMENTS = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] as const;
  const theme = useTheme();
  // Baseline is only legible if each Text has a visible box; pull the fill from
  // the theme so it reads in both light and dark.
  const chip = { backgroundColor: theme.backgrounds.elevated, paddingHorizontal: 8 };
  return (
    // wrap="wrap" — five fixed-width examples in a row would overflow on narrow
    // viewports, since flex children don't shrink by default here.
    <Flex wrap="wrap" align="flex-start" gap="lg" fullWidth>
      {ALIGNMENTS.map((value) => (
        <Block key={value} gap="xs">
          <Text variant="span" size="sm" color="muted">align=&quot;{value}&quot;</Text>
          <Card variant="subtle" p="sm">
            {value === 'baseline' ? (
              <Flex direction="row" align="baseline" gap="sm" h={80}>
                {/* Text of varying sizes — their baselines line up, not their boxes */}
                <Text variant="span" size={24} style={chip}>Aa</Text>
                <Text variant="span" size={16} style={chip}>Bb</Text>
                <Text variant="span" size={12} style={chip}>Cc</Text>
              </Flex>
            ) : value === 'stretch' ? (
              <Flex direction="row" align={value} gap="sm" h={80}>
                {/* No fixed heights so children stretch to the container's cross-size */}
                <Card p="xs" style={{ minWidth: 32 }}><Text variant="small">1</Text></Card>
                <Card p="xs" style={{ minWidth: 32 }}><Text variant="small">2</Text></Card>
                <Card p="xs" style={{ minWidth: 32 }}><Text variant="small">3</Text></Card>
              </Flex>
            ) : (
              <Flex direction="row" align={value} gap="sm" h={80}>
                {/* Different heights to showcase flex-start/center/flex-end */}
                <Card p="xs" h={40}><Text variant="small">A</Text></Card>
                <Card p="xs" h={60}><Text variant="small">B</Text></Card>
                <Card p="xs" h={30}><Text variant="small">C</Text></Card>
              </Flex>
            )}
          </Card>
        </Block>
      ))}
    </Flex>
  );
}
```

### Basic Flex Layout
ID: `Flex.basic` • Tags: basic, gap, layout, container • Category: general

Simple flex container with three items and gap spacing.

```tsx
return (
    <Card variant="outline" p="md">
      <Flex gap="md">
        <Card p="sm">
          <Text variant="p">Item 1</Text>
        </Card>
        <Card p="sm">
          <Text variant="p">Item 2</Text>
        </Card>
        <Card p="sm">
          <Text variant="p">Item 3</Text>
        </Card>
      </Flex>
    </Card>
  );
}
```

### Flex Direction
ID: `Flex.direction` • Tags: direction, row, column, arrangement, axis • Category: general

Row and column direction layouts for different item arrangements.

```tsx
return (
    <Block>
      <Block>
        <Text variant="h4">Row Direction</Text>
        <Card variant="outline" p="md">
          <Flex direction="row" gap="md">
            <Card p="sm"><Text variant="p">Item 1</Text></Card>
            <Card p="sm"><Text variant="p">Item 2</Text></Card>
            <Card p="sm"><Text variant="p">Item 3</Text></Card>
          </Flex>
        </Card>
      </Block>
      <Block>
        <Text variant="h4">Column Direction</Text>
        <Card variant="outline" p="md">
          <Flex direction="column" gap="md">
            <Card p="sm"><Text variant="p">Item 1</Text></Card>
            <Card p="sm"><Text variant="p">Item 2</Text></Card>
            <Card p="sm"><Text variant="p">Item 3</Text></Card>
          </Flex>
        </Card>
      </Block>
    </Block>
  );
}
```

### Justify Content
ID: `Flex.justify` • Tags: justify, content, spacing, distribution, main-axis • Category: general

Content justification options along the main axis (flex-start, center, space-between, etc.).

```tsx
const theme = useTheme();
  return (
    <Block align="stretch">
      {[
        { label: 'Start', value: 'flex-start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'flex-end' },
        { label: 'Between', value: 'space-between' },
        { label: 'Around', value: 'space-around' },
        { label: 'Evenly', value: 'space-evenly' }
      ].map(({ value }) => (
        <Block key={value} align="stretch">
          <Text variant="span" size="sm" color="muted">justify="{value}"</Text>
          <Card variant="ghost" padding={0} style={{ alignSelf: 'stretch', width: '100%' }}>
            <Flex
              direction="row"
              justify={value as any}
              minH={60}
              style={{
                // Give the row a large track to clearly expose free space
                width: 600,
                maxWidth: '100%',
                borderWidth: 1,
                borderStyle: 'dashed' as const,
                // Without an explicit color the dashed track falls back to black
                // in both themes.
                borderColor: theme.backgrounds.border,
                borderRadius: 4
              }}
            >
              {/* Small fixed squares with no shrink so free space is obvious */}
              <Card padding={0} style={{ width: 40, height: 40, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="small">A</Text>
              </Card>
              <Card padding={0} style={{ width: 40, height: 40, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="small">B</Text>
              </Card>
              <Card padding={0} style={{ width: 40, height: 40, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="small">C</Text>
              </Card>
            </Flex>
          </Card>
        </Block>
      ))}
    </Block>
  );
}
```
