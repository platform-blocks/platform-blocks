# SegmentedControl

Segmented controls present a small set of exclusive options. The indicator animates between segments with support for horizontal and vertical layouts, optional auto contrast for filled variants, and reduced motion awareness for accessibility.

## Metadata

- Canonical name: `SegmentedControl`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { SegmentedControl } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 1.0.0
- Category: input
- Tags: input, segmentation, toggle, selection
- Docs: https://react-ui-library.com/components/SegmentedControl
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/SegmentedControl

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | SegmentedControlData[] | Yes |  | Data that defines the segments |
| `value` | string | No |  | Controlled value |
| `defaultValue` | string | No |  | Uncontrolled initial value |
| `onChange` | (value: string) => void | No |  | Called when value changes |
| `size` | SizeValue | No |  | Control size, maps to height and font size |
| `color` | string | No |  | Indicator color token or hex |
| `orientation` | 'horizontal' \| 'vertical' | No |  | Layout orientation |
| `fullWidth` | boolean | No |  | Stretch across available width |
| `disabled` | boolean | No |  | Disable entire control |
| `readOnly` | boolean | No |  | Prevent user interaction but keep visual state |
| `autoContrast` | boolean | No |  | Adjust text color automatically for filled/outline variants |
| `withItemsBorders` | boolean | No |  | Render dividers between items |
| `transitionDuration` | number | No |  | Indicator transition duration (ms) |
| `transitionTimingFunction` | string | No |  | Indicator transition easing |
| `name` | string | No |  | Optional radio group name hint |
| `variant` | 'default' \| 'filled' \| 'outline' \| 'ghost' | No |  | Visual style variant |
| `indicatorStyle` | StyleProp<ViewStyle> | No |  | Custom style for indicator |
| `itemStyle` | StyleProp<ViewStyle> | No |  | Custom style applied to every item |
| `style` | StyleProp<ViewStyle> | No |  | Style applied to the container |
| `testID` | string | No |  | Test identifier applied to container |
| `accessibilityLabel` | string | No |  | Accessibility label for the entire control |
| `label` | ReactNode | No |  | Optional label rendered alongside the control |
| `description` | ReactNode | No |  | Supplementary description text rendered with the label |
| `labelPosition` | 'left' \| 'right' \| 'top' \| 'bottom' | No |  | Placement of the label relative to the control |
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
ID: `SegmentedControl.basic` • Tags: segmented-control, selection, uncontrolled • Category: basics • Status: stable • Since: 1.0.0

Set `defaultValue` to preselect a segment and let the control manage focus and selection state internally.

```tsx
return (
    <SegmentedControl defaultValue="react" data={frameworks} />
  );
}
```

### Controlled Value
ID: `SegmentedControl.controlled` • Tags: segmented-control, controlled, state • Category: usage • Status: stable • Since: 1.0.0

Provide `value` and `onChange` to synchronize the selected segment with external state or companion controls.

```tsx
const [value, setValue] = useState('react');
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Drive the segmented control from external state to synchronize its value with other inputs.
        </Text>
        <SegmentedControl value={value} onChange={setValue} data={frameworks} />
        <Text size="xs" color="secondary">
          Selected value: <Text as="span" weight="600">{value}</Text>
        </Text>
        <Row gap="sm" wrap="wrap">
          <Button size="xs" onPress={() => setValue('react')}>
            Select React
          </Button>
          <Button size="xs" variant="outline" onPress={() => setValue('angular')}>
            Select Angular
          </Button>
          <Button size="xs" variant="outline" onPress={() => setValue('vue')}>
            Select Vue
          </Button>
        </Row>
      </Block>
    </Card>
  );
}
```

### Sizes
ID: `SegmentedControl.sizes` • Tags: segmented-control, sizes, density • Category: layout • Status: stable • Since: 1.0.0

