# ColorPicker

ColorPicker opens a compact palette for choosing a preset color.

## Metadata

- Import: `import { ColorPicker } from '@plocks/ui';`
- Docs: https://plocks.dev/components/ColorPicker
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ColorPicker

## Props

- `value`: string — Current color value in hex format (controlled)
- `defaultValue`: string = '' — Initial color value for uncontrolled usage
- `onChange`: (color: string) => void — Callback fired when a swatch is selected
- `swatches`: string[] = DEFAULT_SWATCHES — Preset colors to choose from
- `swatchLabels`: Record<string, string> — Readable names for the swatches, keyed by color (e.g. `{ '#FF6B6B': 'Coral' }`). Defaults to the color string.
- `size`: number = 28 — Size of the trigger + swatches in pixels
- `columns`: number = 5 — Number of swatches per row in the popover
- `disabled`: boolean = false — Whether the picker is disabled
- `accessibilityLabel`: string = `Color <value>`, or 'Select a color' with no value — Accessible name of the trigger. @default `Color <value>`, or 'Select a color' with no value
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

ColorPicker opens a compact palette for choosing a preset color.

```tsx
import { useState } from 'react';
import { Block, ColorPicker, Row, Text } from '@plocks/ui';

export function Demo() {
  const [color, setColor] = useState('#4ECDC4');

  return (
    <Block>
      <Row gap="sm" align="center">
        <ColorPicker value={color} onChange={setColor} />
        <Text size="sm" c="secondary">
          Selected: {color}
        </Text>
      </Row>

      <Block>
        <Text size="sm" fw="semibold">
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
