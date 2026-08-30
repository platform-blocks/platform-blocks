# Ring

The Ring component displays progress or status using a radial indicator. It supports custom labels, color stops, neutral states, and fully customized center content.

## Metadata

- Canonical name: `Ring`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Ring } from '@platform-blocks/react-ui-library';`
- Category: feedback
- Tags: ring, progress, indicator, radial
- Docs: https://react-ui-library.com/components/Ring
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Ring

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | Yes |  | Current value represented by the ring |
| `min` | number | No | 0 | Lower bound for normalization. Defaults to 0. |
| `max` | number | No | 100 | Upper bound for normalization. Defaults to 100. |
| `size` | number | No | 100 | Diameter of the ring in pixels. Defaults to 100. |
| `thickness` | number | No | 12 | Stroke thickness in pixels. Defaults to 12. |
| `caption` | React.ReactNode | No |  | Optional caption rendered beneath the ring |
| `label` | React.ReactNode | No |  | Main label rendered in the ring center |
| `subLabel` | React.ReactNode | No |  | Secondary label rendered below the main label |
| `showValue` | boolean | No | true | Displays the computed percentage when no label/subLabel is provided. Defaults to true. |
| `valueFormatter` | (value: number, percent: number) => React.ReactNode | No |  | Formats the displayed value or percentage |
| `trackColor` | string | No |  | Track color behind the progress stroke |
| `progressColor` | string \| ((value: number, percent: number) => string) | No |  | Progress stroke color or resolver |
| `colorStops` | RingColorStop[] | No |  | Optional color stops evaluated against the computed percent |
| `neutral` | boolean | No | false | Forces the ring into a neutral state, disabling the progress stroke |
| `roundedCaps` | boolean | No | true | Controls whether the progress stroke has rounded caps. Defaults to true. |
| `style` | StyleProp<ViewStyle> | No |  | Container style for the outer wrapper |
| `ringStyle` | StyleProp<ViewStyle> | No |  | Style applied to the ring wrapper |
| `contentStyle` | StyleProp<ViewStyle> | No |  | Style applied to the center content container |
| `labelStyle` | StyleProp<TextStyle> | No |  | Style overrides for the main label |
| `subLabelStyle` | StyleProp<TextStyle> | No |  | Style overrides for the secondary label |
| `captionStyle` | StyleProp<TextStyle> | No |  | Style overrides for the caption |
| `labelColor` | string | No |  | Color override for the main label |
| `subLabelColor` | string | No |  | Color override for the secondary label |
| `captionColor` | string | No |  | Color override for the caption |
| `children` | React.ReactNode \| ((context: RingRenderContext) => React.ReactNode) | No |  | Custom center content. Receives value info when passed as a function |
| `testID` | string | No |  | Test identifier for end-to-end tests |
| `accessibilityLabel` | string | No |  | Accessibility label describing the ring |
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

### Interactive Presets
ID: `Ring.basic` • Tags: ring • Category: usage • Status: stable • Since: 1.0.0

Drive multiple ring presentations from a single stateful value and expose how sizing and labels adapt.

```tsx
const [value, setValue] = useState(72);
  return (
    <Block align="center" gap="md">
      <Row gap="lg" align="center">
        <Ring value={value} caption="Completion" />
        <Ring value={value} size={72} thickness={8} caption="Compact" />
      </Row>
      <Row gap="sm">
        <Button variant="outline" onPress={() => setValue(Math.max(0, value - 10))}>
          -10%
        </Button>
        <Button onPress={() => setValue(Math.min(100, value + 10))}>+10%</Button>
      </Row>
    </Block>
  );
}
```

### Dynamic Color Stops
ID: `Ring.color-stops` • Tags: ring • Category: styling • Status: stable • Since: 1.0.0

Display how `colorStops` shift the progress color as values cross threshold ranges.

```tsx
const colorStops = [
  { value: 0, color: '#f87171' },
  { value: 60, color: '#f59e0b' },
  { value: 90, color: '#14b8a6' },
];
  return (
    <Row gap="lg" justify="center" wrap="wrap">
      {[48, 72, 97].map((value) => (
        <Ring key={value} value={value} colorStops={colorStops} caption={`${value}%`} />
      ))}
    </Row>
  );
}
```

### Custom Center Content
ID: `Ring.custom-content` • Tags: ring • Category: customization • Status: stable • Since: 1.0.0

Showcase the render-prop API for injecting icons, text, or status badges inside the ring.

```tsx
return (
    <Row gap="lg" justify="center" wrap="wrap">
      <Ring value={86} caption="Pipeline">
        {({ percent }) => (
          <Block align="center">
            <Icon name="rocket" size="lg" color="primary" />
            <Text weight="700">{Math.round(percent)}%</Text>
          </Block>
        )}
      </Ring>
      <Ring value={0} neutral caption="Design system">
        <Block align="center">
          <Icon name="clock" size="lg" color="gray" />
          <Text size="xs" color="secondary">
            On hold
          </Text>
        </Block>
      </Ring>
    </Row>
  );
}
```
