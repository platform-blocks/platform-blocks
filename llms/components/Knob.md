# Knob

The Knob component provides a rotary control for adjusting values with touch, mouse, and keyboard input. It supports snapping to marks, internal value labels, and accessible field headers for external labels.

## Metadata

- Canonical name: `Knob`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Knob } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: knob, dial, rotary, gesture, input
- Docs: https://react-ui-library.com/components/Knob
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Knob

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `behavior` | KnobBehavior | No | 'level' | What kind of control this is: how it behaves and what it reads out. @default 'level' |
| `variant` | KnobVariant | No | 'default' | Visual style preset. Merged under `appearance`, so single properties stay overridable. Behavior values (`level`, `stepped`, …) still work here at runtime but are deprecated — pass them to `behavior` instead. @default 'default' |
| `mode` | 'bounded' \| 'endless' | No |  | Interaction mode for bounded or endless rotary behavior |
| `value` | number | No |  | Controlled value |
| `defaultValue` | number | No |  | Uncontrolled initial value |
| `min` | number | No |  | Minimum selectable value |
| `max` | number | No |  | Maximum selectable value |
| `step` | number | No |  | Step increment applied when interacting |
| `onChange` | (value: number) => void | No |  | Called on every value change |
| `onChangeEnd` | (value: number) => void | No |  | Called after interaction completes |
| `onScrubStart` | () => void | No |  | Fired when the user begins dragging |
| `onScrubEnd` | () => void | No |  | Fired when the user ends dragging |
| `size` | ComponentSizeValue | No |  | Size token (`xs`–`3xl`) or an explicit diameter in pixels |
| `thumbSize` | number | No |  | Diameter of the thumb indicator, in pixels. Defaults to a ratio of the resolved size. |
| `disabled` | boolean | No |  | Disable all user interaction |
| `readOnly` | boolean | No |  | Prevent interaction but keep visual state |
| `formatLabel` | (value: number) => ReactNode | No |  | Custom formatter for the value label |
| `withLabel` | boolean | No |  | Render the value label inside the knob |
| `valueLabel` | KnobValueLabelConfig \| false | No |  | Structured configuration for the value label block |
| `marks` | KnobMark[] | No |  | Optional marks rendered around the control |
| `restrictToMarks` | boolean | No |  | Restrict interaction to the supplied marks |
| `label` | ReactNode | No |  | Optional visual label rendered outside the knob |
| `description` | ReactNode | No |  | Optional helper text rendered with the label |
| `labelPosition` | 'left' \| 'right' \| 'top' \| 'bottom' | No |  | Placement for the external label |
| `style` | StyleProp<ViewStyle> | No |  | Style overrides for the outer container |
| `trackStyle` | StyleProp<ViewStyle> | No |  | Style overrides for the circular track |
| `thumbStyle` | StyleProp<ViewStyle> | No |  | Style overrides for the thumb |
| `markLabelStyle` | StyleProp<TextStyle> | No |  | Style overrides for mark labels |
| `testID` | string | No |  | Accessibility identifier |
| `accessibilityLabel` | string | No |  | Screen reader label |
| `appearance` | KnobAppearance | No |  | Unified surface styling and interaction overrides |
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

### Basic
ID: `Knob.basic` • Tags: basic, knob, control • Category: basics • Status: experimental • Since: 1.0.0

Controlled knob with percentage formatting and a mirrored readout below the dial.

```tsx
const [value, setValue] = useState(90);
  return (
    <Knob
      value={value}
      onChange={setValue}
      valueLabel={{
        formatter: (current) => Math.round(current),
        suffix: '°',
      }}
    />
  );
}
```

### Events
ID: `Knob.events` • Tags: events, scrubbing, callbacks • Category: behavior • Status: experimental • Since: 1.0.0

Demonstrates live value, committed value, and scrubbing lifecycle callbacks.

