# Loader

A animated loading component for indicating ongoing processes and loading states with various sizes and styles.

## Metadata

- Canonical name: `Loader`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Loader } from '@platform-blocks/react-ui-library';`
- Category: feedback
- Tags: loader, loading, progress, indicator, animation
- Docs: https://react-ui-library.com/components/Loader
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Loader

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | SizeValue | No | 'md' | Size of the loader - can be a size token or number |
| `color` | string | No |  | Color of the loader |
| `variant` | LoaderVariant | No | 'oval' | Variant of the loader |
| `speed` | number | No | 1000 | Animation speed in milliseconds |
| `style` | StyleProp<ViewStyle> | No |  | Container style |
| `testID` | string | No |  | Test ID for testing |
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
ID: `Loader.basic` • Tags: variant • Category: basics • Status: stable • Since: 1.0.0

Pick a loader `variant` to match the type of busy indicator you need for a loading state.

```tsx
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
ID: `Loader.sizes` • Tags: size • Category: layout • Status: stable • Since: 1.0.0

Set the `size` token to align loaders with other controls, from `xs` indicators up to `3xl` spinners.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
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

### Colors
ID: `Loader.colors` • Tags: color, theme • Category: theming • Status: stable • Since: 1.0.0

Pull palette values from `useTheme()` and pass them to the `color` prop to align loaders with your semantic colors.

```tsx
interface LoaderSwatch {
  label: string;
  color: string;
}
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
          <Block minW={88}>
            <Text variant="small" color="muted">
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
ID: `Loader.speed` • Category: general

```tsx
// `speed` is the duration of one full animation cycle in milliseconds —
// lower is faster. Default is 1000ms.
const SPEEDS = [
  { label: 'Fast', value: 400 },
  { label: 'Default', value: 1000 },
  { label: 'Slow', value: 2000 },
];
  return (
    <Block>
      {SPEEDS.map(({ label, value }) => (
        <Row key={value} gap="lg" align="center">
          <Block minW={96}>
            <Text variant="small" weight="semibold">
              {label}
            </Text>
            <Text variant="small" color="muted">
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
