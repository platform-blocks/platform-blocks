# RollingNumber

RollingNumber displays a number and animates every digit that changes, rolling it to its new position. Use it for counters, live totals, prices and metric readouts where the change itself is part of the information.

## Metadata

- Canonical name: `RollingNumber`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { RollingNumber } from '@platform-blocks/react-ui-library';`
- Category: display
- Tags: number, counter, animation, odometer, metric
- Docs: https://react-ui-library.com/components/RollingNumber
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/RollingNumber

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | number | Yes |  | Value to display. Each digit that changes rolls to its new position. |
| `prefix` | string | No |  | Static text rendered before the number (e.g. `"$ "`). |
| `suffix` | string | No |  | Static text rendered after the number (e.g. `" USD"`). |
| `thousandSeparator` | boolean \| string | No | false | `true` for `,`, or an explicit separator string. |
| `decimalSeparator` | string | No | '.' | Character between the integer and decimal parts. Default `.`. |
| `decimalScale` | number | No |  | Number of decimal places to render. |
| `fixedDecimalScale` | boolean | No | false | Pad the decimal part with zeros up to `decimalScale`. |
| `transitionDuration` | number | No |  | Roll duration in ms. Default `600`. `0` — and an active reduced-motion preference — snap straight to the new digits. |
| `animationDuration` | number | No |  | alias for `transitionDuration`. |
| `timingFunction` | RollingNumberTimingFunction | No | 'ease' | Easing curve for the roll. Default `ease`. |
| `stagger` | number | No | 0 | Per-column delay in ms, applied right-to-left so the least significant digit leads. Default `0` (all columns move together). |
| `animateOnMount` | boolean | No | false | Animate from zero on first render instead of appearing settled. Default `false`. |
| `size` | SizeValue | No | 'md' | Font size token or explicit number. Default `'md'`. |
| `color` | string | No |  | Text color. Accepts theme palette syntax (`'primary.6'`, `'dimmed'`) or any CSS color. |
| `c` | string | No |  | Shorthand alias for `color`, resolved identically. `color` wins when both are set. |
| `weight` | TextStyle['fontWeight'] \| 'normal' \| 'medium' \| 'semibold' \| 'bold' | No |  | Font weight. |
| `fontFamily` | string | No |  | Custom font family. |
| `ff` | string | No |  | Shorthand alias for `fontFamily`. |
| `tabularNums` | boolean | No | true | Use tabular (fixed-width) figures so columns do not shift width as digits change. Default `true`. |
| `style` | StyleProp<ViewStyle> | No |  | Style for the row that wraps prefix, digits and suffix. |
| `textStyle` | StyleProp<TextStyle> | No |  | Style applied to every glyph — digits, separators, prefix and suffix. |
| `digitStyle` | StyleProp<TextStyle> | No |  | Style applied to digit glyphs only. |
| `accessibilityLabel` | string | No |  | Screen-reader label. Defaults to the formatted value including prefix and suffix, so the rolling columns never have to be read digit by digit. |
| `testID` | string | No |  |  |
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
ID: `RollingNumber.basic` • Tags: basic, counter, number • Category: basics • Status: stable • Since: 1.1.0

A counter whose digits roll to their new positions. Only the columns that changed move.

```tsx
const [value, setValue] = useState(1234);
  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber value={value} size={48} weight="bold" thousandSeparator />
      <Flex gap="sm">
        <Button variant="outline" onPress={() => setValue((current) => current - 1)}>-1</Button>
        <Button variant="outline" onPress={() => setValue((current) => current + 1)}>+1</Button>
        <Button onPress={() => setValue(Math.floor(Math.random() * 100000))}>Random</Button>
      </Flex>
    </Flex>
  );
}
```

### Currency
ID: `RollingNumber.currency` • Tags: currency, prefix, suffix, decimals • Category: features • Status: stable • Since: 1.1.0

`prefix`, `suffix` and the decimal options cover currency formatting without an external formatter. Copying the value on web yields the formatted string, not the digit strips.

```tsx
const [total, setTotal] = useState(1299.99);
  return (
    <Flex direction="column" align="center" gap="md">
      <RollingNumber
        value={total}
        prefix="$ "
        suffix=" USD"
        decimalScale={2}
        fixedDecimalScale
        thousandSeparator
        size={36}
        weight="semibold"
      />
      <Button variant="outline" onPress={() => setTotal((current) => current + 149.5)}>
        Add item
      </Button>
    </Flex>
  );
}
```

### Timing
ID: `RollingNumber.timing` • Tags: animation, duration, easing, stagger • Category: features • Status: stable • Since: 1.1.0

`transitionDuration`, `timingFunction` and `stagger` shape the roll. Stagger delays each column right-to-left, so the carries trail the ones place the way an odometer does.

```tsx
const [value, setValue] = useState(407219);
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="xs">
        <Text size="xs" c="dimmed">Snappy — 200ms, no stagger</Text>
        <RollingNumber value={value} transitionDuration={200} size={32} thousandSeparator />
      </Flex>
      <Flex direction="column" gap="xs">
        <Text size="xs" c="dimmed">Odometer — 900ms, 60ms stagger</Text>
        <RollingNumber
          value={value}
          transitionDuration={900}
          timingFunction="ease-out"
          stagger={60}
          size={32}
          thousandSeparator
        />
      </Flex>
      <Button variant="outline" onPress={() => setValue(Math.floor(Math.random() * 999999))}>
        Shuffle
      </Button>
    </Flex>
  );
}
```

### Live metric
ID: `RollingNumber.live-metric` • Tags: metric, dashboard, live • Category: examples • Status: stable • Since: 1.1.0

A ticking metric tile. Values that change faster than the roll retarget mid-flight rather than snapping.

```tsx
const [requests, setRequests] = useState(84213);
  useEffect(() => {
    const timer = setInterval(() => {
      setRequests((current) => current + Math.floor(Math.random() * 40));
    }, 1200);
    return () => clearInterval(timer);
  }, []);
  return (
    <Card p="lg" style={{ minWidth: 220 }}>
      <Flex direction="column" gap="xs">
        <Text size="xs" c="dimmed" uppercase>Requests today</Text>
        <RollingNumber
          value={requests}
          thousandSeparator
          size={40}
          weight="bold"
          transitionDuration={500}
          stagger={40}
        />
      </Flex>
    </Card>
  );
}
```
