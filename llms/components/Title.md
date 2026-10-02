# Title

Semantic heading component mapping `order={1..6}` to typography variants `h1..h6` while offering decorative enhancements like underline, afterline, and prefix adornments.

## Metadata

- Import: `import { Title } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/Title
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Title

## Props

- `text`: string — The text content to display in the title
- `order`: 1 | 2 | 3 | 4 | 5 | 6 — The heading level (1-6): the level exposed to assistive technology (web `<hN>`, native `role="heading"`) and the default typography.
- `underline`: boolean — Whether to show an underline decoration below the title
- `afterline`: boolean — Whether to show a line after the title text
- `underlineColor`: string — Color of the underline decoration
- `underlineStroke`: number — Thickness/stroke width of the underline in pixels
- `afterlineGap`: number — Gap between the title text and afterline in pixels
- `underlineOffset`: number — Vertical offset of the underline from the text baseline in pixels
- `prefix`: boolean | React.ReactNode — Prefix decoration - can be a boolean to show default prefix or a custom React element
- `prefixVariant`: 'bar' | 'dot' — Style variant for the default prefix decoration
- `prefixColor`: string — Color of the prefix decoration
- `prefixSize`: number — Size of the prefix decoration in pixels
- `prefixLength`: number — Length of the prefix decoration (for bar variant) in pixels
- `prefixGap`: number — Gap between the prefix and title text in pixels
- `prefixRadius`: number — Border radius of the prefix decoration in pixels
- `style`: StyleProp<TextStyle> — Additional styles to apply to the title text element
- `variant`: TextProps['variant'] — Typography variant for the text. Defaults to the `h<order>` variant; only changes the look — the heading level still follows `order`.
- `containerStyle`: StyleProp<ViewStyle> — Additional styles to apply to the container wrapping the entire title
- `startIcon`: React.ReactNode — Icon element to display on the left side of the title
- `endIcon`: React.ReactNode — Icon element to display on the right side of the title
- `action`: React.ReactNode — Action button or element positioned at the far right of the title
- `subtitle`: React.ReactNode — Optional subtitle displayed below the title
- `subtitleProps`: Partial<TextProps> — Additional Text props applied to the subtitle when rendered as Text
- `subtitleSpacing`: number — Spacing between the title and subtitle in pixels (default: 8)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Text` props (`children` `tx` `txParams` `textRole` `size` `c` `fw` `ta` `lh` `lts` `tt` `fs` `td` `ff` `flex` `shrink` `position` `top` `right` `bottom` `left` `as` `selectable` `onPress` `onLayout` `value` `numberOfLines` `ellipsizeMode` `id` `nativeID`): https://plocks.dev/llms/components/Text.md

Also accepts the shared props — base (`testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { Heading1, Heading2, Heading3, Heading4, Heading5, Heading6 } from '@plocks/ui';`

`Heading1`, `Heading2`, `Heading3`, `Heading4`, `Heading5`, `Heading6` have no props interface of their own.

## Examples

### Basics

Default Title usage shows the h2-style heading produced by the component without additional props.

```tsx
import { Block, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title>Default section heading</Title>
    </Block>
  );
}
```

### Heading Levels

Set the `order` prop to align Title with semantic heading levels from h1 through h6.

```tsx
import { Block, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title order={1}>Page heading (order=1)</Title>
      <Title order={2}>Section heading (order=2)</Title>
      <Title order={3}>Subsection heading (order=3)</Title>
      <Title order={4}>Fourth-level heading (order=4)</Title>
      <Title order={5}>Fifth-level heading (order=5)</Title>
      <Title order={6}>Sixth-level heading (order=6)</Title>
    </Block>
  );
}
```

### Variants

Keep heading level three while changing its typography with the variant prop.

```tsx
import { Column, Text, Title } from '@plocks/ui';

const variants = ['h2', 'h3', 'h4'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">order=3 · variant={variant}</Text>
          <Title order={3} variant={variant}>Section title</Title>
        </Column>
      ))}
    </Column>
  );
}
```

### Prefix Styles

Enable the `prefix` prop to add visual markers, switching variants or supplying a custom icon for emphasis.

```tsx
import { Block, Icon, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title prefix>Default bar prefix</Title>
      <Title prefix prefixVariant="dot">Dot prefix</Title>
      <Title prefix prefixSize={6} prefixLength={40} prefixColor="#6366f1">
        Custom bar size and color
      </Title>
      <Title prefix={<Icon name="star" />} prefixGap={8} prefixColor="#f59e0b">
        Icon prefix with custom color
      </Title>
    </Block>
  );
}
```

### Underlines

Toggle `underline` and `afterline` to add emphasis and separation, including custom color and stroke weights.

```tsx
import { Block, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title underline>Underline only</Title>
      <Title afterline>Afterline only</Title>
      <Title underline afterline>Underline with afterline</Title>
      <Title underline underlineColor="#ff4d4f" underlineStroke={4}>
        Custom underline color and stroke
      </Title>
    </Block>
  );
}
```

### Actions

Pass an `action` element to align buttons or toggles alongside the heading.

```tsx
import { Block, Button, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title action={<Button title="Edit" size="sm" variant="outline" />}>Profile</Title>
    </Block>
  );
}
```

### Combined Accents

Mix prefix, underline, and afterline props to create a primary heading and aligned subsection titles with consistent accents.

```tsx
import { Block, Title } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Title
        prefix
        underline
        afterline
        prefixSize={6}
        prefixLength={48}
        prefixColor="#10b981"
        underlineStroke={3}
      >
        Analytics overview
      </Title>
      <Title
        order={3}
        prefix
        prefixVariant="dot"
        prefixColor="#ef4444"
        underline
        underlineColor="#ef4444"
      >
        Active users
      </Title>
      <Title
        order={3}
        prefix
        prefixVariant="dot"
        prefixColor="#6366f1"
        underline
        underlineColor="#6366f1"
      >
        Conversion rate
      </Title>
    </Block>
  );
}
```
