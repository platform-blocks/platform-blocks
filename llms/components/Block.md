# Block

A polymorphic building block component that serves as a foundational element to replace View components throughout the application. Similar to a `<div>` in web development. The `bg` prop resolves through the theme — same lookup rules as `<Card bg=...>`.

## Metadata

- Canonical name: `Block`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Block } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: layout
- Tags: layout, building-block, polymorphic, foundational
- Docs: https://react-ui-library.com/components/Block
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Block

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | No |  | Child elements to render inside the block |
| `component` | React.ElementType | No |  | The component to render as |
| `style` | StyleProp<ViewStyle> | No |  | Custom style object |
| `testID` | string | No |  | Test ID for testing purposes |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `accessible` | boolean | No |  | Whether the element is accessible |
| `accessibilityRole` | string | No |  | Accessibility role |
| `className` | string | No |  | Custom className (for web) |
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
| `bg` | string | No |  | Background color for the block |
| `radius` | number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | No |  | Border radius for rounded corners |
| `borderWidth` | number | No |  | Border width |
| `borderColor` | string | No |  | Border color |
| `shadow` | number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | No |  | Shadow depth (0-5) |
| `opacity` | number | No |  | Opacity (0-1) |
| `w` | number \| string \| 'auto' \| 'full' | No |  | Width of the block |
| `h` | number \| string \| 'auto' \| 'full' | No |  | Height of the block |
| `fullWidth` | boolean | No |  | Whether to take full width (100%) - shorthand for w="full" |
| `fluid` | boolean | No |  | Makes block take full available height (flex: 1) - useful for scrollable containers |
| `minW` | number \| string | No |  | Minimum width |
| `minH` | number \| string | No |  | Minimum height |
| `maxW` | number \| string | No |  | Maximum width |
| `maxH` | number \| string | No |  | Maximum height |
| `grow` | boolean \| number | No |  | Flex grow |
| `shrink` | boolean \| number | No |  | Flex shrink |
| `basis` | number \| string | No |  | Flex basis |
| `direction` | 'row' \| 'column' \| 'row-reverse' \| 'column-reverse' | No |  | Flex direction |
| `align` | 'stretch' \| 'flex-start' \| 'flex-end' \| 'center' \| 'baseline' | No |  | Align items |
| `justify` | 'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly' | No |  | Justify content |
| `wrap` | boolean \| 'nowrap' \| 'wrap' \| 'wrap-reverse' | No |  | Flex wrap |
| `gap` | number \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | No |  | Gap between children. Defaults to `'sm'`; pass `0` to remove it. |
| `position` | 'relative' \| 'absolute' | No |  | Position type |
| `top` | number \| string | No |  | Top position |
| `right` | number \| string | No |  | Right position |
| `bottom` | number \| string | No |  | Bottom position |
| `left` | number \| string | No |  | Left position |
| `start` | number \| string | No |  | Start position (logical property - becomes left in LTR, right in RTL) |
| `end` | number \| string | No |  | End position (logical property - becomes right in LTR, left in RTL) |
| `zIndex` | number | No |  | Z-index |
| `flex` | boolean | No |  | Whether to render as a flex container |

## Examples

### Basic usage
ID: `Block.basic` • Tags: layout, polymorphic • Category: basics • Status: stable • Since: 0.3.0

Combine spacing, layout, and polymorphic props on `Block` to build cards, responsive rows, and button-style actions without custom wrappers.

```tsx
return (
    <Block w="100%" maxW={420}>
      <Block bg="#111827" radius="lg" p="lg">
        <Block>
          <Text weight="semibold" color="white">
            Release summary
          </Text>
          <Text size="sm" color="rgba(255,255,255,0.75)">
            Apply `bg`, `p`, and `radius` props on `Block` to build a card without custom stylesheets.
          </Text>
        </Block>
      </Block>
      <Block direction="row">
        <Block grow bg="#2563eb" radius="md" p="md">
          <Text weight="semibold" color="white">
            Velocity
          </Text>
          <Text size="sm" color="rgba(255,255,255,0.8)">
            Use `grow` so sibling Blocks share remaining space.
          </Text>
        </Block>
        <Block w={140} bg="#f9fafb" radius="md" p="md">
          <Text weight="semibold">Backlog</Text>
          <Text size="sm" color="muted">
            Combine fixed widths with flexible layouts via the `w` prop.
          </Text>
        </Block>
      </Block>
      <Block direction="row">
        <Block component="button" bg="#2563eb" radius="md" px="lg" py="sm">
          <Text color="white" weight="semibold">
            Create project
          </Text>
        </Block>
        <Block
          component="button"
          radius="md"
          px="lg"
          py="sm"
          borderWidth={1}
          borderColor="#2563eb"
        >
          <Text color="#2563eb" weight="semibold">
            View roadmap
          </Text>
        </Block>
      </Block>
    </Block>
  );
}
```

### bg shorthand
ID: `Block.bg-shorthand` • Tags: bg, theme, shorthand, customization • Category: general • Status: stable • Since: 1.0.0

`bg` resolves through the theme. Pass a palette name (`'primary'`, `'success'`) for a subtle tint (shade-1), a `'palette.shade'` like `'primary.6'` for a specific shade, a theme-background key (`'surface'`, `'subtle'`, `'elevated'`), or any CSS color string. The same resolver powers `<Card bg=...>`.

```tsx
return (
    <Block>
      <Block>
        <Text size="sm" color="muted">Palette names → subtle tint (shade-1)</Text>
        <Row gap="sm" wrap="wrap">
          <Block bg="primary" p="sm" radius="md">
            <Text>primary</Text>
          </Block>
          <Block bg="success" p="sm" radius="md">
            <Text>success</Text>
          </Block>
          <Block bg="warning" p="sm" radius="md">
            <Text>warning</Text>
          </Block>
          <Block bg="error" p="sm" radius="md">
            <Text>error</Text>
          </Block>
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Specific shade with `palette.shade` syntax
        </Text>
        <Row gap="sm" wrap="wrap">
          <Block bg="primary.6" p="sm" radius="md">
            <Text c="dimmed" style={{ color: '#fff' }}>primary.6</Text>
          </Block>
          <Block bg="gray.2" p="sm" radius="md">
            <Text>gray.2</Text>
          </Block>
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">Theme background keys</Text>
        <Row gap="sm" wrap="wrap">
          <Block bg="surface" p="sm" radius="md" borderWidth={1} borderColor="#ddd">
            <Text>surface</Text>
          </Block>
          <Block bg="subtle" p="sm" radius="md">
            <Text>subtle</Text>
          </Block>
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">Plain CSS color string still works</Text>
        <Block bg="#a855f7" p="sm" radius="md">
          <Text style={{ color: '#fff' }}>Custom hex</Text>
        </Block>
      </Block>
    </Block>
  );
}
```
