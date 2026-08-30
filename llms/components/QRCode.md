# QRCode

The QRCode component generates QR codes for encoding text, URLs, or other data. Supports customization of size, colors, quiet zones, error correction, and various rendering options.

## Metadata

- Canonical name: `QRCode`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { QRCode } from '@platform-blocks/react-ui-library';`
- Category: data
- Tags: qrcode, barcode, scan, data, encoding
- Docs: https://react-ui-library.com/components/QRCode
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/QRCode

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | Yes |  | The data/text to encode in the QR code |
| `label` | React.ReactNode | No |  | Caption rendered with the code — what the user is being asked to scan. Also supplies the accessibility label when `accessibilityLabel` is unset. |
| `description` | React.ReactNode | No |  | Secondary line rendered under the label, for the longer explanation. |
| `labelPosition` | 'top' \| 'bottom' | No | 'bottom' | Which side of the code the caption sits on. @default 'bottom' |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the description `<Text>` |
| `size` | ComponentSizeValue | No |  | Size of the QR code (both width and height). Accepts a size token (`xs`–`3xl`) or an explicit pixel value. |
| `backgroundColor` | string | No |  | Background color of the QR code |
| `color` | string | No |  | Foreground color (the QR code pattern color) |
| `moduleShape` | 'square' \| 'rounded' \| 'diamond' | No |  | Module shape variant for data modules. Note: Finder patterns (corner anchors) always remain square for optimal scanner compatibility. |
| `finderShape` | 'square' \| 'rounded' | No |  | Corner (finder) shape variant - DEPRECATED: Finder patterns always remain square |
| `cornerRadius` | number | No |  | Rounded corner radius factor (0-1) applied when moduleShape='rounded' |
| `gradient` | { type?: 'linear' \| 'radial'; from: string; to: string; rotation?: number; } | No |  | Gradient fill (overrides color) |
| `errorCorrectionLevel` | 'L' \| 'M' \| 'Q' \| 'H' | No |  | Error correction level |
| `quietZone` | number | No |  | Quiet zone size (border modules around the QR code). Defaults to 1 for compact layouts. Set to 4 for strict QR code standard compliance. Set to 0 to remove all padding around the code. |
| `logo` | { uri: string \| ImageSourcePropType; element?: React.ReactNode; size?: number; backgroundColor?: string; borderRadius?: number; } | No |  | Logo to display in the center of the QR code |
| `style` | StyleProp<ViewStyle> | No |  | Custom container style |
| `testID` | string | No |  | Test ID for testing |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `onError` | (error: Error) => void | No |  | Callback when QR code generation fails |
| `onLoadStart` | () => void | No |  | Callback when QR code starts loading |
| `onLoadEnd` | () => void | No |  | Callback when QR code finishes loading |
| `copyOnPress` | boolean \| { value?: string } | No |  | If true (or object), tapping the QR copies the value (or provided value). |
| `showCopyButton` | boolean | No |  | Show a floating copy button overlay |
| `copyToastTitle` | string | No |  | Custom toast title when copied |
| `copyToastMessage` | string | No |  | Custom toast message when copied |
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

### Basics
ID: `QRCode.basic` • Tags: qr-code • Category: basics • Status: stable • Since: 1.0.0

Render a single QR code for a link or payload and provide helper text for scanning context.

```tsx
return (
    <QRCode
      value="https://react-ui-library.com"
      size={168}
      quietZone={2}
      label="Scan to open the React UI Library docs."
    />
  );
}
```

### Sizes
ID: `QRCode.sizes` • Tags: size • Category: layout • Status: stable • Since: 1.0.0

Size accepts a token (`xs`–`3xl`) or an explicit pixel value, so QR codes line up with the rest of the size system while still allowing a bespoke footprint.

```tsx
return (
    <Block>
      <Row align="flex-end" gap="lg" wrap="wrap">
        {SIZES.map((size) => (
          <QRCode
            key={size}
            value="https://react-ui-library.com"
            size={size}
            quietZone={2}
            label={size}
          />
        ))}
      </Row>
      <QRCode
        value="https://react-ui-library.com"
        size={144}
        quietZone={2}
        label="144 (numeric)"
      />
    </Block>
  );
}
```

### Spacing
ID: `QRCode.spacing` • Tags: quiet-zone • Category: layout • Status: stable • Since: 1.0.0

Compare quiet zone values and pair them with outer spacing props when embedding codes in dense layouts.

```tsx
const theme = useTheme();
  return (
    <Block align="center">
      {QUIET_ZONES.map(({ label, quietZone }) => (
        <QRCode
          key={label}
          value="https://react-ui-library.com"
          size={150}
          quietZone={quietZone}
          label={label}
        />
      ))}
      <Block align="center">
        <Block bg={theme.backgrounds.subtle} radius="lg" p="sm">
          <QRCode
            value="https://react-ui-library.com"
            size={150}
            quietZone={0}
            m="xs"
          />
        </Block>
        <Text variant="small" color="muted">
          Use spacing props and container styling to pad the QR code externally.
        </Text>
      </Block>
    </Block>
  );
}
```

### Colors
ID: `QRCode.colors` • Tags: palette • Category: theming • Status: stable • Since: 1.0.0

Derive QR foreground and background colors from theme palettes to keep scans on brand.

```tsx
const theme = useTheme();
  return (
    <Block>
      <Text variant="small" color="muted">
        Theme-aligned palettes
      </Text>
      <Row gap="lg" wrap="wrap" justify="center">
        {SCHEMES.map(({ key, label }) => {
          const palette = theme.colors[key];
          const foreground = palette?.[6] ?? theme.colors.primary[6];
          const background = palette?.[0] ?? theme.backgrounds.surface;
          return (
            <QRCode
              key={key}
              value="https://react-ui-library.com"
              size={144}
              backgroundColor={background}
              color={foreground}
              quietZone={2}
              label={label}
            />
          );
        })}
      </Row>
    </Block>
  );
}
```

### Shapes
ID: `QRCode.shapes` • Tags: modules • Category: features • Status: stable • Since: 1.0.0

Switch between square, rounded, and diamond module shapes while keeping finder patterns scanner-safe.

```tsx
return (
    <Block>
      <Text variant="small" color="muted">
        Module geometry
      </Text>
      <Row gap="lg" wrap="wrap" justify="center">
        {SHAPES.map(({ label, value, moduleShape, cornerRadius }) => (
          <QRCode
            key={label}
            value={value}
            size={150}
            moduleShape={moduleShape}
            cornerRadius={cornerRadius}
            quietZone={1}
            label={label}
          />
        ))}
      </Row>
    </Block>
  );
}
```

### Gradients
ID: `QRCode.gradient` • Tags: gradient • Category: theming • Status: stable • Since: 1.0.0

Blend theme colors with linear or radial gradients to add polish without hurting scan reliability.

```tsx
const theme = useTheme();
  const gradients = createGradientExamples(theme);
  return (
    <Block>
      <Text variant="small" color="muted">
        Gradient fills
      </Text>
      <Row gap="lg" wrap="wrap" justify="center">
        {gradients.map(({ label, value, gradient, moduleShape, cornerRadius }) => (
          <QRCode
            key={label}
            value={value}
            size={160}
            gradient={gradient}
            moduleShape={moduleShape}
            cornerRadius={cornerRadius}
            quietZone={2}
            label={label}
          />
        ))}
      </Row>
    </Block>
  );
}
```

### Interactive
ID: `QRCode.interactive` • Tags: controls • Category: interaction • Status: stable • Since: 1.0.0

Let editors tweak the payload, size, error correction, and module shape while previewing the QR code live.

```tsx
const [value, setValue] = useState<string>(PRESETS[0].value);
  const [size, setSize] = useState<(typeof SIZES)[number]>(SIZES[1]);
  const [errorLevel, setErrorLevel] = useState<(typeof ERROR_LEVELS)[number]>('M');
  const [moduleShape, setModuleShape] = useState<(typeof MODULE_SHAPES)[number]>('square');
  return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Source content
        </Text>
        <Input
          value={value}
          onChangeText={setValue}
          placeholder="Enter text, URL, or contact info"
          multiline
          minLines={1}
          maxLines={3}
        />
        <Row gap="xs" wrap="wrap">
          {PRESETS.map(({ label, value: preset }) => (
            <Button
              key={label}
              size="xs"
              variant={value === preset ? 'filled' : 'outline'}
              onPress={() => setValue(preset)}
            >
              {label}
            </Button>
          ))}
        </Row>
        <Text variant="small" color="muted">
          {value.length} characters
        </Text>
      </Block>
      <Row gap="lg" wrap="wrap" align="flex-start">
        <Block maxW={320} w="full">
          <Block>
            <Block>
              <Text variant="small" color="muted">
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
              <Text variant="small" color="muted">
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
              <Text variant="small" color="muted">
                L≈7% • M≈15% • Q≈25% • H≈30% recovery
              </Text>
            </Block>
            <Block>
              <Text variant="small" color="muted">
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
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </Button>
                ))}
              </Row>
            </Block>
          </Block>
        </Block>
        <QRCode
          value={value || 'React UI Library'}
          size={size}
          quietZone={2}
          errorCorrectionLevel={errorLevel}
          moduleShape={moduleShape}
          cornerRadius={moduleShape === 'rounded' ? 0.4 : undefined}
          copyOnPress={{ value }}
          label={`${size}px • Level ${errorLevel} • ${moduleShape} modules`}
          labelProps={{ style: { textAlign: 'center' } }}
        />
      </Row>
    </Block>
  );
}
```

### Logos
ID: `QRCode.logo` • Tags: logo • Category: branding • Status: stable • Since: 1.0.0

Embed brand marks inside the QR code while preserving quiet zones and scanner-friendly contrast.

```tsx
const theme = useTheme();
  return (
    <Row gap="lg" wrap="wrap" justify="center">
      {LOGO_EXAMPLES.map(({ label, value, moduleShape, cornerRadius, logo }) => (
        <QRCode
          key={label}
          value={value}
          size={176}
          moduleShape={moduleShape}
          cornerRadius={cornerRadius}
          quietZone={2}
          logo={{
            ...logo,
            backgroundColor: theme.backgrounds.surface
          }}
          label={label}
        />
      ))}
    </Row>
  );
}
```

### QR Code Variants
ID: `QRCode.variants` • Tags: variants, error-correction, quiet-zone • Category: usage • Status: stable • Since: 1.0.0

Compare how error correction levels and quiet zone widths influence scannability.

```tsx
return (
    <Block>
      <Block>
        <Text variant="small" color="muted">
          Error correction levels
        </Text>
        <Row gap="lg" wrap="wrap" justify="center">
          {ERROR_LEVELS.map(({ label, value }) => (
            <QRCode
              key={value}
              value={`https://react-ui-library.com/ecc/${value}`}
              errorCorrectionLevel={value}
              size={140}
              label={label}
            />
          ))}
        </Row>
      </Block>
      <Block>
        <Text variant="small" color="muted">
          Quiet zone widths
        </Text>
        <Row gap="lg" wrap="wrap" justify="center">
          {QUIET_ZONES.map((quietZone) => (
            <QRCode
              key={quietZone}
              value={`https://react-ui-library.com/quiet-zone/${quietZone}`}
              quietZone={quietZone}
              size={140}
              label={`Quiet zone: ${quietZone}`}
            />
          ))}
        </Row>
      </Block>
    </Block>
  );
}
```
