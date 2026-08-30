# Text

Text component provides consistent typography with various variants, colors, and styling options for displaying content.

## Metadata

- Canonical name: `Text`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Text } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: typography
- Tags: text, typography, content, display
- Docs: https://react-ui-library.com/components/Text
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Text

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | No |  | Text node children. Optional if using translation via `tx`. |
| `tx` | string | No |  | Translation key (if provided, overrides children when found) |
| `txParams` | Record<string, any> | No |  | Params for translation interpolation |
| `variant` | HTMLTextVariant | No |  | Text variant (mirrors semantic HTML tags) |
| `size` | SizeValue | No |  | Size can be a size token or number (overrides variant fontSize) |
| `color` | string | No |  | Text color. Accepts a `theme.text` role (`'primary'`, `'secondary'`, `'muted'`, `'disabled'`, `'link'`), `'dimmed'` for the muted token, a palette name (`'success'` → its readable shade), `'primary.6'` shade syntax, or any CSS color string. |
| `c` | string | No |  | Shorthand alias for `color`, resolved identically. `color` wins when both are set. |
| `weight` | 'normal' \| 'medium' \| 'semibold' \| 'bold' \| 'light' \| 'black' \| '100' \| '200' \| '300' \| '400' \| '500' \| '600' \| '700' \| '800' \| '900' \| number | No |  | Font weight (supports all CSS font-weight values) |
| `align` | 'left' \| 'center' \| 'right' \| 'justify' | No |  | Text alignment |
| `lineHeight` | number | No |  | Line height as a multiplier (e.g., 1.5) or absolute value |
| `tracking` | number | No |  | Letter spacing (tracking) in pixels or em units |
| `uppercase` | boolean | No |  | Convert text to uppercase |
| `style` | any | No |  | Additional styles (overrides computed styles) |
| `fontFamily` | string | No |  | Custom font family (overrides theme font) |
| `ff` | string | No |  | Shorthand alias for `fontFamily` |
| `as` | HTMLTextVariant | No |  | For platform-specific rendering on web |
| `selectable` | boolean | No |  | Whether text is selectable (default: true) |
| `onPress` | () => void | No |  | Called when text is pressed |
| `onLayout` | (event: any) => void | No |  | Called when the text layout is calculated |
| `value` | string \| number | No |  | Value to display (overrides children, useful for numbers) |
| `numberOfLines` | RNTextProps['numberOfLines'] | No |  | Maximum number of lines to display (native + web) |
| `ellipsizeMode` | RNTextProps['ellipsizeMode'] | No |  | Ellipsis strategy when text exceeds available space |
| `id` | string | No |  | Element id. On web this is the DOM `id` — headings need one to be a link target. |
| `nativeID` | string | No |  | React Native alias for `id`; used when the two platforms need different values. |
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

### Basic Usage
ID: `Text.basic` • Tags: basic, typography • Category: usage • Status: stable • Since: 1.0.0

Basic text usage with different variants and semantic elements.

```tsx
return (
    <Block>
      <Card p="md">
        <Block>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="h4">Heading 4</Text>
          <Text variant="h5">Heading 5</Text>
          <Text variant="h6">Heading 6</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p">Body text is the default variant for paragraphs.</Text>
          <Text variant="small">Caption text keeps supporting details readable.</Text>
          <Text variant="small">Small text works well for fine print or metadata.</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text>Default text without a variant falls back to body styling.</Text>
          <Text>
            This paragraph shows natural wrapping behavior when the content spans multiple lines in a layout.
          </Text>
        </Block>
      </Card>
    </Block>
  );
}
```

### Colors
ID: `Text.colors` • Tags: colors, theming • Category: usage • Status: stable • Since: 1.0.0

Text color variants and custom color options for different contexts.

```tsx
return (
    <Block>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Semantic colors
          </Text>
          <Text color="primary">Primary color text</Text>
          <Text color="secondary">Secondary color text</Text>
          <Text color="muted">Muted color text</Text>
          <Text color="disabled">Disabled color text</Text>
          <Text color="link">Link color text</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Custom palette
          </Text>
          <Text color="#ff6b6b">Custom red text</Text>
          <Text color="#4ecdc4">Custom teal text</Text>
          <Text color="#45b7d1">Custom blue text</Text>
          <Text color="#96ceb4">Custom green text</Text>
          <Text color="#feca57">Custom yellow text</Text>
        </Block>
      </Card>
    </Block>
  );
}
```