```tsx
const [value, setValue] = useState(32);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [committed, setCommitted] = useState(value);
  return (
    <Block direction="row" align="center" justify="space-evenly">
      <Knob
        value={value}
        onChange={setValue}
        onChangeEnd={setCommitted}
        onScrubStart={() => setIsScrubbing(true)}
        onScrubEnd={() => setIsScrubbing(false)}
      />
      <DataList
        data={[
          { label: 'Current', value: Math.round(value) },
          { label: 'Last commit', value: Math.round(committed) },
          { label: 'State', value: isScrubbing ? 'Scrubbing' : 'Idle' },
        ]}
      />
    </Block>
  );
}
```

### Visual Variants
ID: `Knob.variants` • Tags: variant, style, preset • Category: variants • Status: experimental • Since: 1.0.0

`variant` picks the dial's look, independent of `behavior`. Each preset sets stroke weights, caps, body fill, and which indicator carries the value, taking its colors from the theme so the same knob reads correctly in light and dark. Presets are merged *under* `appearance`, so any single property stays overridable.

```tsx
const VARIANTS: { variant: KnobVariant; blurb: string }[] = [
  { variant: 'default', blurb: 'Stock dial' },
  { variant: 'minimal', blurb: 'Hairline, dense UIs' },
  { variant: 'digital', blurb: 'Hard edges, lit marker' },
  { variant: 'retro', blurb: 'Solid body, indicator arm' },
  { variant: 'studio', blurb: 'Plugin rack' },
];
  const [value, setValue] = useState(62);
  return (
    <Block fullWidth direction="row" justify="space-between">
        {VARIANTS.map(({ variant, blurb }) => (
          <Block key={variant} align="center" gap="xs">
            <Knob
              value={value}
              onChange={setValue}
              variant={variant}
            />
            <Text size="sm" weight="600">{variant}</Text>
          </Block>
        ))}
    </Block>
  );
}
```

### Endless
ID: `Knob.endless` • Tags: endless, encoder, rotation • Category: variants • Status: experimental • Since: 1.0.0

Endless mode resets the dial each turn while tracking the cumulative rotation value.

```tsx
const [value, setValue] = useState(0);
  const normalizedAngle = useMemo(() => ((value % 360) + 360) % 360, [value]);
  const rotations = useMemo(() => value / 360, [value]);
  return (
    <Block fullWidth>
      <Knob
        value={value}
        onChange={setValue}
        behavior="endless"
        valueLabel={{
          formatter: () => `${Math.round(normalizedAngle)}°`,
          secondary: {
            formatter: () => `${rotations.toFixed(2)} turns`,
          },
        }}
      />
    </Block>
  );
}
```

### Dual Readout
ID: `Knob.dual-readout` • Tags: dual, valueLabel • Category: variants • Status: experimental • Since: 1.1.0

Demonstrates the `dual` behavior with a center frequency label and a derived percentage below the knob.

```tsx
const [cutoff, setCutoff] = useState(3200);
  const percent = useMemo(() => Math.round(((cutoff - 200) / (8000 - 200)) * 100), [cutoff]);
  return (
    <Block fullWidth>
      <Knob
        value={cutoff}
        onChange={setCutoff}
        min={200}
        max={8000}
        step={50}
        behavior="dual"
        size={180}
        valueLabel={{
          position: 'center',
          formatter: (val) => `${Math.round(val)} Hz`,
          secondary: {
            position: 'bottom',
            formatter: () => `${percent}% span`,
          },
        }}
        marks={[
          { value: 400, label: 'Warm' },
          { value: 1200, label: 'Neutral' },
          { value: 6400, label: 'Bright' },
        ]}
      />
    </Block>
  );
}
```

### Status Selector
ID: `Knob.status-selector` • Tags: status, behavior • Category: variants • Status: experimental • Since: 1.1.0

Highlights the `status` behavior with icon-enhanced marks, accent colors, and the active scene named directly beneath the icon in the center slot.

