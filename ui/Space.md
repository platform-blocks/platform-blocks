# Space

Use the Space component to insert fixed spacing between elements when margin props are not available or would make layouts harder to reason about.

## Metadata

- Import: `import { Space } from '@plocks/ui';`
- Tags: spacing, layout, utility
- Docs: https://plocks.dev/components/Space
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Space

## Props

- `h`: SizeValue | DimensionProp — Height of the spacer: a `theme.spacing` token, px, or any box dimension (`'full'`, `'50%'`).
- `w`: SizeValue | DimensionProp — Width of the spacer: a `theme.spacing` token, px, or any box dimension (`'full'`, `'50%'`).
- `size`: SizeValue — Fallback size when neither `h` nor `w` is provided. Defaults to `md` so the component always occupies some space.
- `children`: never — Space is presentational only, so children are not supported.
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Compare token-based and numeric vertical gaps between stacked content blocks.

```tsx
import { Block, Space, Text, useTheme } from '@plocks/ui';

const EXAMPLES = [
  {
    label: 'Token spacing (md)',
    gap: 'md' as const,
    helper: 'Use theme tokens for consistent rhythm between related content.'
  },
  {
    label: 'Token spacing (xl)',
    gap: 'xl' as const,
    helper: 'Larger tokens create breathing room for grouped sections.'
  },
  {
    label: 'Numeric spacing (24px)',
    gap: 24,
    helper: 'Fallback to numeric values when a token does not fit the layout.'
  }
] as const;

export function Demo() {
  const theme = useTheme();

  return (
    <Block>
      {EXAMPLES.map(({ label, gap, helper }) => (
        <Block key={label}>
          <Text fw="medium">{label}</Text>
          <Block bg={theme.backgrounds.subtle} radius="lg" p="md">
            <Block>
              <Text>First line</Text>
              <Space h={gap} />
              <Text>Second line</Text>
            </Block>
          </Block>
          <Text variant="small" c="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Horizontal spacing

Use `Space` to control gutters between inline buttons with tokens or fixed widths.

```tsx
import { Block, Button, Row, Space, Text, useTheme } from '@plocks/ui';

const GROUPS = [
  {
    label: 'Token spacing (lg)',
    gap: 'lg' as const,
    helper: 'Theme tokens keep button gutters aligned with the spacing scale.'
  },
  {
    label: 'Numeric spacing (18px)',
    gap: 18,
    helper: 'Use a numeric width when exact measurements are required.'
  }
] as const;

export function Demo() {
  const theme = useTheme();

  return (
    <Block>
      {GROUPS.map(({ label, gap, helper }) => (
        <Block key={label}>
          <Text fw="medium">{label}</Text>
          <Block bg={theme.backgrounds.surface} radius="lg" p="md">
            <Row align="center">
              <Button size="sm">Primary</Button>
              <Space w={gap} />
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Space w={gap} />
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
            </Row>
          </Block>
          <Text variant="small" c="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```
