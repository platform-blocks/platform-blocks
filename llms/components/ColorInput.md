# ColorInput

The ColorInput component provides an intuitive interface for selecting colors through various input methods including color wheel, hex input, and preset swatches.

## Metadata

- Canonical name: `ColorInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ColorInput } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: input
- Docs: https://react-ui-library.com/components/ColorInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ColorInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | No |  | Current color value in hex format (e.g., "#ff0000") |
| `defaultValue` | string | No | '' | Default color value for uncontrolled usage |
| `onChange` | (color: string) => void | No |  | Callback when color changes |
| `label` | string | No |  | Label for the color picker |
| `placeholder` | string | No | 'Select color' | Placeholder text when no color is selected |
| `disabled` | boolean | No | false | Whether the picker is disabled |
| `required` | boolean | No | false | Whether the picker is required |
| `error` | string | No |  | Error message to display |
| `description` | string | No |  | Help text to display below the picker |
| `size` | ComponentSizeValue | No | 'md' | Size of the picker |
| `variant` | 'default' \| 'filled' \| 'unstyled' | No | 'default' | Variant of the picker |
| `radius` | 'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' | No |  | Radius of the picker |
| `showPreview` | boolean | No | true | Whether to show the color preview |
| `showInput` | boolean | No | true | Whether to show the hex input |
| `swatches` | string[] | No | DEFAULT_SWATCHES | Predefined color swatches to show |
| `withSwatches` | boolean | No | true | Whether to show common color swatches |
| `format` | 'hex' \| 'rgb' \| 'hsl' | No | 'hex' | Format for the color value |
| `withAlpha` | boolean | No | false | Whether to include alpha channel |
| `placement` | PlacementType | No |  | Dropdown placement |
| `flip` | boolean | No | true | Whether to flip placement when no space |
| `shift` | boolean | No | true | Whether to shift position to stay in viewport |
| `boundary` | any | No |  | Boundary element for positioning constraints |
| `offset` | number | No | 8 | Offset from anchor element in pixels |
| `autoReposition` | boolean | No | true | Whether to automatically reposition on resize/scroll |
| `fallbackPlacements` | PlacementType[] | No | DEFAULT_FALLBACK_PLACEMENTS | Fallback placements to try |
| `keyboardAvoidance` | boolean | No | true | Whether dropdown should avoid the on-screen keyboard when visible |
| `style` | StyleProp<ViewStyle> | No |  | Custom style for the container |
| `previewStyle` | StyleProp<ViewStyle> | No |  | Custom style for the preview |
| `inputStyle` | StyleProp<TextStyle> | No |  | Custom style for the input |
| `clearable` | boolean | No | false | Whether the picker should display a clear button |
| `clearButtonLabel` | string | No | 'Clear color' | Accessible label for the clear button |
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
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |

## Examples

### Basic Usage
ID: `ColorInput.basic` • Category: general

Simple color picker with default settings.

```tsx
const [color, setColor] = useState('#FF6B6B');
  return (
    <Block fullWidth>
      <ColorInput
        value={color}
        onChange={setColor}
        label="Favorite color"
        placeholder="Select a color"
        clearable
        fullWidth
      />
      <Text size="sm" color="secondary">
        Selected: {color || 'none'}
      </Text>
    </Block>
  );
}
```

### Custom Swatches
ID: `ColorInput.swatches` • Category: general

Color picker with custom swatch palettes.

```tsx
const [color1, setColor1] = useState('#2196F3');
  const [color2, setColor2] = useState('#4CAF50');
  const [color3, setColor3] = useState('#FF9800');
  const blueSwatches = [
    '#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5',
    '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1',
  ];
  const greenSwatches = [
    '#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A',
    '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20',
  ];
  return (
    <Block fullWidth>
      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Custom blue palette
        </Text>
        <ColorInput
          value={color1}
          onChange={setColor1}
          swatches={blueSwatches}
          label="Blue shades"
          fullWidth
        />
      </Block>
      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Custom green palette
        </Text>
        <ColorInput
          value={color2}
          onChange={setColor2}
          swatches={greenSwatches}
          label="Green shades"
          fullWidth
        />
      </Block>
      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Without swatches
        </Text>
        <ColorInput
          value={color3}
          onChange={setColor3}
          withSwatches={false}
          label="Color wheel only"
          fullWidth
        />
      </Block>
    </Block>
  );
}
```
