# ColorPicker

ColorPicker is a lightweight alternative to ColorInput for cases where a full hex input and dropdown chrome are unnecessary. It renders a single color preview that toggles a compact popover of preset swatches — no text input, no positioning engine.

## Metadata

- Canonical name: `ColorPicker`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ColorPicker } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: input
- Docs: https://react-ui-library.com/components/ColorPicker
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ColorPicker

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | No |  | Current color value in hex format (controlled) |
| `defaultValue` | string | No | '' | Initial color value for uncontrolled usage |
| `onChange` | (color: string) => void | No |  | Callback fired when a swatch is selected |
| `swatches` | string[] | No | DEFAULT_SWATCHES | Preset colors to choose from |
| `size` | number | No | 28 | Size of the trigger + swatches in pixels |
| `columns` | number | No | 5 | Number of swatches per row in the popover |
| `disabled` | boolean | No | false | Whether the picker is disabled |
| `accessibilityLabel` | string | No |  | Accessibility label for the trigger |
| `style` | StyleProp<ViewStyle> | No |  | Custom style for the outer wrapper |
| `testID` | string | No |  | Test ID |
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

### Basic
ID: `ColorPicker.basic` • Category: general

```tsx
const [color, setColor] = useState('#4ECDC4');
  return (
    <Block>
      <Row gap="sm" align="center">
        <ColorPicker value={color} onChange={setColor} />
        <Text size="sm" color="secondary">
          Selected: {color}
        </Text>
      </Row>
      <Block>
        <Text size="sm" weight="semibold">
          Larger, custom swatches
        </Text>
        <ColorPicker
          defaultValue="#5F27CD"
          size={36}
          columns={4}
          swatches={['#0F172A', '#5F27CD', '#54A0FF', '#4ECDC4', '#96CEB4', '#FECA57', '#F8B500', '#FF6B6B']}
        />
      </Block>
    </Block>
  );
}
```
