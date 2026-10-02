# Highlight

Highlight emphasizes matching fragments inside longer strings, reusing the Text component so typography settings stay consistent across platforms.

## Metadata

- Import: `import { Highlight } from '@plocks/ui';`
- Tags: text, emphasis, highlight, mark
- Docs: https://plocks.dev/components/Highlight
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Highlight

## Props

- `highlight`: HighlightValue | HighlightValue[] — Substring or substrings to emphasize within the provided children
- `highlightStyles`: HighlightStyles — Optional override for the highlighted segment styles. Accepts either a style object/array or a callback that receives the current theme and returns styles.
- `highlightColor`: string — Marker background. Defaults to the theme's `backgrounds.mark`. A theme palette name (`'teal'`, `'highlight'`) uses a soft shade of that palette; `'primary.2'` shade syntax, a background role (`'selected'`) or any CSS color is used as-is. The fragment's text color stays readable on it.
- `caseSensitive`: boolean = false — Toggle case-sensitive matching (defaults to case-insensitive).
- `trim`: boolean = true — Trim highlight values before matching to ignore accidental whitespace. Defaults to true.
- `highlightProps`: Partial<TextProps> — Additional props applied to the highlighted Text nodes.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Text` props (`children` `tx` `txParams` `variant` `textRole` `size` `c` `fw` `ta` `lh` `lts` `tt` `fs` `td` `ff` `flex` `shrink` `position` `top` `right` `bottom` `left` `as` `selectable` `onPress` `onLayout` `value` `numberOfLines` `ellipsizeMode` `id` `nativeID`): https://plocks.dev/llms/components/Text.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export type HighlightValue = string | number;

export type HighlightStyles = StyleProp<TextStyle> | ((theme: PlocksTheme) => StyleProp<TextStyle>);
```

## Examples

### Basics

Default highlight behavior with a single search term. Matching fragments are wrapped with the theme-aware highlight styles.

```tsx
import { View } from 'react-native';
import { Highlight, Text } from '@plocks/ui';

const PARAGRAPH = 'Highlight This, definitely THIS and also this!';

export function Demo() {
  return (
    <View>
      <Text variant="h5">Case-insensitive match</Text>
      <Highlight highlight="this">{PARAGRAPH}</Highlight>
    </View>
  );
}
```

### Variants

Use semantic text variants without changing which phrase is highlighted.

```tsx
import { Column, Highlight, Text } from '@plocks/ui';

const variants = ['h4', 'p', 'small'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">{variant}</Text>
          <Highlight variant={variant} highlight="design">A design system for every screen.</Highlight>
        </Column>
      ))}
    </Column>
  );
}
```

### Multiple

Pass an array to highlight several distinct substrings. Every match shares the same styles by default.

```tsx
import { View } from 'react-native';
import { Highlight, Text } from '@plocks/ui';

const SENTENCE = 'plocks brings patterns, blocks, and building tools together.';

export function Demo() {
  return (
    <View>
      <Text variant="h5">Multiple values</Text>
      <Highlight highlight={['blocks', 'tools']}>{SENTENCE}</Highlight>
    </View>
  );
}
```

### Styles

Swap the marker color with the `highlightColor` prop, passing any theme palette name. The default marker style (yellow background, unchanged text) is preserved.

```tsx
import { Highlight, Text, Block } from '@plocks/ui';

const copy = 'You can switch the highlight color while keeping the default marker style.';

export function Demo() {
  return (
    <Block>
      <Text variant="h5">Highlight color</Text>
      <Highlight highlight="highlight" highlightColor="highlight">{copy}</Highlight>
      <Highlight highlight="color" highlightColor="teal">{copy}</Highlight>
      <Highlight highlight="marker" highlightColor="pink">{copy}</Highlight>
    </Block>
  );
}
```
