# Space

Use the Space component to insert fixed spacing between elements when margin props are not available or would make layouts harder to reason about.

## Metadata

- Canonical name: `Space`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Space } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: layout
- Tags: spacing, layout, utility
- Docs: https://react-ui-library.com/components/Space
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Space

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `h` | SizeValue | No |  | Height of the spacer. Accepts theme spacing tokens or raw numbers. |
| `w` | SizeValue | No |  | Width of the spacer. Accepts theme spacing tokens or raw numbers. |
| `size` | SizeValue | No | 'md' | Fallback size when neither `h` nor `w` is provided. Defaults to `md` so the component always occupies some space. |
| `style` | StyleProp<ViewStyle> | No |  | Optional style overrides. |
| `children` | never | No |  | Space is presentational only, so children are not supported. |

## Examples

### Vertical spacing
ID: `Space.basic` • Tags: spacing, layout • Category: basics • Status: stable • Since: 1.0.0

Compare token-based and numeric vertical gaps between stacked content blocks.

```tsx
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
  const theme = useTheme();
  return (
    <Block>
      {EXAMPLES.map(({ label, gap, helper }) => (
        <Block key={label}>
          <Text weight="medium">{label}</Text>
          <Block bg={theme.backgrounds.subtle} radius="lg" p="md">
            <Block>
              <Text>First line</Text>
              <Space h={gap} />
              <Text>Second line</Text>
            </Block>
          </Block>
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Horizontal spacing
ID: `Space.horizontal` • Tags: spacing, layout • Category: layout • Status: stable • Since: 1.0.0

Use `Space` to control gutters between inline buttons with tokens or fixed widths.

```tsx
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
  const theme = useTheme();
  return (
    <Block>
      {GROUPS.map(({ label, gap, helper }) => (
        <Block key={label}>
          <Text weight="medium">{label}</Text>
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
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```
