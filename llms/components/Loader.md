# Loader

A animated loading component for indicating ongoing processes and loading states with various sizes and styles.

## Metadata

- Import: `import { Loader } from '@plocks/ui';`
- Tags: loader, loading, progress, indicator, animation
- Docs: https://plocks.dev/components/Loader
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Loader

## Props

- `size`: SizeValue = 'md' — Size of the loader - can be a size token (the icon scale) or number
- `color`: ThemeColor — Color of the loader: palette token, `'primary.6'` shade syntax, or any CSS color.
- `variant`: 'bars' | 'dots' | 'oval' = 'oval' — Variant of the loader
- `speed`: number = 1000 — Duration of one animation cycle in milliseconds
- `accessibilityLabel`: string = 'Loading' — Accessible name of the busy indicator (`role="progressbar"`, `aria-busy`).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Pick a loader `variant` to match the type of busy indicator you need for a loading state.

```tsx
import { Loader, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="lg" align="center">
      <Loader variant="oval" />
      <Loader variant="bars" />
      <Loader variant="dots" />
    </Row>
  );
}
```

### Sizes

Set the `size` token to align loaders with other controls, from `xs` indicators up to `3xl` spinners.

```tsx
import { Block, Loader, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Loader size={size} />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Variants

Compare the oval, bars, and dots loading animations.

```tsx
import { Column, Loader, Row, Text } from '@plocks/ui';

const variants = ['oval', 'bars', 'dots'] as const;

export function Demo() {
  return (
    <Row gap="xl" align="center" wrap="wrap">
      {variants.map(variant => (
        <Column key={variant} gap="xs" align="center">
          <Loader variant={variant} />
          <Text size="sm">{variant}</Text>
        </Column>
      ))}
    </Row>
  );
}
```

### Colors

Pull palette values from `useTheme()` and pass them to the `color` prop to align loaders with your semantic colors.

```tsx
import { Block, Loader, Row, Text, useTheme } from '@plocks/ui';

interface LoaderSwatch {
  label: string;
  color: string;
}

export function Demo() {
  const theme = useTheme();

  const swatches: LoaderSwatch[] = [
    { label: 'Primary', color: theme.colors.primary[5] },
    { label: 'Success', color: theme.colors.success[5] },
    { label: 'Warning', color: theme.colors.warning[5] },
    { label: 'Error', color: theme.colors.error[5] }
  ];

  return (
    <Block>
      {swatches.map(({ label, color }) => (
        <Row key={label} gap="md" align="center">
          <Block miw={88}>
            <Text variant="small" c="muted">
              {label}
            </Text>
          </Block>
          <Loader variant="oval" color={color} />
          <Loader variant="bars" color={color} />
          <Loader variant="dots" color={color} />
        </Row>
      ))}
    </Block>
  );
}
```

### Speed

```tsx
import { Block, Loader, Row, Text } from '@plocks/ui';

// `speed` is the duration of one full animation cycle in milliseconds —
// lower is faster. Default is 1000ms.
const SPEEDS = [
  { label: 'Fast', value: 400 },
  { label: 'Default', value: 1000 },
  { label: 'Slow', value: 2000 },
];

export function Demo() {
  return (
    <Block>
      {SPEEDS.map(({ label, value }) => (
        <Row key={value} gap="lg" align="center">
          <Block miw={96}>
            <Text variant="small" fw="semibold">
              {label}
            </Text>
            <Text variant="small" c="muted">
              {value}ms
            </Text>
          </Block>
          <Loader variant="oval" size="lg" speed={value} />
          <Loader variant="bars" size="lg" speed={value} />
          <Loader variant="dots" size="lg" speed={value} />
        </Row>
      ))}
    </Block>
  );
}
```
