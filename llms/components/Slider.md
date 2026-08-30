# Slider

The Slider component allows users to select a value or range of values by moving a handle along a track. Supports single values, ranges, vertical layouts, and rich customization hooks for the value-label tooltip.

## Metadata

- Canonical name: `Slider`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Slider } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: slider, range, input, numeric, control
- Docs: https://react-ui-library.com/components/Slider
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Slider

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | No |  | Slider value |
| `defaultValue` | number | No | 0 | Uncontrolled initial value |
| `onChange` | (value: number) => void | No |  | Change handler |
| `min` | number | No | 0 | Minimum value |
| `max` | number | No | 100 | Maximum value |
| `step` | number | No | 1 | Step increment |
| `orientation` | 'horizontal' \| 'vertical' | No | 'horizontal' | Slider orientation |
| `trackColor` | ColorValue | No |  | Track color |
| `activeTrackColor` | ColorValue | No |  | Active track color |
| `thumbColor` | ColorValue | No |  | Thumb color |
| `trackSize` | number | No |  | Track height/width |
| `thumbSize` | number | No |  | Thumb size |
| `color` | ThemeColor | No |  | Color driving the active track, thumb, and active ticks. A palette token, `'primary.6'` shade syntax, or any CSS color. |
| `variant` | SliderVariant | No | 'default' | Visual variant of the slider track + thumb. Defaults to `'default'`. |
| `trackStyle` | StyleProp<ViewStyle> | No |  | Additional styling for the inactive track |
| `activeTrackStyle` | StyleProp<ViewStyle> | No |  | Additional styling for the active track |
| `thumbStyle` | StyleProp<ViewStyle> | No |  | Additional styling for the thumb |
| `tickColor` | ColorValue | No |  | Override inactive tick color |
| `activeTickColor` | ColorValue | No |  | Override active tick color |
| `tickStyle` | StyleProp<ViewStyle> | No |  | Style applied to inactive tick marks (merged on top of color/size defaults). |
| `activeTickStyle` | StyleProp<ViewStyle> | No |  | Style applied to active tick marks. |
| `tickLabelProps` | Omit<TextProps, 'children'> | No |  | Props applied to the `<Text>` rendered for each tick label (style, ff, weight, size, color). |
| `label` | React.ReactNode | No |  | Input label (above the slider) |
| `valueLabel` | ((value: number) => string) \| null | No |  | Value label formatter function, set to null to disable value label |
| `valueLabelAlwaysOn` | boolean | No | false | If true, value label will always be displayed |
| `valueLabelPosition` | 'top' \| 'bottom' \| 'left' \| 'right' | No |  | Where the value label sits relative to the thumb. For horizontal sliders: 'top' (above) or 'bottom' (below). For vertical: 'left' or 'right'. Defaults to 'top' / 'left'. |
| `valueLabelOffset` | number | No |  | Pixel gap between the thumb and the value label (default: 6 for top/bottom, 16 for left/right). |
| `valueLabelStyle` | StyleProp<ViewStyle> | No |  | Style applied to the value label wrapper (Card/View). |
| `valueLabelProps` | Omit<TextProps, 'children'> | No |  | Props applied to the value label `<Text>` (style, weight, ff, size, color). |
| `valueLabelAsCard` | boolean | No | true | When true (default) the value label is wrapped in a `<Card>`. Set to false to render only the bare `<Text>` for a flat tooltip. |
| `showMarks` | boolean | No |  | Show min/max labels |
| `ticks` | SliderTick[] | No |  | Custom ticks/marks to display on the slider |
| `containerSize` | number | No |  | Slider container size (width for horizontal, height for vertical) |
| `showTicks` | boolean | No | false | Whether to show automatic tick marks based on step |
| `restrictToTicks` | boolean | No | false | Restrict value changes to only tick positions |
| `inverted` | boolean | No |  | Inverted slider (right-to-left or top-to-bottom) |
| `precision` | number | No |  | Precision for value display |
| `tooltip` | 'always' \| 'hover' \| 'never' | No |  | Tooltip visibility |
| `fullWidth` | boolean | No | true | Make slider stretch to fill parent width/height |
| `disabled` | boolean | No | false | Whether input is disabled |
| `required` | boolean | No |  | Whether input is required |
| `placeholder` | string | No |  | Input placeholder |
| `error` | string | No |  | Error message |
| `helperText` | string | No |  | Helper text |
| `description` | string | No |  | Optional short description displayed directly under the label (above the field) |
| `size` | SizeValue | No | 'md' | Input size |
| `withAsterisk` | boolean | No |  | Whether to show required indicator |
| `name` | string | No |  | Input name for form integration |
| `startSection` | React.ReactNode | No |  | Left section content |
| `endSection` | React.ReactNode | No |  | Right section content |
| `style` | any | No |  | Additional styling |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `accessibilityHint` | string | No |  | Accessibility hint |
| `testID` | string | No |  | Test ID for testing |
| `debounceMs` | number | No |  | Debounce delay for validation in milliseconds |
| `onFocus` | () => void | No |  | Focus handler |
| `onBlur` | () => void | No |  | Blur handler |
| `onEnter` | () => void | No |  | Enter key press handler |
| `clearable` | boolean | No |  | Show built-in clear button when input has value |
| `clearButtonLabel` | string | No |  | Accessible label for the clear button |
| `onClear` | () => void | No |  | Callback when the clear button is pressed |
| `keyboardFocusId` | string | No |  | Identifier used with KeyboardManagerProvider to request refocus |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field label `<Text>` (style, weight, ff, etc.) |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field description `<Text>` |
| `placeholderTextColor` | string | No |  | Color of the placeholder text. Falls back to `theme.text.muted`. |
| `startSectionProps` | Omit<ViewProps, 'children'> | No |  | Props applied to the wrapping `<View>` around `startSection` (style, accessibility, etc.). |
| `endSectionProps` | Omit<ViewProps, 'children'> | No |  | Props applied to the wrapping `<View>` around `endSection`. |
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
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basic Usage
ID: `Slider.basic` • Tags: basic, slider • Category: usage • Status: stable • Since: 1.0.0

