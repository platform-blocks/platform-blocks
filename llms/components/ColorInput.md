# ColorInput

ColorInput combines a hex field with a palette of preset colors.

## Metadata

- Import: `import { ColorInput } from '@plocks/ui';`
- Docs: https://plocks.dev/components/ColorInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ColorInput

## Props

- `value`: string — Current color value in hex format (e.g., "#ff0000")
- `defaultValue`: string — Default color value for uncontrolled usage
- `onChange`: (color: string) => void — Called with the new color: a complete hex while typing, the normalized `#RRGGBB` form on blur / submit / swatch selection, and `''` when cleared.
- `showPreview`: boolean — Whether to show the color preview
- `showInput`: boolean — Whether to show the hex input
- `swatches`: string[] — Predefined color swatches to show
- `swatchLabels`: Record<string, string> — Readable names for the swatches, keyed by color (e.g. `{ '#FF6B6B': 'Coral' }`). Defaults to the color string.
- `withSwatches`: boolean — Whether to show the swatch dropdown (and its toggle button)
- `placement`: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end' — Dropdown placement
- `flip`: boolean — Whether to flip placement when no space
- `shift`: boolean — Whether to shift position to stay in viewport
- `boundary`: number — Minimum distance between the dropdown and the viewport edges, in pixels
- `offset`: number — Offset from anchor element in pixels
- `autoReposition`: boolean — Whether to automatically reposition on resize/scroll
- `fallbackPlacements`: PlacementType[] — Fallback placements to try
- `keyboardAvoidance`: boolean — Whether dropdown should avoid the on-screen keyboard when visible
- `previewStyle`: StyleProp<ViewStyle> — Custom style for the preview
- `inputStyle`: StyleProp<ViewStyle> — Custom style for the input box (the bordered frame around preview, hex text and buttons)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `variant` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), text field (`placeholder` `placeholderTextColor` `clearable` `clearButtonLabel` `onClear` `startSection` `endSection`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Variants

Compare the default, filled, outline, and unstyled field shells on ColorInput.

```tsx
import { Column, ColorInput } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'unstyled'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <ColorInput key={variant} variant={variant} label={`${variant} variant`} placeholder="Choose a color" />
      ))}
    </Column>
  );
}
```

### Basics

Color field with a hex input, live preview and preset swatches.

```tsx
import { useState } from 'react';
import { Block, ColorInput, Text } from '@plocks/ui';

export function Demo() {
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
      <Text size="sm" c="secondary">
        Selected: {color || 'none'}
      </Text>
    </Block>
  );
}
```

### Custom Swatches

Color field with custom swatch palettes.

```tsx
import { useState } from 'react';
import { Block, ColorInput, Text } from '@plocks/ui';

export function Demo() {
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
        <Text size="sm" fw="semibold">
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
        <Text size="sm" fw="semibold">
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
        <Text size="sm" fw="semibold">
          Without swatches
        </Text>
        <ColorInput
          value={color3}
          onChange={setColor3}
          withSwatches={false}
          label="Hex input only"
          fullWidth
        />
      </Block>
    </Block>
  );
}
```
