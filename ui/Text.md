# Text

Render typography with various variants, colors, and styling options for displaying content.

## Metadata

- Import: `import { Text } from '@plocks/ui';`
- Tags: text, typography, content, display
- Docs: https://plocks.dev/components/Text
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Text

## Props

- `children`: React.ReactNode — Text node children. Optional if using translation via `tx`.
- `tx`: string — Translation key (if provided, overrides children when found)
- `txParams`: Record<string, unknown> — Params for translation interpolation
- `variant`: HTMLTextVariant — Text variant (mirrors semantic HTML tags). `h1`–`h6` are exposed to assistive technology as headings (web: the `<h1>`–`<h6>` element; native: `role="heading"`).
- `textRole`: TextRoleName | (string & {}) — A theme text role (`theme.textRoles`) — `'panelTitle'` for the title of a panel that holds a list, `'sectionLabel'` for a group header inside one, or a role your theme adds. Supplies color, size, weight, tracking and case; `c`, `size`, `fw`, `lts` and `tt` still win over it. Typography only: pair it with `role="heading"` etc. where that applies.
- `size`: SizeValue — Size can be a size token or number (overrides variant fontSize)
- `c`: string — Text color. Accepts a `theme.text` role (`'primary'`, `'secondary'`, `'muted'`, `'disabled'`, `'link'`), a palette name (`'success'` → its readable shade), `'primary.6'` shade syntax, or any CSS color string.
- `fw`: TextWeight — Font weight (supports all CSS font-weight values)
- `ta`: 'left' | 'center' | 'right' | 'justify' — Text alignment. `left` / `right` follow React Native semantics and mirror in right-to-left layouts (web: `start` / `end`).
- `lh`: number — Line height as a multiplier (e.g., 1.5) or absolute value (> 3)
- `lts`: number — Letter spacing (tracking) in pixels
- `tt`: TextStyle['textTransform'] — Text transform: `'uppercase'`, `'lowercase'`, `'capitalize'`, or `'none'` (which also undoes a text role's case).
- `fs`: TextStyle['fontStyle'] — Font style: `'italic'` or `'normal'` (which also undoes the italic of `i` / `em` / `cite`).
- `td`: TextStyle['textDecorationLine'] — Text decoration: `'underline'`, `'line-through'`, `'underline line-through'`, or `'none'`.
- `ff`: string — Custom font family (overrides theme font)
- `flex`: number — Flex factor when text shares a row with controls.
- `shrink`: number
- `position`: 'relative' | 'absolute'
- `top`: TextStyle['top']
- `right`: TextStyle['right']
- `bottom`: TextStyle['bottom']
- `left`: TextStyle['left']
- `as`: HTMLTextVariant — Element to render on web (defaults to `variant`); also decides heading semantics.
- `selectable`: boolean — Whether text is selectable (default: true)
- `onPress`: () => void — Called when text is pressed. Pressable text is exposed as a button (pass `role="link"` for navigation) and, on web, is focusable and activates with Enter (and Space for buttons).
- `onLayout`: (event: LayoutChangeEvent) => void — Called when the text layout is calculated
- `value`: string | number — Value to display (overrides children, useful for numbers)
- `numberOfLines`: RNTextProps['numberOfLines'] — Maximum number of lines to display (native + web)
- `ellipsizeMode`: RNTextProps['ellipsizeMode'] — Ellipsis strategy when text exceeds available space
- `id`: string — Element id. On web this is the DOM `id` — headings need one to be a link target.
- `nativeID`: string — React Native alias for `id`; used when the two platforms need different values.
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

`import { H1, H2, H3, H4, H5, H6, P, Small, Strong, Bold, Italic, Emphasis, Underline, Code, Kbd, Mark, Cite, Sub, Sup } from '@plocks/ui';`

`H1`, `H2`, `H3`, `H4`, `H5`, `H6`, `P`, `Small`, `Strong`, `Bold`, `Italic`, `Emphasis`, `Underline`, `Code`, `Kbd`, `Mark`, `Cite`, `Sub`, `Sup` have no props interface of their own.

## Types

```ts
export type HTMLTextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div'
  | 'small' | 'caption' | 'strong' | 'b' | 'i' | 'em' | 'u'
  | 'sub' | 'sup' | 'mark' | 'code' | 'kbd'
  | 'blockquote' | 'cite';

export type TextWeight =
  | 'normal' | 'medium' | 'semibold' | 'bold' | 'light' | 'black'
  | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  | number;
```

## Examples

### Basics

Various different variants and semantic elements.

```tsx
import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
      <Text variant="h5">Heading 5</Text>
      <Text variant="h6">Heading 6</Text>
      <Text>The quick brown fox jumps over the lazy dog.</Text>
      <Text variant="small">The quick brown fox jumps over the lazy dog.</Text>
    </Block>
  );
}
```

### Colors

Set `c` to a theme text role (`primary`, `secondary`, `muted`, `disabled`, `link`), a palette color or shade (`success`, `error.7`), or any CSS color.

```tsx
import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block gap="lg">
      <Block>
        <Text c="primary">primary</Text>
        <Text c="secondary">secondary</Text>
        <Text c="muted">muted</Text>
        <Text c="disabled">disabled</Text>
        <Text c="link">link</Text>
      </Block>
      <Block>
        <Text c="success">success</Text>
        <Text c="error">error</Text>
        <Text c="primary.5">primary.5</Text>
        <Text c="error.7">error.7</Text>
      </Block>
      <Block>
        <Text c="#ff6b6b">#ff6b6b</Text>
        <Text c="#4ecdc4">#4ecdc4</Text>
        <Text c="#45b7d1">#45b7d1</Text>
        <Text c="#96ceb4">#96ceb4</Text>
        <Text c="#feca57">#feca57</Text>
      </Block>
    </Block>
  );
}
```

### Variants

Compare heading, paragraph, quotation, code, and small text variants.

```tsx
import { Column, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Column gap="md">
      <Text variant="h2">Section heading</Text>
      <Text variant="p">A paragraph uses the body text role.</Text>
      <Text variant="blockquote">A quotation gets its own semantic element.</Text>
      <Text variant="code">const label = 'inline code';</Text>
      <Text variant="small">Supporting text uses the small role.</Text>
    </Column>
  );
}
```

### Weights

Set the font weight with `fw`: a named weight (`light` → `black`) or a numeric one (`100` → `900`).

```tsx
import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block gap="lg">
      <Block>
        <Text fw="light">light</Text>
        <Text fw="normal">normal</Text>
        <Text fw="medium">medium</Text>
        <Text fw="semibold">semibold</Text>
        <Text fw="bold">bold</Text>
        <Text fw="black">black</Text>
      </Block>
      <Block>
        <Text fw="100">100</Text>
        <Text fw="300">300</Text>
        <Text fw="400">400</Text>
        <Text fw="600">600</Text>
        <Text fw="700">700</Text>
        <Text fw="900">900</Text>
      </Block>
    </Block>
  );
}
```

### Font family

`ff` sets the font family. Title, Highlight, the H1–H6 / Code / Kbd / Bold / Italic aliases, GradientText, ShimmerText, and every `<Text>` slot prop (`labelProps`, `descriptionProps`, …) take it too.

```tsx
import { Block, H3, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Text ff="monospace">monospace</Text>
      <Text ff="Courier New">Courier New</Text>
      <H3 ff="Georgia, serif">Heading in Georgia</H3>
    </Block>
  );
}
```

### Sizes

Different text sizes from small to large.

```tsx
import { Block, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
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

Set line height with `lh`. ## Usage `lh` accepts: - **Multipliers** (e.g., `1.5`) - multiplied by the font size - **Absolute values** (e.g., `24`) - treated as pixel values when > 3 ```tsx <Text lh={1.2}>Tight line height</Text> <Text lh={1.5}>Normal line height</Text> <Text lh={24}>Absolute line height (24px)</Text> ``` This provides precise control over text spacing and readability.

```tsx
import { Block, Text } from '@plocks/ui';

const LINE_HEIGHTS = [1.2, 1.5, 1.8, 2, 24];

const SAMPLE_TEXT =
  'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz, judge my vow. How vexingly quick daft zebras jump.';

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      {LINE_HEIGHTS.map((lineHeight) => (
        <Block key={lineHeight}>
          <Text variant="small" c="secondary">{lineHeight}</Text>
          <Text lh={lineHeight}>{SAMPLE_TEXT}</Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Tracking

Set letter spacing in pixels with `lts`. Negative values tighten spacing and positive values loosen it.

```tsx
import { Block, Text } from '@plocks/ui';

const TRACKING = [-1, -0.5, 0, 0.5, 1, 2, 4];

export function Demo() {
  return (
    <Block>
      {TRACKING.map((tracking) => (
        <Text key={tracking} lts={tracking}>
          Tracking {tracking}
        </Text>
      ))}
    </Block>
  );
}
```

### Text transform

Set `tt` to `uppercase`, `lowercase`, or `capitalize` to change the case of text without changing the string. `none` turns off the case a text role applies.

```tsx
import { Block, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Text tt="uppercase">uppercase</Text>
      <Text tt="lowercase">LOWERCASE</Text>
      <Text tt="capitalize">capitalize each word</Text>
    </Block>
  );
}
```

### Style and decoration

`fs` sets the font style (`italic`, `normal`) and `td` the decoration (`underline`, `line-through`, `none`). Both override the aliases that set them, so `<Italic fs="normal">` renders upright.

```tsx
import { Block, Italic, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Text fs="italic">italic</Text>
      <Text td="underline">underline</Text>
      <Text td="line-through">line-through</Text>
      <Italic fs="normal">Italic, set upright</Italic>
    </Block>
  );
}
```