Basic slider usage for selecting numeric values within a range.

```tsx
const [value, setValue] = useState(25);
  return (
    <Block fullWidth>
      <Slider
        value={value}
        onChange={setValue}
        min={0}
        max={100}
      />
    </Block>
  );
}
```

### Slider variants
ID: `Slider.variants` • Tags: variants, slider, styling • Category: usage • Status: stable • Since: 1.0.0

```tsx
const VARIANTS = ['default', 'filled', 'outline', 'minimal', 'segmented', 'unstyled'] as const;
  const [value, setValue] = useState(40);
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Slider
          key={variant}
          label={variant}
          variant={variant}
          value={value}
          onChange={setValue}
          min={0}
          max={100}
          step={5}
          showTicks={variant === 'segmented'}
          restrictToTicks={variant === 'segmented'}
          fullWidth
        />
      ))}
    </Block>
  );
}
```

### Ticks and Marks
ID: `Slider.ticks` • Tags: ticks, marks, scale • Category: usage • Status: stable • Since: 1.0.0

Slider with visible tick marks and labeled values for better precision.

```tsx
const [value, setValue] = useState(50);
  return (
    <Block w={400}>
      <Slider
        value={value}
        onChange={setValue}
        min={0}
        max={100}
        showTicks
        restrictToTicks
        ticks={[
          { value: 0, label: 'Min' },
          { value: 25 },
          { value: 50, label: 'Mid' },
          { value: 75 },
          { value: 100, label: 'Max' },
        ]}
      />
    </Block>
  );
}
```

### Range Slider
ID: `Slider.range` • Tags: range, multiple, dual-thumb • Category: usage • Status: stable • Since: 1.0.0

Range slider for selecting a range of values with two handles on a single track. Perfect for filtering, price ranges, and any scenario where you need to select minimum and maximum values. Features demonstrated: - Basic range selection with two thumbs - Custom value formatting and labels - Tick marks and step increments - Minimum range constraints - Real-time range span calculation