Use the `size` prop to match dense toolbars or spacious layouts without changing the underlying data.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" color="secondary">{size}</Text>
          <SegmentedControl size={size} data={frameworkNames} defaultValue="React" />
        </Block>
      ))}
    </Block>
  );
}
```

### Full Width
ID: `SegmentedControl.full-width` • Tags: segmented-control, layout, full-width • Category: layout • Status: stable • Since: 1.0.0

Apply `fullWidth` to let segments expand and distribute evenly across the available horizontal space.

```tsx
return (
    <SegmentedControl fullWidth defaultValue="preview" data={panes} />
  );
}
```

### Orientation
ID: `SegmentedControl.orientation` • Tags: segmented-control, layout, orientation • Category: layout • Status: stable • Since: 1.0.0

Toggle the `orientation` prop to rotate the control vertically for sidebars or keep it horizontal for toolbars.

```tsx
return (
      <Block>
        <Row gap="lg" align="flex-start" wrap="wrap">
          <SegmentedControl
            label="Horizontal (default)"
            orientation="horizontal"
            defaultValue="react"
            data={frameworks}
          />
          <SegmentedControl
            label="Vertical"
            orientation="vertical"
            defaultValue="code"
            data={panes}
          />
        </Row>
      </Block>
  );
}
```

### Custom Colors
ID: `SegmentedControl.colors` • Tags: segmented-control, colors, theming • Category: theming • Status: stable • Since: 1.0.0

Set the `color` prop to pull semantic tokens or pass custom values, and enable `autoContrast` when you need readable labels on vivid fills.

```tsx
const palettes = [
  { key: 'primary', color: 'primary', defaultValue: 'react', data: frameworks },
  { key: 'success', color: 'success', defaultValue: 'code', data: panes },
  { key: 'purple', color: 'purple', defaultValue: 'settings', data: accountSections },
  { key: 'custom', color: '#FF6B6B', defaultValue: 'medium', data: priorities },
];
  return (
    <Block>
      {palettes.map((palette) => (
        <SegmentedControl
          key={palette.key}
          defaultValue={palette.defaultValue}
          color={palette.color}
          data={palette.data}
        />
      ))}
    </Block>
  );
}
```

### Interaction States
ID: `SegmentedControl.states` • Tags: segmented-control, states, disabled, readonly • Category: behavior • Status: stable • Since: 1.0.0

Combine `disabled`, `readOnly`, or per-item `disabled` flags to signal availability without changing layout or selection rules.

```tsx
const scenarios = [
  { key: 'default', label: 'Interactive', props: {}, defaultValue: 'react', data: frameworks },
  { key: 'disabled', label: 'Disabled', props: { disabled: true }, defaultValue: 'code', data: panes },
  { key: 'readOnly', label: 'Read only', props: { readOnly: true }, defaultValue: 'medium', data: priorities },
  // `languages` carries the disabled flag on its last item.
  { key: 'itemDisabled', label: 'Single option disabled', props: {}, defaultValue: 'typescript', data: languages },
];
  return (
    <Card p="md">
      <Block>
        <Block>
          {scenarios.map((scenario) => (
            <SegmentedControl
              key={scenario.key}
              label={scenario.label}
              defaultValue={scenario.defaultValue}
              data={scenario.data}
              {...scenario.props}
            />
          ))}
        </Block>
      </Block>
    </Card>
  );
}
```

### Visual Variants
ID: `SegmentedControl.variants` • Tags: segmented-control, variants, styling • Category: theming • Status: stable • Since: 1.0.0

Choose between `default`, `filled`, `outline`, or `ghost` variants and pair them with semantic `color` tokens to match the surrounding surface.

```tsx
const variants = [
  {
    key: 'default',
    label: 'Default',
    props: { variant: 'default' as const },
    defaultValue: 'react',
    description: 'Baseline segmented control with tonal contrast.',
    data: frameworks,
  },
  {
    key: 'filledPrimary',
    label: 'Filled',
    props: { variant: 'filled' as const, color: 'primary' as const },
    defaultValue: 'code',
    description: 'Solid background that matches the selected color token.',
    data: panes,
  },
  {
    key: 'filledContrast',
    label: 'Filled with auto-contrast',
    props: {
      variant: 'filled' as const,
      color: 'warning' as const,
      autoContrast: true,
    },
    defaultValue: 'medium',
    description: 'Enable autoContrast when using vivid palettes to keep labels legible.',
    data: priorities,
  },
  {
    key: 'outline',
    label: 'Outline',
    props: { variant: 'outline' as const, color: 'secondary' as const },
    defaultValue: 'weekly',
    description: 'Focus on outlining the chosen tab while keeping the surface quiet.',
    data: cadences,
  },
  {
    key: 'ghost',
    label: 'Ghost',
    props: { variant: 'ghost' as const, color: 'success' as const },
    defaultValue: 'published',
    description: 'Ghost removes the segment background until selection, ideal on tinted surfaces.',
    data: publishStates,
  },
];
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Change the variant to match the surface and emphasis level of the surrounding layout.
        </Text>
        <Block>
          {variants.map((variant) => (
            <Block key={variant.key}>
              <Text size="xs" color="secondary">
                {variant.label}
              </Text>
              <SegmentedControl
                defaultValue={variant.defaultValue}
                data={variant.data}
                {...variant.props}
              />
              <Text size="xs" color="muted">
                {variant.description}
              </Text>
            </Block>
          ))}
        </Block>
      </Block>
    </Card>
  );
}
```
