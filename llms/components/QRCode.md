# QRCode

The QRCode component generates QR codes for encoding text, URLs, or other data. Supports customization of size, colors, quiet zones, error correction, and various rendering options.

## Metadata

- Import: `import { QRCode } from '@plocks/qrcode';`
- Install: `npm install @plocks/qrcode` — a separate package from `@plocks/ui`
- Tags: qrcode, barcode, scan, data, encoding
- Docs: https://plocks.dev/components/QRCode
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/qrcode/src/components/QRCode

## Props

- `value` (required): string — The data/text to encode in the QR code
- `label`: React.ReactNode — Caption rendered with the code — what the user is being asked to scan. Also supplies the accessibility label when `accessibilityLabel` is unset.
- `description`: React.ReactNode — Secondary line rendered under the label, for the longer explanation.
- `labelPosition`: 'top' | 'bottom' = 'bottom' — Which side of the code the caption sits on. @default 'bottom'
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the label `<Text>`
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the description `<Text>`
- `size`: ComponentSizeValue = 400 — Size of the QR code (both width and height). Accepts a size token (`xs`–`3xl`) or an explicit pixel value.
- `bg`: string — Background of the code itself: a background token, palette color, or any CSS color.
- `color`: string — Foreground color (the QR code pattern color)
- `moduleShape`: 'square' | 'rounded' | 'diamond' — Module shape variant for data modules. Note: Finder patterns (corner anchors) always remain square for optimal scanner compatibility.
- `cornerRadius`: number — Rounded corner radius factor (0-1) applied when moduleShape='rounded'
- `gradient`: { type?: 'linear' | 'radial'; from: string; to: string; rotation?: number; } — Gradient fill (overrides color)
- `errorCorrectionLevel`: 'L' | 'M' | 'Q' | 'H' = 'M' — Error correction level
- `quietZone`: number = 4 — Quiet zone size (border modules around the QR code). Defaults to 4 for QR code standard compliance. Set to 0 to remove all padding around the code.
- `logo`: { uri: string | ImageSourcePropType; element?: React.ReactNode; size?: number; backgroundColor?: string; borderRadius?: number; } — Logo to display in the center of the QR code
- `accessibilityLabel`: string — Accessible name of the code (announced as an image). Defaults to a string `label`, else `"QR code: <value>"` (long values truncated).
- `onError`: (error: Error) => void — Callback when QR code generation fails
- `copyOnPress`: boolean | { value?: string } — If true (or object), tapping the QR copies the value (or provided value).
- `showCopyButton`: boolean — Show a floating copy button overlay
- `copyToastTitle`: string — Custom toast title when copied
- `copyToastMessage`: string — Custom toast message when copied
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { QRCodeSVG } from '@plocks/qrcode';`

### QRCodeSVG

- `size`: number
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `opacity`: number — Opacity, `0`–`1`

Plus the `QRCode` props (`value` `label` `description` `labelPosition` `labelProps` `descriptionProps` `bg` `color` `moduleShape` `cornerRadius` `gradient` `errorCorrectionLevel` `quietZone` `logo` `accessibilityLabel` `onError` `copyOnPress` `showCopyButton` `copyToastTitle` `copyToastMessage`): https://plocks.dev/llms/components/QRCode.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Render a single QR code for a link or payload and provide helper text for scanning context.

```tsx
import { QRCode } from '@plocks/qrcode';

export function Demo() {
  return (
    <QRCode
      value="https://plocks.dev"
      size={168}
      quietZone={2}
      label="Scan to open the plocks docs."
    />
  );
}
```

### Sizes

Size accepts a token (`xs`–`3xl`) or an explicit pixel value, so QR codes line up with the rest of the size system while still allowing a bespoke footprint.

```tsx
import { Block, Row } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Block>
      <Row align="flex-end" gap="lg" wrap="wrap">
        {SIZES.map((size) => (
          <QRCode
            key={size}
            value="https://plocks.dev"
            size={size}
            quietZone={2}
            label={size}
          />
        ))}
      </Row>

      <QRCode
        value="https://plocks.dev"
        size={144}
        quietZone={2}
        label="144 (numeric)"
      />
    </Block>
  );
}
```

### Spacing

Compare quiet zone values and pair them with outer spacing props when embedding codes in dense layouts.

```tsx
import { Block } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const QUIET_ZONES = [
  { label: 'Default quiet zone (4)', quietZone: undefined },
  { label: 'Minimal quiet zone (1)', quietZone: 1 },
  { label: 'No quiet zone (0)', quietZone: 0 }
] as const;

export function Demo() {
  return (
    <Block align="center">
      {QUIET_ZONES.map(({ label, quietZone }) => (
        <QRCode
          key={label}
          value="https://plocks.dev"
          size={150}
          quietZone={quietZone}
          label={label}
        />
      ))}
      <Block bg="subtle" radius="lg" p="sm">
        <QRCode
          value="https://plocks.dev"
          size={150}
          quietZone={0}
          m="xs"
        />
      </Block>
    </Block>
  );
}
```

### Colors

Derive QR foreground and background colors from theme palettes to keep scans on brand.

```tsx
import { Row, useTheme } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SCHEMES = ['primary', 'success', 'warning', 'error'] as const;