```tsx
const [priceRange, setPriceRange] = useState<[number, number]>([25, 75]);
  const [temperatureRange, setTemperatureRange] = useState<[number, number]>([18, 24]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([60, 90]);
  return (
    <Block fullWidth>
       <Card>
        <Block>
          <Text size="lg" weight="semibold">Price Range</Text>
          <Block>
            <Flex justify="space-between">
              <Text size="sm">Min: ${priceRange[0]}</Text>
              <Text size="sm">Max: ${priceRange[1]}</Text>
            </Flex>
            <RangeSlider
              value={priceRange}
              onChange={setPriceRange}
              min={0}
              max={100}
              step={5}
              label="Price Filter ($)"
              showTicks
            />
            <Text size="sm" style={{ color: '#666' }}>
              Budget range: ${priceRange[1] - priceRange[0]}
            </Text>
          </Block>
        </Block>
        </Card>
      <Card>
        <Block>
          <Text size="lg" weight="semibold">Temperature Range</Text>
          <Block>
            <RangeSlider
              value={temperatureRange}
              onChange={setTemperatureRange}
              min={10}
              max={30}
              step={0.5}
              label="Comfortable Temperature (°C)"
              valueLabel={(value) => `${value}°C`}
              valueLabelAlwaysOn
            />
            <Text size="sm" style={{ color: '#666' }}>
              Range: {temperatureRange[0]}°C - {temperatureRange[1]}°C
            </Text>
          </Block>
        </Block>
      </Card>
    </Block>
  );
}
```

### Value label customization
ID: `Slider.valueLabel` • Tags: tooltip, valueLabel, valueLabelProps, valueLabelPosition, customization • Category: general • Status: stable • Since: 1.0.0

`valueLabelPosition` chooses where the thumb tooltip sits (`top` / `bottom` for horizontal, `left` / `right` for vertical). `valueLabelOffset` tunes the gap from the thumb. `valueLabelProps` accepts any `<Text>` props — `ff`, `weight`, `size`, `color`, `style` — and `valueLabelStyle` overrides the wrapper Card's style. Set `valueLabelAsCard={false}` for a flat tooltip with no Card chrome. Both `<Slider>` and `<RangeSlider>` accept the same set of props.

```tsx
const [a, setA] = useState(40);
  const [b, setB] = useState(60);
  const [c, setC] = useState(72);
  const [d, setD] = useState<[number, number]>([20, 80]);
  return (
    <Block>
      <Text weight="semibold">Value label position & styling</Text>
      <Block>
        <Text size="sm" color="muted">Default — tooltip above the thumb</Text>
        <Slider value={a} onChange={setA} valueLabelAlwaysOn />
      </Block>
      <Block>
        <Text size="sm" color="muted">valueLabelPosition="bottom"</Text>
        <Slider
          value={b}
          onChange={setB}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelOffset={2}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Custom Text styling — `ff`, `weight`, `size`, `color`
        </Text>
        <Slider
          value={c}
          onChange={setC}
          valueLabelAlwaysOn
          valueLabelProps={{
            ff: 'monospace',
            weight: '700',
            size: 'md',
            color: 'primary',
          }}
          valueLabel={(v) => `${Math.round(v)}%`}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Flat tooltip (no Card) with custom wrapper style
        </Text>
        <Slider
          value={c}
          onChange={setC}
          valueLabelAlwaysOn
          valueLabelAsCard={false}
          valueLabelStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
          valueLabelProps={{ ff: 'monospace', weight: '600', color: '#fff' }}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          RangeSlider — both thumbs share placement + styling
        </Text>
        <RangeSlider
          value={d}
          onChange={setD}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelProps={{ weight: '700', size: 'sm' }}
          valueLabel={(v, i) => (i === 0 ? `min ${Math.round(v)}` : `max ${Math.round(v)}`)}
        />
      </Block>
      <Block align="center" direction="row">
        <Block style={{ height: 200 }}>
            <Slider
              value={a}
              onChange={setA}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="left"
              valueLabelProps={{ weight: '700' }}
              minH={80}
            />
          </Block>
        <Block style={{ height: 200 }}>
            <Slider
              value={b}
              onChange={setB}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="right"
              valueLabelProps={{ weight: '700' }}
            />
            <Text size="xs" color="muted">right</Text>
          </Block>
      </Block>
    </Block>
  );
}
```