### c (color shorthand)
ID: `Text.c-shorthand` • Tags: c, color, shorthand, theme • Category: general • Status: stable • Since: 1.0.0

`c` is a shorthand for `color` that resolves through the theme. Accepts: - `'dimmed'` → maps to `theme.text.muted` - Theme text keys (`'primary'`, `'secondary'`, `'muted'`, `'disabled'`, `'link'`) - Palette names (`'primary'`, `'success'`, …) → palette shade-6 (readable text) - `'palette.shade'` syntax (`'primary.6'`) - Any CSS color string

```tsx
return (
    <Block>
      <Text weight="semibold">c (color shorthand)</Text>
      <Text c="dimmed">c="dimmed" — maps to theme.text.muted</Text>
      <Text c="primary">c="primary" — primary palette text shade</Text>
      <Text c="error">c="error" — error palette readable shade</Text>
      <Text c="success">c="success"</Text>
      <Text c="primary.5">c="primary.5" — explicit shade</Text>
      <Text c="error.7">c="error.7" — darker error</Text>
      <Text c="#a855f7">c="#a855f7" — raw CSS color</Text>
      <Text>
        Inline composition:{' '}
        <Text c="dimmed">subtle inline text</Text> next to{' '}
        <Text c="primary" weight="600">brand text</Text>.
      </Text>
    </Block>
  );
}
```

### Weights
ID: `Text.weights` • Tags: weights, typography • Category: usage • Status: stable • Since: 1.0.0

Different font weight options from light to bold.

```tsx
return (
    <Block>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Named weights
          </Text>
          <Text weight="light">Light weight text</Text>
          <Text weight="normal">Normal weight text (default)</Text>
          <Text weight="medium">Medium weight text</Text>
          <Text weight="semibold">Semibold weight text</Text>
          <Text weight="bold">Bold weight text</Text>
          <Text weight="black">Black weight text</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Numeric weights
          </Text>
          <Text weight="100">Weight 100 (Thin)</Text>
          <Text weight="300">Weight 300 (Light)</Text>
          <Text weight="400">Weight 400 (Normal)</Text>
          <Text weight="600">Weight 600 (Semibold)</Text>
          <Text weight="700">Weight 700 (Bold)</Text>
          <Text weight="900">Weight 900 (Black)</Text>
        </Block>
      </Card>
    </Block>
  );
}
```

### Font family (ff shorthand)
ID: `Text.ff` • Tags: font, fontFamily, ff, typography • Category: usage • Status: stable • Since: 1.0.0

`ff` is the shorthand alias for `fontFamily`. Both forms work; `ff` wins when both are set. The same alias is also accepted by Title, the H1–H6 / Code / Kbd / Bold / Italic aliases, Highlight, GradientText, ShimmerText, and the field components via `labelProps` / `descriptionProps` / `disclaimerProps`.

```tsx
return (
    <Block>
      <Text weight="semibold">ff (font family) shorthand</Text>
      <Block>
        <Text size="sm" color="muted">Default theme font (no override)</Text>
        <Text>The quick brown fox jumps over the lazy dog</Text>
      </Block>
      <Block>
        <Text size="sm" color="muted">ff="monospace"</Text>
        <Text ff="monospace">The quick brown fox jumps over the lazy dog</Text>
      </Block>
      <Block>
        <Text size="sm" color="muted">ff="Georgia, serif" — also works on Title aliases</Text>
        <H3 ff="Georgia, serif">Heading in Georgia</H3>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          fontFamily still works (ff takes precedence when both are set)
        </Text>
        <Text fontFamily="Courier New">Inline using `fontFamily` — long form</Text>
        <Text ff="Georgia" fontFamily="Courier New">
          Both set: `ff="Georgia"` wins
        </Text>
      </Block>
      <Block>
        <Text size="sm" color="muted">Inline Code/Kbd inherit ff too</Text>
        <Text>
          Press <Code ff="ui-monospace, monospace">cmd+k</Code> to open spotlight
        </Text>
      </Block>
    </Block>
  );
}
```

