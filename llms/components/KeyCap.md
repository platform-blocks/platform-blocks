# KeyCap

A visual component for displaying keyboard keys, shortcuts, and key combinations with proper styling.

## Metadata

- Canonical name: `KeyCap`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { KeyCap } from '@platform-blocks/react-ui-library';`
- Category: typography
- Tags: keycap, keyboard, shortcut, key, hotkey
- Docs: https://react-ui-library.com/components/KeyCap
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/KeyCap

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | ReactNode | Yes |  | The key or text to display |
| `size` | ComponentSizeValue | No | 'md' | Size variant of the key cap |
| `variant` | 'default' \| 'minimal' \| 'outline' \| 'filled' | No | 'default' | Visual variant of the key cap |
| `color` | 'primary' \| 'secondary' \| 'gray' \| 'success' \| 'warning' \| 'error' | No | 'gray' | Color scheme for the key cap |
| `animateOnPress` | boolean | No | true | Whether the key should animate when the actual key is pressed Only works on web platforms |
| `transitionDuration` | number | No | 250 | Length of the press-down/up animation in ms; both legs scale against a 250ms baseline. `0` leaves the cap at rest. Always 0 under reduced motion. |
| `keyCode` | string | No |  | The actual key code to listen for (e.g., 'Enter', 'Space', 'Escape') If provided, the component will animate when this key is pressed |
| `modifiers` | Array<'ctrl' \| 'cmd' \| 'alt' \| 'shift' \| 'meta'> | No |  | Modifier keys that must be pressed along with the main key |
| `pressed` | boolean | No |  | Whether the key cap should appear pressed |
| `onKeyPress` | () => void | No |  | Callback when the key combination is pressed |
| `testID` | string | No |  | Custom test ID for testing |
| `fontFamily` | string | No |  | Custom font family (overrides the default monospace stack) |
| `ff` | string | No |  | Shorthand alias for `fontFamily` |
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
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basic Usage
ID: `KeyCap.basic` • Tags: basic, keyboard • Category: usage • Status: stable • Since: 1.0.0

Basic keyboard key display for showing shortcuts and key combinations.

```tsx
return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <KeyCap>A</KeyCap>
        <KeyCap>Enter</KeyCap>
        <KeyCap>Space</KeyCap>
        <KeyCap>⌘</KeyCap>
        <KeyCap>Ctrl</KeyCap>
        <KeyCap>⇧</KeyCap>
      </Row>
    </Block>
  );
}
```

### Sizes
ID: `KeyCap.sizes` • Tags: sizes • Category: usage • Status: stable • Since: 1.0.0

Different sizes for KeyCap components from extra small to extra large.

```tsx
return (
    <Block align="flex-start">
      <Row gap="sm" align="center" wrap="wrap">
        <KeyCap size="xs">XS</KeyCap>
        <KeyCap size="sm">SM</KeyCap>
        <KeyCap size="md">MD</KeyCap>
        <KeyCap size="lg">LG</KeyCap>
        <KeyCap size="xl">XL</KeyCap>
      </Row>
    </Block>
  );
}
```

### Variants
ID: `KeyCap.variants` • Tags: variants, styles • Category: usage • Status: stable • Since: 1.0.0

Different visual variants for KeyCap components including default, filled, minimal, and outline styles.

```tsx
return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <KeyCap variant="default">Default</KeyCap>
        <KeyCap variant="filled">Filled</KeyCap>
        <KeyCap variant="minimal">Minimal</KeyCap>
        <KeyCap variant="outline">Outline</KeyCap>
      </Row>
    </Block>
  );
}
```

### Modifiers
ID: `KeyCap.modifiers` • Tags: modifiers, shortcuts, combinations • Category: usage • Status: stable • Since: 1.0.0

KeyCap components with modifier keys for displaying keyboard shortcuts and key combinations.

```tsx
return (
    <Block>
      <Row gap="xs" align="center">
        <Text>Copy</Text>
        <KeyCap keyCode="C" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="C" modifiers={['cmd']} size="sm">C</KeyCap>
      </Row>
      <Row gap="xs" align="center">
        <Text>Save</Text>
        <KeyCap keyCode="S" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="S" modifiers={['cmd']} size="sm">S</KeyCap>
      </Row>
      <Row gap="xs" align="center">
        <Text>Undo</Text>
        <KeyCap keyCode="Z" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="Z" modifiers={['cmd']} size="sm">Z</KeyCap>
      </Row>
    </Block>
  );
}
```