### Decimal steps & precision
ID: `Slider.precision` • Tags: precision, step, decimal, valueLabel, tooltip • Category: general • Status: stable • Since: 1.0.0

The thumb tooltip formats its value from the `step`: a fractional step like `0.01` shows two decimals, while an integer step rounds to a whole number (trailing zeros are trimmed, so `0.10` reads as `0.1`). Pass `precision` to force a fixed number of decimals regardless of the step.

```tsx
const [position, setPosition] = useState(0.25);
  const [temp, setTemp] = useState(21.5);
  const [ratio, setRatio] = useState(0.5);
  return (
    <Block>
      <Block>
        <Text size="sm" color="muted">
          Fractional `step={0.01}` — decimals are inferred from the step
        </Text>
        <Slider
          value={position}
          onChange={setPosition}
          min={0}
          max={1}
          step={0.01}
          valueLabelAlwaysOn
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          `step={0.5}` — half steps
        </Text>
        <Slider
          value={temp}
          onChange={setTemp}
          min={16}
          max={30}
          step={0.5}
          valueLabelAlwaysOn
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Force decimals with `precision={2}` (independent of step)
        </Text>
        <Slider
          value={ratio}
          onChange={setRatio}
          min={0}
          max={1}
          step={0.1}
          precision={2}
          valueLabelAlwaysOn
        />
      </Block>
    </Block>
  );
}
```

### Slot styling
ID: `Slider.slotStyling` • Tags: trackStyle, activeTrackStyle, thumbStyle, tickStyle, slot-props, customization • Category: general • Status: stable • Since: 1.0.0

Each visual layer of the slider is independently customizable: `trackStyle` and `activeTrackStyle` for the track halves, `thumbStyle` for the handle, `tickStyle` / `activeTickStyle` for tick marks, and `tickLabelProps` for tick labels. Per-tick `style` overrides on individual `ticks[i].style` win over the global tick styles. Combined with the value-label slot props (`valueLabelStyle`, `valueLabelProps`) you can fully reskin the slider without forking it.

```tsx
const milestoneTicks = [
  { value: 0, label: '0' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
];
const milestoneTicksWithHighlight = milestoneTicks.map((t) =>
  t.value === 50
    ? {
        ...t,
        // per-tick override wins over the global tickStyle / activeTickStyle
        style: {
          width: 4,
          height: 14,
          backgroundColor: '#facc15',
          borderRadius: 2,
          top: 11,
        },
      }
    : t,
);
  const [a, setA] = useState(35);
  const [b, setB] = useState(60);
  const [c, setC] = useState(50);
  const [d, setD] = useState<[number, number]>([20, 80]);
  return (
    <Block>
      <Text weight="semibold">Slot styling</Text>
      <Block>
        <Text size="sm" color="muted">
          Track + thumb overrides — taller track, square thumb
        </Text>
        <Slider
          value={a}
          onChange={setA}
          trackStyle={{ height: 10, borderRadius: 2 }}
          activeTrackStyle={{ height: 10, borderRadius: 2 }}
          thumbStyle={{ borderRadius: 4, borderWidth: 0 }}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Branded thumb — gradient-style fill via solid color + shadow
        </Text>
        <Slider
          value={b}
          onChange={setB}
          activeTrackColor="#10b981"
          thumbStyle={{
            backgroundColor: '#0ea5e9',
            borderColor: '#0369a1',
            borderWidth: 2,
            shadowColor: '#0ea5e9',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          }}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Tick + label styling (`tickStyle`, `activeTickStyle`, `tickLabelProps`)
        </Text>
        <Slider
          value={c}
          onChange={setC}
          ticks={milestoneTicks}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 12, borderRadius: 1.5, top: 12 }}
          tickLabelProps={{ ff: 'monospace', size: 'xs', weight: '700' }}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Per-tick override — the tick at 50 is taller and yellow
        </Text>
        <Slider
          value={c}
          onChange={setC}
          ticks={milestoneTicksWithHighlight}
          tickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          activeTickStyle={{ width: 3, height: 10, borderRadius: 1.5, top: 13 }}
          tickLabelProps={{ size: 'xs' }}
        />
      </Block>
      <Block>
        <Text size="sm" color="muted">
          RangeSlider — same slot props work on both thumbs and the active band
        </Text>
        <RangeSlider
          value={d}
          onChange={setD}
          ticks={milestoneTicks}
          activeTrackColor="#a855f7"
          trackStyle={{ height: 8, borderRadius: 4 }}
          activeTrackStyle={{ height: 8, borderRadius: 4 }}
          thumbStyle={{ backgroundColor: '#a855f7', borderColor: '#7e22ce', borderWidth: 2 }}
          tickStyle={{ width: 2, height: 8, top: 14 }}
          activeTickStyle={{ width: 2, height: 8, top: 14, backgroundColor: '#a855f7' }}
          tickLabelProps={{ size: 'xs', color: 'muted' }}
          valueLabelAlwaysOn
          valueLabelProps={{ weight: '700', size: 'sm' }}
        />
      </Block>
    </Block>
  );
}
```

