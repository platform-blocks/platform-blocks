# Layout

Row and Column arrange content horizontally and vertically with Flex alignment, spacing, and sizing props. Row accepts `row` (the default) or `row-reverse` for `direction`; Column accepts `column` (the default) or `column-reverse`. Both default to `gap="sm"`, and Column defaults to `fullWidth={true}`.

## Metadata

- Import: `import { Row, Column } from '@plocks/ui';`
- Tags: layout, horizontal, vertical, row, column, flex, responsive, alignment
- Docs: https://plocks.dev/components/Layout
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Layout

## Props

- `direction`: 'row' | 'row-reverse' | 'column' | 'column-reverse' — Override direction - defaults to 'row' but can be changed to 'row-reverse' Override direction - defaults to 'column' but can be changed to 'column-reverse'
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

### Basics

Combine Row and Column to arrange content in horizontal and vertical groups.

```tsx
import { Block, Column, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      <Row gap="sm">
        <Block bg="subtle" p="sm">
          <Text>First</Text>
        </Block>
        <Block bg="subtle" p="sm">
          <Text>Second</Text>
        </Block>
      </Row>
      <Text>Rows place items side by side; columns stack them.</Text>
    </Column>
  );
}
```