### Sizes
ID: `Text.sizes` • Tags: sizes, scale • Category: usage • Status: stable • Since: 1.0.0

Different text sizes from small to large.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Text size={size}>Aa</Text>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Heights
ID: `Text.heights` • Tags: line-height, spacing • Category: usage • Status: stable • Since: 1.0.0

Line height control for text content using the `lineHeight` prop. ## Usage The `lineHeight` prop accepts: - **Multipliers** (e.g., `1.5`) - multiplied by the font size - **Absolute values** (e.g., `24`) - treated as pixel values when > 3 ```tsx <Text lineHeight={1.2}>Tight line height</Text> <Text lineHeight={1.5}>Normal line height</Text> <Text lineHeight={24}>Absolute line height (24px)</Text> ``` This provides precise control over text spacing and readability.

```tsx
const SAMPLE_TEXT =
  'This paragraph shows how line height changes the spacing between lines of text when content wraps across multiple lines.';
  return (
    <Card p="md">
      <Block>
        <Block>
          <Text variant="p" weight="medium">
            Tight line height (1.2)
          </Text>
          <Text lineHeight={1.2}>{SAMPLE_TEXT}</Text>
        </Block>
        <Block>
          <Text variant="p" weight="medium">
            Standard line height (1.5)
          </Text>
          <Text lineHeight={1.5}>{SAMPLE_TEXT}</Text>
        </Block>
        <Block>
          <Text variant="p" weight="medium">
            Relaxed line height (1.8)
          </Text>
          <Text lineHeight={1.8}>{SAMPLE_TEXT}</Text>
        </Block>
        <Block>
          <Text variant="p" weight="medium">
            Loose line height (2.0)
          </Text>
          <Text lineHeight={2}>{SAMPLE_TEXT}</Text>
        </Block>
        <Block>
          <Text variant="p" weight="medium">
            Absolute line height (24px)
          </Text>
          <Text lineHeight={24}>{SAMPLE_TEXT}</Text>
        </Block>
      </Block>
    </Card>
  );
}
```

### Tracking
ID: `Text.tracking` • Tags: tracking, letter-spacing • Category: styling • Status: stable • Since: 1.0.0

Use the `tracking` prop to adjust letter spacing for text. Negative values tighten spacing, positive values loosen it, and numeric tokens work alongside size and variant changes. - Combine tracking with different `size` values to balance compact and spacious typography. - Headings can use subtle negative tracking for denser compositions. - Uppercase text often benefits from wider tracking to maintain legibility.

```tsx
return (
    <Block>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Negative tracking (tighter)
          </Text>
          <Text tracking={-1}>This text uses -1px letter spacing.</Text>
          <Text tracking={-0.5}>This text uses -0.5px letter spacing.</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Default tracking
          </Text>
          <Text>This text keeps the default letter spacing.</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Positive tracking (looser)
          </Text>
          <Text tracking={0.5}>This text uses 0.5px letter spacing.</Text>
          <Text tracking={1}>This text uses 1px letter spacing.</Text>
          <Text tracking={2}>This text uses 2px letter spacing.</Text>
          <Text tracking={4}>This text uses 4px letter spacing.</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Different sizes with tracking
          </Text>
          <Text size="xs" tracking={1}>Extra small with 1px tracking.</Text>
          <Text size="sm" tracking={1}>Small with 1px tracking.</Text>
          <Text size="md" tracking={1}>Medium with 1px tracking.</Text>
          <Text size="lg" tracking={1}>Large with 1px tracking.</Text>
          <Text size="xl" tracking={2}>Extra large with 2px tracking.</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Headings with tracking
          </Text>
          <Text variant="h1" tracking={-1}>H1 heading with -1px tracking</Text>
          <Text variant="h2" tracking={0}>H2 heading with default tracking</Text>
          <Text variant="h3" tracking={1}>H3 heading with 1px tracking</Text>
        </Block>
      </Card>
      <Card p="md">
        <Block>
          <Text variant="p" weight="medium">
            Uppercase spacing
          </Text>
          <Text weight="bold" tracking={3} uppercase>
            Uppercase text with wide tracking
          </Text>
        </Block>
      </Card>
    </Block>
  );
}
```