export function Demo() {
  const theme = useTheme();

  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {SCHEMES.map((scheme) => (
        <QRCode
          key={scheme}
          value="https://plocks.dev"
          size={144}
          color={theme.colors[scheme][6]}
          bg={theme.colors[scheme][0]}
          quietZone={2}
          label={scheme}
        />
      ))}
    </Row>
  );
}
```

### Shapes

Switch between square, rounded, and diamond module shapes while keeping finder patterns scanner-safe.

```tsx
import { Row } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SHAPES = ['square', 'rounded', 'diamond'] as const;

export function Demo() {
  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {SHAPES.map((shape) => (
        <QRCode
          key={shape}
          value="https://plocks.dev"
          size={150}
          moduleShape={shape}
          quietZone={1}
          label={shape}
        />
      ))}
    </Row>
  );
}
```

### Gradients

Blend theme colors with linear or radial gradients to add polish without hurting scan reliability.

```tsx
import { Row, useTheme } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

export function Demo() {
  const theme = useTheme();

  return (
    <Row gap="lg" wrap="wrap" justify="center">
      <QRCode
        value="https://plocks.dev"
        size={160}
        quietZone={2}
        gradient={{ type: 'linear', from: theme.colors.primary[6], to: theme.colors.highlight[5], rotation: 45 }}
        label="linear"
      />
      <QRCode
        value="https://plocks.dev"
        size={160}
        quietZone={2}
        gradient={{ type: 'radial', from: theme.colors.success[5], to: theme.colors.primary[4] }}
        label="radial"
      />
    </Row>
  );
}
```

### Interactive

Let editors tweak the payload, size, error correction, and module shape while previewing the QR code live.

```tsx
import { useState } from 'react';
import { Block, Button, Input, Row, Text } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const SIZES = [144, 168, 192] as const;
const ERROR_LEVELS = ['L', 'M', 'Q', 'H'] as const;
const MODULE_SHAPES = ['square', 'rounded', 'diamond'] as const;

export function Demo() {
  const [value, setValue] = useState('https://plocks.dev');
  const [size, setSize] = useState<(typeof SIZES)[number]>(168);
  const [errorLevel, setErrorLevel] = useState<(typeof ERROR_LEVELS)[number]>('M');
  const [moduleShape, setModuleShape] = useState<(typeof MODULE_SHAPES)[number]>('square');

  return (
    <Block>
      <Input value={value} onChangeText={setValue} placeholder="Enter text, URL, or contact info" />
      <Row gap="lg" wrap="wrap" align="flex-start">
        <Block>
          <Block>
            <Text variant="small" c="muted">
              Size
            </Text>
            <Row gap="xs" wrap="wrap">
              {SIZES.map((option) => (
                <Button
                  key={option}
                  size="xs"
                  variant={size === option ? 'filled' : 'outline'}
                  onPress={() => setSize(option)}
                >
                  {option}px
                </Button>
              ))}
            </Row>
          </Block>
          <Block>
            <Text variant="small" c="muted">
              Error correction
            </Text>
            <Row gap="xs" wrap="wrap">
              {ERROR_LEVELS.map((level) => (
                <Button
                  key={level}
                  size="xs"
                  variant={errorLevel === level ? 'filled' : 'outline'}
                  onPress={() => setErrorLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </Row>
          </Block>
          <Block>
            <Text variant="small" c="muted">
              Module shape
            </Text>
            <Row gap="xs" wrap="wrap">
              {MODULE_SHAPES.map((shape) => (
                <Button
                  key={shape}
                  size="xs"
                  variant={moduleShape === shape ? 'filled' : 'outline'}
                  onPress={() => setModuleShape(shape)}
                >
                  {shape}
                </Button>
              ))}
            </Row>
          </Block>
        </Block>
        <QRCode
          value={value || 'plocks'}
          size={size}
          quietZone={2}
          errorCorrectionLevel={errorLevel}
          moduleShape={moduleShape}
        />
      </Row>
    </Block>
  );
}
```

### Logos

Embed brand marks inside the QR code while preserving quiet zones and scanner-friendly contrast.

```tsx
import { QRCode } from '@plocks/qrcode';

export function Demo() {
  return (
    <QRCode
      value="https://plocks.dev"
      size={176}
      quietZone={2}
      logo={{
        uri: require('../../../../assets/logo-mark.png'),
        size: 48,
        borderRadius: 8
      }}
    />
  );
}
```

### QR Code Variants

Compare how error correction levels and quiet zone widths influence scannability.

```tsx
import { Block, Row } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const ERROR_LEVELS = [
  { label: 'Level L (~7%)', value: 'L' },
  { label: 'Level M (~15%)', value: 'M' },
  { label: 'Level Q (~25%)', value: 'Q' },
  { label: 'Level H (~30%)', value: 'H' }
] as const;

const QUIET_ZONES = [0, 2, 4, 8] as const;

export function Demo() {
  return (
    <Block>
      <Row gap="lg" wrap="wrap" justify="center">
        {ERROR_LEVELS.map(({ label, value }) => (
          <QRCode
            key={value}
            value={`https://plocks.dev/ecc/${value}`}
            errorCorrectionLevel={value}
            size={140}
            label={label}
          />
        ))}
      </Row>
      <Row gap="lg" wrap="wrap" justify="center">
        {QUIET_ZONES.map((quietZone) => (
          <QRCode
            key={quietZone}
            value={`https://plocks.dev/quiet-zone/${quietZone}`}
            quietZone={quietZone}
            size={140}
            label={`Quiet zone: ${quietZone}`}
          />
        ))}
      </Row>
    </Block>
  );
}
```