### Vertical Orientation
ID: `Slider.vertical` • Tags: vertical, orientation • Category: usage • Status: stable • Since: 1.0.0

Vertical slider orientation for space-efficient layouts and different use cases.

```tsx
const [value, setValue] = useState(60);
  return (
    <Card>
      <Row gap={16} align="center">
        <Block style={{ height: 200 }}>
          <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            step={1}
            orientation="vertical"
          />
        </Block>
        <Block>
          <Text size="lg" weight="semibold">Vertical Slider</Text>
          <Text size="sm" style={{ color: '#666' }}>
            Value: {value}
          </Text>
        </Block>
      </Row>
    </Card>
  );
}
```

### CustomStyles
ID: `Slider.customStyles` • Category: general

Showcases how to restyle the Slider using the new color scheme, sizing, and style override props for both single-value and range scenarios.

```tsx
const [volume, setVolume] = useState(65);
  const [range, setRange] = useState<[number, number]>([20, 80]);
  return (
    <Block fullWidth>
      <Card>
        <Block>
          <Text size="lg" weight="semibold">Palette-driven slider</Text>
          <Text size="sm" style={{ color: '#555' }}>
            `colorScheme`, sizing overrides, and style props let the slider carry product branding.
          </Text>
          <Slider
            value={volume}
            onChange={setVolume}
            min={0}
            max={100}
            step={1}
            showTicks
            tickColor="rgba(52, 199, 89, 0.2)"
            activeTickColor="#34C759"
            color="success"
            trackSize={12}
            thumbSize={30}
            trackStyle={{ opacity: 0.25 }}
            activeTrackStyle={{
              shadowColor: '#34C759',
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
            thumbStyle={{ borderColor: '#1F5520', borderWidth: 3 }}
            valueLabel={(val) => `${Math.round(val)}%`}
            valueLabelAlwaysOn
            label="Success palette"
          />
          <Flex justify="space-between">
            <Text size="sm">Volume: {Math.round(volume)}%</Text>
            <Text size="sm" style={{ color: '#1F5520' }}>Styled thumb + ticks</Text>
          </Flex>
        </Block>
      </Card>
      <Card>
        <Block>
          <Text size="lg" weight="semibold">Custom range slider</Text>
          <Text size="sm" style={{ color: '#555' }}>
            RangeSlider shares the same overrides, making it easy to mix palettes per context.
          </Text>
          <RangeSlider
            value={range}
            onChange={setRange}
            min={0}
            max={120}
            step={5}
            showTicks
            color="warning"
            trackSize={10}
            thumbSize={26}
            trackStyle={{ opacity: 0.2 }}
            activeTrackStyle={{ opacity: 0.55 }}
            thumbStyle={{ borderColor: '#B45309', borderWidth: 2 }}
            tickColor="rgba(251, 191, 36, 0.25)"
            activeTickColor="#F59E0B"
            valueLabel={(val, idx) => `${idx === 0 ? 'Min' : 'Max'} ${val}`}
            valueLabelAlwaysOn
            label="Warning palette"
          />
          <Flex justify="space-between">
            <Text size="sm">Range: {range[0]} – {range[1]}</Text>
            <Text size="sm" style={{ color: '#B45309' }}>Custom palette + styles</Text>
          </Flex>
        </Block>
      </Card>
    </Block>
  );
}
```
