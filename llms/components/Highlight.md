# Highlight

Highlight emphasizes matching fragments inside longer strings, reusing the Text component so typography settings stay consistent across platforms.

## Metadata

- Canonical name: `Highlight`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Highlight } from '@platform-blocks/react-ui-library';`
- Category: typography
- Tags: text, emphasis, highlight, mark
- Docs: https://react-ui-library.com/components/Highlight
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Highlight

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `highlight` | HighlightValue \| HighlightValue[] | No |  | Substring or substrings to emphasize within the provided children |
| `highlightStyles` | any \| ((theme: PlatformBlocksTheme) => any) | No |  | Optional override for the highlighted segment styles. Accepts either a style object/array or a callback that receives the current theme and returns styles. |
| `highlightColor` | string | No |  | When provided, overrides the default highlight background/text palette. If the value matches a key from the theme color palettes it will use the related swatch, otherwise the value is treated as a raw color string. |
| `caseSensitive` | boolean | No |  | Toggle case-sensitive matching (defaults to case-insensitive). |
| `trim` | boolean | No |  | Trim highlight values before matching to ignore accidental whitespace. Defaults to true. |
| `highlightProps` | Partial<TextProps> | No |  | Additional props applied to the highlighted Text nodes. |

## Examples

### Basic
ID: `Highlight.basic` • Category: general

Default highlight behavior with a single search term. Matching fragments are wrapped with the theme-aware highlight styles.

```tsx
const PARAGRAPH = 'Highlight This, definitely THIS and also this!';
  return (
    <View>
      <Text variant="h5">Case-insensitive match</Text>
      <Highlight highlight="this">{PARAGRAPH}</Highlight>
    </View>
  );
}
```

### Multiple
ID: `Highlight.multiple` • Category: general

Pass an array to highlight several distinct substrings. Every match shares the same styles by default.

```tsx
const SENTENCE = 'React UI Library brings patterns, blocks, and building tools together.';
  return (
    <View>
      <Text variant="h5">Multiple values</Text>
      <Highlight highlight={['blocks', 'tools']}>{SENTENCE}</Highlight>
    </View>
  );
}
```

### Styles
ID: `Highlight.styles` • Category: general

Swap the marker color with the `highlightColor` prop, passing any theme palette name. The default marker style (yellow background, unchanged text) is preserved.

```tsx
const copy = 'You can switch the highlight color while keeping the default marker style.';
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