```tsx
const [value, setValue] = useState(0);
  const statusMarks = useMemo(
    () => STATUS_SCENES.map(scene => ({
      ...scene,
      icon: <Icon name={scene.iconName} size="3xl" color={scene.accentColor} />,
    })),
    []
  );
  const activeStatus = useMemo(
    () => statusMarks.reduce((closest, mark) => (
      Math.abs(mark.value - value) < Math.abs(closest.value - value) ? mark : closest
    ), statusMarks[0]),
    [statusMarks, value]
  );
  return (
    <Block>
      <Knob
        value={value}
        onChange={setValue}
        min={0}
        max={360}
        step={90}
        my="3xl"
        marks={statusMarks}
        restrictToMarks
        behavior="status"
        size={200}
        valueLabel={{
          position: 'center',
          formatter: () => activeStatus.label,
        }}
      />
    </Block>
  );
}
```

### Segmented Progress
ID: `Knob.segment-progress` • Tags: segments, progress, ring, gauge • Category: features • Status: experimental • Since: 1.0.0

The same bands with `ring.segmentMode: 'progress'`, which makes them the progress arc itself: they stop at the current value and nothing is drawn beyond it, so the fill runs through each color in turn.

```tsx
const ZONES = [
  { value: 60, color: '#22c55e' },
  { value: 25, color: '#f59e0b' },
  { value: 15, color: '#ef4444' },
];
  const [load, setLoad] = useState(72);
  return (
    <Block align="center">
      <Knob
        value={load}
        onChange={setLoad}
        variant="minimal"
        max={100}
        appearance={{
          arc: { startAngle: -135, sweepAngle: 270 },
          ring: {  segments: ZONES, segmentMode: 'progress' },
          fill: { radiusOffset: -20 },
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val)}%` }}
      />
    </Block>
  );
}
```

### Tick Selector
ID: `Knob.tick-selector` • Tags: ticks, selector, detent, active • Category: features • Status: experimental • Since: 1.0.0

A twelve-position rotary switch using `activeMode: 'nearest'`, which lights only the tick the pointer is aimed at. The default `'fill'` instead lights every tick up to the value, the way a meter fills.

```tsx
// Twelve detents on a full circle. `max` is 12 rather than 11 so position 11 sits one step
// short of the top instead of overlapping position 0. Each detent carries its own
const POSITIONS = POSITION_COLORS.map((accentColor, index) => ({ value: index, accentColor }));
  const [position, setPosition] = useState(3);
  return (
    <Block >
      <Knob
        value={position}
        onChange={setPosition}
        min={0}
        max={12}
        marks={POSITIONS}
        restrictToMarks
        appearance={{
          accentFromMarks: true,
          ticks: [
            {
              source: 'marks',
              shape: 'line',
              // Only the detent the arm is aimed at lights up. The default 'fill' would
              // instead light every tick from 0 up to the current position.
              activeMode: 'nearest',
              length: 14,
              width: 20,
              position: 'outer',
              inactiveColor: ({ mark }) => (mark?.accentColor ? `${mark.accentColor}44` : '#475569'),
            },
          ],
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val) + 1}` }}
      />
    </Block>
  );
}
```

### Compound Panning
ID: `Knob.compound-panning` • Category: general

Stereo-style panning knob composed with `Knob.Root`, split progress, and custom tick labels to highlight the compound sub-component API.

```tsx
// The split arc reads the same on both sides of center: direction is carried by which way
// the arc grows and by the L/R label, not by a color change.
const PAN_COLOR = '#4ade80';
  const [pan, setPan] = useState(-18);
  const readout = useMemo(() => {
    if (pan === 0) return 'Center';
    return pan > 0 ? `Right ${Math.abs(pan)}` : `Left ${Math.abs(pan)}`;
  }, [pan]);
  return (
    <Block align="center">
      <Knob.Root
        min={-100}
        max={100}
        value={pan}
        onChange={setPan}
        step={1}
        size={220}
        appearance={{
          arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
          panning: {
            pivotValue: 0,
            positiveColor: PAN_COLOR,
            negativeColor: PAN_COLOR,
          },
        }}
      >
        <Knob.Fill
          radiusOffset={-28}
          color="#0f172a"
          borderWidth={2}
          borderColor="rgba(148, 163, 184, 0.4)"
        />
        <Knob.Ring color="#0f172a" trailColor="#1f2937" />
        <Knob.Progress mode="split" thickness={14} roundedCaps />
        <Knob.Thumb  color="#f8fafc" strokeWidth={3} strokeColor="#0f172a" />
        <Knob.ValueLabel
          position="center"
          formatter={(value) => `${value > 0 ? 'R' : value < 0 ? 'L' : ''}${Math.abs(Math.round(value))}`}
          textStyle={{ fontSize: 30, fontWeight: '700', color: '#f8fafc' }}
        />
      </Knob.Root>
      <Text size="sm" color="secondary">
        Stereo balance · {readout}
      </Text>
    </Block>
  );
}
```

### Pointer Clock
ID: `Knob.pointer-clock` • Category: general

Read-only analog clock face built with the compound `Knob.Root` API: a bezel ring, 60 minute marks with bolder hour marks, hour numerals, and `Knob.Pointer` as the hour hand driven by the value (minutes past 12). The minute and second hands are plain rotated views composed over the same center, synced to the system clock each second.

```tsx
const SIZE = 240;
const CENTER = SIZE / 2;
const MINUTES_PER_TURN = 12 * 60;
const HOUR_VALUES = Array.from({ length: 12 }, (_, index) => index * 60);
const HOUR_LABELS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
// 60 minute marks around the dial; hour positions are drawn by the layer above.
const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index * 12).filter(
  (value) => value % 60 !== 0
);
const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  return `${hour === 0 ? 12 : hour}:${(minutes % 60).toString().padStart(2, '0')}`;
};
/** Hand pivoting on the dial center: the wrapper is twice the hand length, so it rotates around it. */
const Hand = ({
  angle,
  length,
  width,
  color,
  tail = 0,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  tail?: number;
}) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      left: CENTER - width / 2,
      top: CENTER - length,
      width,
      height: length * 2,
      transform: [{ rotate: `${angle}deg` }],
    }}
  >
    <View
      style={{
        width,
        height: length + tail,
        borderRadius: width / 2,
        backgroundColor: color,
      }}
    />
  </View>
);
  const theme = useTheme();
  const face = theme.backgrounds.surface;
  const ink = theme.text.primary;
  const accent = theme.colors.primary[6];
  // Start on a fixed time so server-rendered and client markup match, then sync on mount.
  const [time, setTime] = useState({ minutes: 10 * 60 + 10, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        minutes: (now.getHours() % 12) * 60 + now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Block align="center" gap="sm">
      <View style={{ width: SIZE, height: SIZE }}>
        <Knob.Root
          min={0}
          max={MINUTES_PER_TURN}
          value={time.minutes}
          size={SIZE}
          readOnly
          withLabel={false}
          accessibilityLabel={`Clock showing ${formatTime(time.minutes)}`}
          appearance={{
            arc: { startAngle: 0, sweepAngle: 360, clampInput: true },
          }}
        >
          <Knob.Ring thickness={12} color={ink} trailColor={ink} backgroundColor={face} />
          {/* Chapter ring just inside the minute marks */}
          <Knob.Fill
            color={face}
            radiusOffset={-18}
            borderWidth={1}
            borderColor={theme.backgrounds.border}
          />
          <Knob.Progress visible={false} />
          <Knob.Thumb visible={false} />
          <Knob.TickLayer
            source="values"
            values={MINUTE_VALUES}
            shape="line"
            length={6}
            width={1.5}
            position="inner"
            color={theme.text.muted}
            inactiveColor={theme.text.muted}
          />
          <Knob.TickLayer
            source="values"
            values={HOUR_VALUES}
            shape="line"
            length={12}
            width={3}
            position="inner"
            color={ink}
            inactiveColor={ink}
            label={{
              show: true,
              formatter: (_, index) => HOUR_LABELS[index],
              position: 'inner',
              offset: -26,
              style: { color: ink, fontSize: 15, fontWeight: '600' },
            }}
          />
          {/* Hour hand — the knob value is minutes past 12, so it advances gradually. */}
          <Knob.Pointer visible length={58} width={6} color={ink} counterweight={{ size: 12, color: ink }} />
        </Knob.Root>
        <Hand angle={((time.minutes % 60) / 60) * 360} length={88} width={4} color={ink} />
        <Hand angle={(time.seconds / 60) * 360} length={94} width={1.5} color={accent} tail={18} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: CENTER - 4,
            top: CENTER - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: accent,
          }}
        />
      </View>
      <Text size="xl" weight="700">
        {formatTime(time.minutes)}
      </Text>
    </Block>
  );
}
```

### Semicircle Gauge
ID: `Knob.semicircle-gauge` • Category: general

Semicircle gauge layout that uses `Knob.Root` with custom ring thickness, contiguous progress, and a pointer hand for instrumentation-style readouts.

```tsx
const TEMPERATURE_STOPS = [0, 25, 50, 75, 100];
  const [level, setLevel] = useState(62);
  const status = useMemo(() => {
    if (level >= 85) return 'Critical';
    if (level >= 60) return 'Elevated';
    if (level >= 35) return 'Nominal';
    return 'Idle';
  }, [level]);
  return (
    <Block align="center">
      <Knob.Root
        min={0}
        max={100}
        value={level}
        onChange={setLevel}
        step={1}
        size={260}
        appearance={{
          arc: { startAngle: -120, sweepAngle: 240, clampInput: true },
          interaction: { spinStopAtLimits: true },
        }}
      >
        <Knob.Fill visible={false} />
        <Knob.Ring thickness={30} color="#0f172a" trailColor="#1f2937" radiusOffset={-4} />
        <Knob.RingSegment value={35} color="#1e3a8a" />
        <Knob.RingSegment value={25} color="#155e75" />
        <Knob.RingSegment value={25} color="#854d0e" />
        <Knob.RingSegment value={15} color="#7f1d1d" />
        <Knob.Progress
          mode="contiguous"
          thickness={14}
          color="#22d3ee"
          roundedCaps
        />
        <Knob.TickLayer
          source="values"
          values={TEMPERATURE_STOPS}
          shape="line"
          length={22}
          width={3}
          position="outer"
          radiusOffset={10}
          label={{
            show: true,
            formatter: (_, index) => `${TEMPERATURE_STOPS[index]}%`,
            offset: 24,
            style: { color: '#cbd5f5', fontSize: 12, fontWeight: '600' },
          }}
        />
        <Knob.Pointer length={90} width={4} color="#f8fafc" offset={-8} cap="round" />
        <Knob.Thumb visible={false} />
        <Knob.ValueLabel
          position="bottom"
          formatter={(value) => `${Math.round(value)}% capacity`}
          textStyle={{ fontSize: 18, fontWeight: '600', color: '#f8fafc' }}
          secondary={{
            formatter: () => status,
            position: 'bottom',
            textStyle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
          }}
        />
      </Knob.Root>
      <Text size="sm" color="secondary">
        Thermal headroom · {status}
      </Text>
    </Block>
  );
}
```

### Tick Layers
ID: `Knob.tick-layers` • Category: general

Stacks two tick layers on one dial: labelled lines driven by `marks`, over a finer dot scale from an explicit step list.

```tsx
const LEVEL_MARKS = [
  { value: 0, label: 'Mute' },
  { value: 25, label: 'Low' },
  { value: 50, label: 'Mid' },
  { value: 75, label: 'High' },
  { value: 100, label: 'Max' },
];
  const [level, setLevel] = useState(48);
  return (
    <Block align="center">
      <Knob
        value={level}
        onChange={setLevel}
        min={0}
        max={100}
        step={1}
        marks={LEVEL_MARKS}
        size={180}
        appearance={{
          // A full circle would put the 0 and 100 marks on the same point, overprinting
          // their labels; the 270deg arc gives each end of the scale its own position.
          arc: { startAngle: -135, sweepAngle: 270 },
          ring: { thickness: 16 },
          fill: { radiusOffset: -24 },
          progress: { mode: 'contiguous', color: '#f97316' },
          ticks: [
            // Two layers over the same dial: labelled lines from `marks`, and a finer
            // dot scale from an explicit step list underneath them.
            {
              source: 'marks',
              shape: 'line',
              length: 16,
              width: 3,
              position: 'outer',
              label: { show: true, position: 'outer' },
            },
            {
              source: 'steps',
              values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
              shape: 'dot',
              radiusOffset: -6,
              color: '#475569',
              inactiveColor: 'rgba(71, 85, 105, 0.4)',
            },
          ],
        }}
        valueLabel={{ formatter: (val) => `${Math.round(val)}%` }}
      />
    </Block>
  );
}
```

### Interaction modes
ID: `Knob.interaction-modes` • Tags: interaction, gestures, scroll • Category: behavior • Status: experimental • Since: 1.0.0

Showcases spin, vertical-slide, horizontal-slide, and scroll gestures enabled through `appearance.interaction`, updating the label as each mode locks in.

```tsx
const MODES = [
  {
    key: 'spin',
    name: 'Spin',
    detail: 'Drag in a circular path. Move away from the thumb for finer adjustments.',
  },
  {
    key: 'vertical-slide',
    name: 'Vertical slide',
    detail: 'Grab either side of the knob and drag up or down for mixer-style throws.',
  },
  {
    key: 'horizontal-slide',
    name: 'Horizontal slide',
    detail: 'Start above or below the center, then drag left or right for sideways sweeps.',
  },
  {
    key: 'scroll',
    name: 'Scroll',
    detail: 'Hover with a mouse or trackpad and use the wheel/two-finger scroll.',
  },
] as const;
type ModeName = (typeof MODES)[number]['key'];
const MODE_LABELS: Record<ModeName, string> = MODES.reduce((acc, mode) => {
  acc[mode.key] = mode.name;
  return acc;
}, {} as Record<ModeName, string>);
  const theme = useTheme();
  const [value, setValue] = useState(12);
  const [activeMode, setActiveMode] = useState<ModeName | null>(null);
  return (
    <Block fullWidth>
      <Row gap="xl" align="center" wrap="wrap">
        <Block align="center">
          <Text size="sm" weight="500">
            Multimodal control
          </Text>
          <Knob
            value={value}
            onChange={setValue}
            min={-100}
            max={100}
            step={1}
            size={180}
            behavior="endless"
            valueLabel={{
              position: 'center',
              formatter: (current) => `${current > 0 ? '+' : ''}${Math.round(current)}`,
              secondary: {
                position: 'bottom',
                formatter: () => (activeMode ? `${MODE_LABELS[activeMode]} mode` : 'Try a gesture'),
              },
            }}
            appearance={{
              arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
              ring: { thickness: 16, color: '#0f172a', trailColor: '#1e293b' },
              fill: { color: '#020617', radiusOffset: -14 },
              progress: {
                mode: 'split',
                roundedCaps: true,
                thickness: 10,
                color: '#38bdf8',
                trailColor: '#475569',
              },
              interaction: {
                modes: MODES.map((mode) => mode.key),
                lockThresholdPx: 32,
                slideRatio: 1.5,
                variancePx: 6,
                spinPrecisionRadius: 80,
                respectStartSide: true,
                scroll: { enabled: true, ratio: 0.8, preventPageScroll: true },
                onModeChange: setActiveMode,
              },
            }}
          />
        </Block>
        <Block style={{ minWidth: 140, flex: 1 }}>
          <DataList spacing="2xl" labelWidth={140}>
            {MODES.map((mode) => (
              <DataList.Item key={mode.key}>
                {/* The mode currently driving the knob is pulled up to full-contrast text. */}
                <DataList.ItemLabel
                  color={activeMode === mode.key ? theme.text.primary : theme.text.muted}
                >
                  {mode.name}
                </DataList.ItemLabel>
                <DataList.ItemValue color={theme.text.secondary}>{mode.detail}</DataList.ItemValue>
              </DataList.Item>
            ))}
          </DataList>
        </Block>
      </Row>
    </Block>
  );
}
```
