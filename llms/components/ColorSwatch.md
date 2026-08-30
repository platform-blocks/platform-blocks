# ColorSwatch

A simple square component for displaying colors, designed as a building block for color pickers and palette interfaces.

## Metadata

- Canonical name: `ColorSwatch`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ColorSwatch } from '@platform-blocks/react-ui-library';`
- Category: display
- Tags: color, swatch, palette, picker
- Docs: https://react-ui-library.com/components/ColorSwatch
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ColorSwatch

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `color` | string | Yes |  | The color value to display (hex, rgb, hsl, etc.) |
| `size` | number | No | 32 | Size of the swatch in pixels |
| `selected` | boolean | No | false | Whether the swatch is selected/active |
| `disabled` | boolean | No | false | Whether the swatch is disabled |
| `onPress` | () => void | No |  | Callback when swatch is pressed |
| `showBorder` | boolean | No | true | Show a border around the swatch |
| `borderColor` | string | No |  | Custom border color (defaults to theme color) |
| `borderWidth` | number | No | 1 | Border width in pixels |
| `borderRadius` | number | No | 4 | Border radius in pixels |
| `showCheckmark` | boolean | No | true | Show a checkmark when selected |
| `checkmarkColor` | string | No |  | Custom checkmark color |
| `accessibilityLabel` | string | No |  | Accessibility label |
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

### Advanced
ID: `ColorSwatch.advanced` • Category: general

```tsx
const [selectedColor, setSelectedColor] = useState<string>('#E74C3C');
  return (
    <Flex direction="column" gap={20} p={16} >
      <Flex direction="column" gap={8}>
        <Text size="sm">Grayscale palette:</Text>
        <Flex direction="row" gap={2}>
          {[
            '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666',
            '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#ffffff'
          ].map(color => (
            <ColorSwatch
              key={color}
              color={color}
              borderRadius={2}
              selected={selectedColor === color}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </Flex>
      </Flex>
      <Flex direction="column" gap={8}>
        <Text size="sm">Large display swatch:</Text>
        <Flex direction="row" align="center" gap={16}>
          <ColorSwatch 
            color={selectedColor} 
            size={80} 
            borderRadius={8}
            showCheckmark={false}
          />
          <Flex direction="column" gap={4}>
            <Text weight="semibold">{selectedColor}</Text>
            <Text size="xs" color="secondary">Click any swatch above to change</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
```

### Basic
ID: `ColorSwatch.basic` • Category: general

```tsx
const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];
  const [selectedColor, setSelectedColor] = useState<string>('#FF6B6B');
  return (
    <Flex direction="column" gap={16} p={16} style={{ maxWidth: 400 }}>
      <Text weight="semibold" size="md">Basic Color Swatches</Text>
      <Flex direction="column" gap={8}>
        <Text size="sm">Click to select a color:</Text>
        <Flex direction="row" gap={8} wrap="wrap">
          {colors.map(color => (
            <ColorSwatch
              key={color}
              color={color}
              size={40}
              selected={selectedColor === color}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </Flex>
        <Text size="xs" color="secondary">
          Selected: {selectedColor}
        </Text>
      </Flex>
      <Flex direction="column" gap={8}>
        <Text size="sm">Different sizes:</Text>
        <Flex direction="row" gap={8} align="center">
          <ColorSwatch color="#FF6B6B" size={24} />
          <ColorSwatch color="#4ECDC4" size={32} />
          <ColorSwatch color="#45B7D1" size={48} />
          <ColorSwatch color="#96CEB4" size={64} />
        </Flex>
      </Flex>
      <Flex direction="column" gap={8}>
        <Text size="sm">Without borders:</Text>
        <Flex direction="row" gap={8}>
          {colors.slice(0, 5).map(color => (
            <ColorSwatch
              key={color}
              color={color}
              size={32}
              showBorder={false}
            />
          ))}
        </Flex>
      </Flex>
      <Flex direction="column" gap={8}>
        <Text size="sm">Disabled state:</Text>
        <Flex direction="row" gap={8}>
          {colors.slice(0, 3).map(color => (
            <ColorSwatch
              key={color}
              color={color}
              size={32}
              disabled
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
```

### Palette
ID: `ColorSwatch.palette` • Category: general

```tsx
const [selectedColor, setSelectedColor] = useState<string>('#E74C3C');
  const colorPalettes = {
    'Material Colors': [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
      '#FF5722', '#795548', '#9E9E9E', '#607D8B', '#000000'
    ],
    'Pastel Colors': [
      '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
      '#C5B3FF', '#FFB3E6', '#FFD1DC', '#E6E6FA', '#F0E68C'
    ],
    'Dark Colors': [
      '#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7',
      '#1ABC9C', '#16A085', '#27AE60', '#229954', '#E74C3C'
    ]
  };
  return (
    <Flex direction="column" gap={20} p={16} style={{ maxWidth: 600 }}>
      <Text weight="semibold" size="md">Color Palette Builder</Text>
      <Flex direction="column" gap={8}>
        <Text size="sm">Selected Color: {selectedColor}</Text>
        <ColorSwatch 
          color={selectedColor} 
          size={60} 
          borderRadius={8}
          showCheckmark={false}
        />
      </Flex>
      {Object.entries(colorPalettes).map(([paletteName, colors]) => (
        <Flex key={paletteName} direction="column" gap={8}>
          <Text weight="medium" size="sm">{paletteName}</Text>
          <Flex direction="row" gap={6} wrap="wrap">
            {colors.map(color => (
              <ColorSwatch
                key={color}
                color={color}
                size={32}
                selected={selectedColor === color}
                onPress={() => setSelectedColor(color)}
                borderRadius={paletteName === 'Pastel Colors' ? 16 : 4}
              />
            ))}
          </Flex>
        </Flex>
      ))}
      <Flex direction="column" gap={8}>
        <Text weight="medium" size="sm">Custom Styles Examples</Text>
        <Flex direction="row" gap={12} wrap="wrap">
          <Flex direction="column" gap={4} align="center">
            <ColorSwatch 
              color={selectedColor} 
              size={40} 
              borderRadius={20}
              borderWidth={3}
              borderColor="#FFD700"
            />
            <Text size="xs">Round Gold</Text>
          </Flex>
          <Flex direction="column" gap={4} align="center">
            <ColorSwatch 
              color={selectedColor} 
              size={40} 
              showBorder={false}
              showCheckmark={false}
            />
            <Text size="xs">No Border</Text>
          </Flex>
          <Flex direction="column" gap={4} align="center">
            <ColorSwatch 
              color={selectedColor} 
              size={40} 
              borderRadius={0}
              checkmarkColor="#FFD700"
            />
            <Text size="xs">Square</Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
```
