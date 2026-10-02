# Flex

Flex provides a powerful and intuitive way to create flexible layouts using CSS Flexbox principles. It handles spacing, alignment, and direction with a clean API that works consistently across platforms.

## Metadata

- Import: `import { Flex } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Flex
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Flex

## Props

- `direction`: 'row' | 'column' | 'row-reverse' | 'column-reverse' — Flex direction. `row` already follows the layout direction (it runs right-to-left in RTL on both React Native and the web).
- `align`: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' — Align items on the cross axis
- `justify`: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' — Justify content on the main axis
- `wrap`: 'nowrap' | 'wrap' | 'wrap-reverse' — Flex wrap
- `gap`: SizeValue — Gap between children (applies to both row and column gap)
- `rowGap`: SizeValue — Row gap between children
- `columnGap`: SizeValue — Column gap between children
- `grow`: number — Flex grow
- `shrink`: number — Flex shrink
- `basis`: DimensionValue — Flex basis
- `children`: React.ReactNode — Children elements
- `disableRTLMirroring`: boolean — Keep left-to-right order even in right-to-left layouts (e.g. media controls, number pads). Lays this container's subtree out LTR.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { Row, Column } from '@plocks/ui';`

### Row

- `direction`: 'row' | 'row-reverse' — Override direction - defaults to 'row' but can be changed to 'row-reverse'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Flex` props (`align` `justify` `wrap` `gap` `rowGap` `columnGap` `grow` `shrink` `basis` `children` `disableRTLMirroring`): https://plocks.dev/llms/components/Flex.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### Column

- `direction`: 'column' | 'column-reverse' — Override direction - defaults to 'column' but can be changed to 'column-reverse'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Flex` props (`align` `justify` `wrap` `gap` `rowGap` `columnGap` `grow` `shrink` `basis` `children` `disableRTLMirroring`): https://plocks.dev/llms/components/Flex.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Align Items

Item alignment options along the cross axis (flex-start, center, stretch, etc.).

```tsx
import { Block, Card, Flex, Text, useTheme } from '@plocks/ui';

const ALIGNMENTS = ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] as const;

export function Demo() {
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
          <Text variant="span" size="sm" c="muted">align=&quot;{value}&quot;</Text>
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

### Basics

Simple flex container with three items and gap spacing.

```tsx
import { Card, Flex, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Flex gap="md" fullWidth>
      <Card p="sm">
        <Text>Item 1</Text>
      </Card>
      <Card p="sm">
        <Text>Item 2</Text>
      </Card>
      <Card p="sm">
        <Text>Item 3</Text>
      </Card>
    </Flex>
  );
}
```

### Flex Direction

Row and column direction layouts for different item arrangements.

```tsx
import { Block, Card, Flex, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="span" size="sm" c="muted">direction="row"</Text>
        <Flex direction="row" gap="md">
          <Card p="sm"><Text>Item 1</Text></Card>
          <Card p="sm"><Text>Item 2</Text></Card>
          <Card p="sm"><Text>Item 3</Text></Card>
        </Flex>
      </Block>

      <Block>
        <Text variant="span" size="sm" c="muted">direction="column"</Text>
        <Flex direction="column" gap="md">
          <Card p="sm"><Text>Item 1</Text></Card>
          <Card p="sm"><Text>Item 2</Text></Card>
          <Card p="sm"><Text>Item 3</Text></Card>
        </Flex>
      </Block>
    </Block>
  );
}
```

### Justify Content

Content justification options along the main axis (flex-start, center, space-between, etc.).

```tsx
import { Block, Card, Flex, Text, useTheme, type FlexProps } from '@plocks/ui';

const JUSTIFY_OPTIONS: Array<{ label: string; value: NonNullable<FlexProps['justify']> }> = [
  { label: 'Start', value: 'flex-start' },
  { label: 'Center', value: 'center' },
  { label: 'End', value: 'flex-end' },
  { label: 'Between', value: 'space-between' },
  { label: 'Around', value: 'space-around' },
  { label: 'Evenly', value: 'space-evenly' },
];

export function Demo() {
  const theme = useTheme();

  return (
    <Block align="stretch">
      {JUSTIFY_OPTIONS.map(({ value }) => (
        <Block key={value} align="stretch">
          <Text variant="span" size="sm" c="muted">justify="{value}"</Text>
          <Flex
            direction="row"
            justify={value}
            mih={60}
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
        </Block>
      ))}
    </Block>
  );
}
```
