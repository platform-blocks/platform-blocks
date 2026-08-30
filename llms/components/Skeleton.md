# Skeleton

Skeleton components provide visual placeholders for text, avatars, and blocks to reduce perceived loading time.

## Metadata

- Canonical name: `Skeleton`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Skeleton } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: feedback
- Tags: loading, placeholder, skeleton
- Docs: https://react-ui-library.com/components/Skeleton
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Skeleton

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `shape` | SkeletonShape | No | 'rectangle' | Shape of the skeleton placeholder |
| `w` | DimensionValue | No |  | Width of the skeleton component |
| `h` | DimensionValue | No |  | Height of the skeleton component |
| `size` | SizeValue | No | 'md' | Size of the skeleton component (overrides width/height) |
| `radius` | SizeValue \| number | No |  | Border radius for rectangle/rounded shapes |
| `animate` | boolean | No | true | Whether to show the loading animation |
| `animationDuration` | number | No | 1500 | Duration of the loading animation in milliseconds |
| `colors` | [string, string] | No |  | Gradient colors for the shimmer effect |
| `style` | StyleProp<ViewStyle> | No |  | Style overrides for the skeleton container |
| `testID` | string | No |  | Optional test identifier |
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

### Basics
ID: `Skeleton.basic` • Tags: loading, placeholder • Category: basics • Status: stable • Since: 1.0.0

Stack text, avatar, and block placeholders to preview the structure of incoming content while data loads.

```tsx
return (
    <Block>
      <Skeleton shape="text" w="60%" />
      <Skeleton shape="text" w="80%" />
      <Skeleton shape="text" w="40%" />
      <Row gap="md" align="center">
        <Skeleton shape="avatar" size="lg" />
        <Block grow={1}>
          <Skeleton shape="text" w="40%" />
          <Skeleton shape="text" w="60%" />
        </Block>
      </Row>
      <Skeleton shape="rectangle" h={120} />
      <Skeleton shape="button" w={120} />
    </Block>
  );
}
```

### Shapes
ID: `Skeleton.shapes` • Tags: avatar, text, button • Category: features • Status: stable • Since: 1.0.0

Preview the available skeleton shapes for avatars, typography lines, actions, and media blocks.

```tsx
return (
    <Block>
      <Row gap="lg" align="center" wrap="wrap">
        <Skeleton shape="avatar" size="sm" />
        <Skeleton shape="avatar" size="md" />
        <Skeleton shape="avatar" size="lg" />
        <Skeleton shape="avatar" size="xl" />
      </Row>
      <Block>
        <Skeleton shape="text" w="100%" />
        <Skeleton shape="text" w="90%" />
        <Skeleton shape="text" w="70%" />
      </Block>
      <Row gap="md" wrap="wrap">
        <Skeleton shape="button" w={80} />
        <Skeleton shape="button" w={100} />
        <Skeleton shape="button" w={120} />
      </Row>
      <Row gap="sm" wrap="wrap">
        <Skeleton shape="chip" />
        <Skeleton shape="chip" />
        <Skeleton shape="chip" />
      </Row>
      <Skeleton shape="rectangle" h={60} />
      <Skeleton shape="card" h={200} />
    </Block>
  );
}
```

### Card Layout
ID: `Skeleton.card` • Tags: card, layout • Category: composition • Status: stable • Since: 1.0.0

Combine avatar, text, and action placeholders to preview a rich card layout ahead of remote content.

```tsx
const theme = useTheme();
  return (
    <Block
      p="lg"
      radius="lg"
      borderWidth={1}
      borderColor={theme.backgrounds.border}
      bg={theme.backgrounds.surface}
    >
      <Block>
        <Row gap="md" align="center">
          <Skeleton shape="avatar" size="lg" />
          <Block grow={1}>
            <Skeleton shape="text" w="32%" />
            <Skeleton shape="text" w="48%" />
          </Block>
        </Row>
        <Skeleton shape="rectangle" h={120} />
        <Block>
          <Skeleton shape="text" w="100%" />
          <Skeleton shape="text" w="78%" />
        </Block>
        <Row gap="sm" wrap="wrap">
          <Skeleton shape="chip" />
          <Skeleton shape="chip" />
          <Skeleton shape="chip" />
        </Row>
      </Block>
    </Block>
  );
}
```
