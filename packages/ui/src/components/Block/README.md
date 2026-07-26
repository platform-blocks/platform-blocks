# Block Component

A polymorphic building block component that serves as a foundational element to replace `View` components throughout the application.

## Features

- **Polymorphic**: Can render as any HTML element or React component
- **Spacing System**: Supports margin and padding shorthand props (`m`, `p`, `mx`, `py`, etc.)
- **Layout Utilities**: Flexbox, positioning, and dimension controls
- **Theming**: Consistent radius, shadow, and color values
- **Accessibility**: Full accessibility prop support
- **Performance**: Optimized style generation and prop extraction

## Usage

### Basic Usage

```tsx
import { Block } from '@platform-blocks/ui';

// Simple container
<Block bg="blue.500" p="md" radius="lg">
  Content goes here
</Block>

// With spacing shorthand
<Block mx="auto" py="xl" px="lg">
  Centered content with custom padding
</Block>
```

### Polymorphic Usage

```tsx
// Render as a button
<Block component="button" bg="green.500" p="sm" radius="md">
  Click me
</Block>

// Render as a custom component
<Block component={MyCustomComponent} w="full" h={200}>
  Custom component content
</Block>
```

### Flexbox Layout

```tsx
// Flex container
<Block direction="row" justify="space-between" align="center" gap="md">
  <Block>Item 1</Block>
  <Block>Item 2</Block>
  <Block>Item 3</Block>
</Block>

// Responsive grid-like layout
<Block direction="row" wrap="wrap" gap="sm">
  <Block basis="50%" minW={200}>Item 1</Block>
  <Block basis="50%" minW={200}>Item 2</Block>
</Block>
```

### Advanced Styling

```tsx
<Block
  bg="white"
  shadow="lg"
  radius="xl"
  borderWidth={1}
  borderColor="gray.200"
  p="lg"
  position="relative"
>
  Card-like content
</Block>
```

## Props

### Core Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | Child elements |
| `component` | `React.ElementType` | Component to render as (default: 'div') |
| `style` | `ViewStyle` | Custom style object |

### Spacing Props

| Prop | Type | Description |
|------|------|-------------|
| `m` | `SizeValue` | All margins |
| `mx` | `SizeValue` | Horizontal margins |
| `my` | `SizeValue` | Vertical margins |
| `mt`, `mr`, `mb`, `ml` | `SizeValue` | Individual margins |
| `p` | `SizeValue` | All padding |
| `px` | `SizeValue` | Horizontal padding |
| `py` | `SizeValue` | Vertical padding |
| `pt`, `pr`, `pb`, `pl` | `SizeValue` | Individual padding |

### Style Props

#### Background & Appearance

| Prop | Type | Description |
|------|------|-------------|
| `bg` | `string` | Background color |
| `radius` | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | Border radius |
| `borderWidth` | `number` | Border width |
| `borderColor` | `string` | Border color |
| `shadow` | `number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | Shadow depth |
| `opacity` | `number` | Opacity (0-1) |

#### Dimensions

| Prop | Type | Description |
|------|------|-------------|
| `w`, `h` | `number \| string \| 'auto' \| 'full'` | Width and height |
| `minW`, `minH` | `number \| string` | Minimum dimensions |
| `maxW`, `maxH` | `number \| string` | Maximum dimensions |

#### Flexbox

| Prop | Type | Description |
|------|------|-------------|
| `flex` | `boolean` | Enable flex container |
| `grow` | `boolean \| number` | Flex grow |
| `shrink` | `boolean \| number` | Flex shrink |
| `basis` | `number \| string` | Flex basis |
| `direction` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Flex direction |
| `align` | `'stretch' \| 'flex-start' \| 'flex-end' \| 'center' \| 'baseline'` | Align items |
| `justify` | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | Justify content |
| `wrap` | `boolean \| 'nowrap' \| 'wrap' \| 'wrap-reverse'` | Flex wrap (`true` maps to `'wrap'`)
| `gap` | `number \| SizeValue` | Gap between children (defaults to `'sm'`; pass `0` to remove it) |

#### Positioning

| Prop | Type | Description |
|------|------|-------------|
| `position` | `'relative' \| 'absolute'` | Position type |
| `top`, `right`, `bottom`, `left` | `number \| string` | Position values |
| `zIndex` | `number` | Z-index |

### Accessibility Props

| Prop | Type | Description |
|------|------|-------------|
| `testID` | `string` | Test identifier |
| `accessibilityLabel` | `string` | Accessibility label |
| `accessible` | `boolean` | Whether accessible |
| `accessibilityRole` | `string` | Accessibility role |

## Size Values

The spacing and gap props accept `SizeValue` which can be:

- `number`: Direct pixel values
- `'xs'`: Extra small (4px)
- `'sm'`: Small (8px) 
- `'md'`: Medium (16px)
- `'lg'`: Large (24px)
- `'xl'`: Extra large (32px)

## Examples

### Replacing View Components

Before:
```tsx
<View style={{
  backgroundColor: 'blue',
  padding: 16,
  borderRadius: 8,
  marginBottom: 12
}}>
  Content
</View>
```

After:
```tsx
<Block bg="blue" p="md" radius="md" mb="sm">
  Content
</Block>
```

### Complex Layout

```tsx
<Block direction="column" gap="lg" p="xl">
  <Block direction="row" justify="space-between" align="center">
    <Block component="h1" style={{ fontSize: 24, fontWeight: 'bold' }}>
      Title
    </Block>
    <Block component="button" bg="blue.500" px="md" py="sm" radius="md">
      Action
    </Block>
  </Block>
  
  <Block bg="gray.50" p="lg" radius="lg">
    <Block mb="md">Content section</Block>
    <Block direction="row" gap="sm">
      <Block grow>Left content</Block>
      <Block w={100}>Right sidebar</Block>
    </Block>
  </Block>
</Block>
```

## Migration Guide

The Block component is designed to be a drop-in replacement for View components while providing additional functionality:

1. Replace `<View>` with `<Block>`
2. Convert inline styles to prop-based styles where possible
3. Use spacing shorthand props instead of style objects
4. Take advantage of polymorphic rendering when needed

## Performance Considerations

- Block uses optimized prop extraction to separate styling props from other props
- Style objects are only created when needed
- The polymorphic nature allows for efficient rendering based on the component type
- Spacing utilities are pre-calculated and cached