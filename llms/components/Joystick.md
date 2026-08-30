# Joystick

Joystick is a two-axis positional input. In its default `circle` shape it behaves like a physical stick — the handle rides the rim at full deflection and springs back to centre when released. As a `square` it becomes an XY pad: each axis clamps on its own so the corners are reachable, and the handle stays where it is left.

Both axes are normalized to −1…1. `y` is up-positive by default, matching how a gamepad axis reads; pass `invertY={false}` to follow screen space instead.

`deadZone` zeroes small deflections and rescales what is left, so the value still spans the full range past the threshold rather than jumping to the dead-zone size. `step` snaps each axis, `lockAxis` restricts travel to one direction, and `showCrosshair` adds accent rules that track the handle — the usual XY-pad readout.

The gesture runs on the shared `useDragGesture` hook, which means a drag that leaves the pad keeps tracking the finger instead of handing the touch back to the page. Arrow keys nudge by `keyboardStep` on web, `Home` and `Escape` recentre, and VoiceOver/TalkBack get increment and decrement actions.

## Metadata

- Canonical name: `Joystick`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Joystick } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: joystick, xy, pad, gesture, two-axis, input
- Docs: https://react-ui-library.com/components/Joystick
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Joystick

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | JoystickValue | No |  | Controlled value. Both axes are normalized to −1…1. |
| `defaultValue` | JoystickValue | No |  | Initial value while uncontrolled. Default `{ x: 0, y: 0 }`. |
| `onChange` | (value: JoystickValue) => void | No |  | Fired for every position change, including each frame of a drag. |
| `onChangeEnd` | (value: JoystickValue) => void | No |  | Fired once when the gesture ends, with the value it settled on. |
| `onChangeStart` | (value: JoystickValue) => void | No |  | Fired when a drag or keyboard interaction begins. |
| `shape` | JoystickShape | No | 'circle' | `circle` clamps the handle to a disc — a stick. `square` clamps each axis on its own so the corners are reachable — an XY pad. Default `circle`. |
| `returnToCenter` | boolean | No |  | Spring the handle back to the centre when released, the way a physical stick does. Defaults to `true` for `circle` and `false` for `square`. |
| `lockAxis` | 'x' \| 'y' | No |  | Restrict travel to a single axis. |
| `deadZone` | number | No | 0 | Report `0` until the handle travels this far from centre (0–1). Default `0`. |
| `step` | number | No | 0 | Snap each axis to this increment. Default `0` (continuous). |
| `keyboardStep` | number | No |  | Increment applied by a single arrow key press. Defaults to `step` or `0.1`. |
| `invertY` | boolean | No | true | Report a positive `y` when the handle is pushed up. Default `true`. |
| `size` | ComponentSizeValue | No | 'md' | Outer size in px, or a size token. Default `'md'`. |
| `handleSize` | number | No |  | Handle diameter in px. Defaults to ~32% of `size`. |
| `variant` | JoystickVariant | No | 'default' | Visual preset. Default `'default'`. |
| `color` | string | No |  | Accent color: a palette token (`'primary'`), `'primary.6'` shade syntax, or any CSS color. |
| `baseColor` | string | No |  | Base surface color override. |
| `handleColor` | string | No |  | Handle color override. |
| `showGuides` | boolean | No | true | Draw the static centre guides. Default `true`. |
| `showCrosshair` | boolean | No | false | Draw accent rules that track the handle on each axis — the XY-pad readout. Default `false`. |
| `valueLabel` | boolean \| ((value: JoystickValue) => string) | No | false | Render the current value under the pad. Pass a function to format it. |
| `label` | React.ReactNode | No |  | Field label rendered above the pad. |
| `disabled` | boolean | No | false | Ignore all input and dim the control. |
| `readOnly` | boolean | No | false | Ignore all input while keeping full contrast. |
| `transitionDuration` | number | No |  | Spring-back / keyboard transition duration in ms. Default `220`. |
| `style` | StyleProp<ViewStyle> | No |  | Root style. |
| `baseStyle` | StyleProp<ViewStyle> | No |  | Style for the pad surface. |
| `handleStyle` | StyleProp<ViewStyle> | No |  | Style for the handle. |
| `valueLabelStyle` | StyleProp<TextStyle> | No |  | Style for the value label text. |
| `accessibilityLabel` | string | No |  |  |
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
ID: `Joystick.basic` • Tags: basic, joystick, stick • Category: basics • Status: stable • Since: 1.1.0

A stick that springs back to centre on release. Drag anywhere on the pad — the gesture keeps tracking even when the finger leaves it.

```tsx
const [value, setValue] = useState({ x: 0, y: 0 });
  return (
    <Joystick
      value={value}
      onChange={setValue}
      showCrosshair
      valueLabel
    />
  );
}
```

### XY pad
ID: `Joystick.xy-pad` • Tags: xy, pad, square, filter • Category: variants • Status: stable • Since: 1.1.0

`shape="square"` clamps each axis independently so the corners are reachable, and the handle holds its position on release — the shape a filter or effect pad wants.

```tsx
const [value, setValue] = useState({ x: -0.4, y: 0.6 });
  // Map the pad onto a pair of parameters the way an effect unit would.
  const cutoff = Math.round(((value.x + 1) / 2) * 18000 + 200);
  const resonance = ((value.y + 1) / 2).toFixed(2);
  return (
    <Flex direction="column" gap="md">
      <Joystick
        shape="square"
        size="lg"
        value={value}
        onChange={setValue}
        showCrosshair
        label="Filter"
      />
      <Text size="sm" c="dimmed">Cutoff {cutoff} Hz · Resonance {resonance}</Text>
    </Flex>
  );
}
```

### Dead zone and steps
ID: `Joystick.dead-zone` • Tags: deadZone, step, snapping • Category: features • Status: stable • Since: 1.1.0

`deadZone` ignores small deflections around centre and rescales the rest, so full travel still reports 1. `step` snaps each axis onto a grid.

```tsx
const [free, setFree] = useState({ x: 0, y: 0 });
  const [stepped, setStepped] = useState({ x: 0, y: 0 });
  return (
    <Flex gap="xl" wrap="wrap">
      <Joystick
        label="Dead zone 0.25"
        deadZone={0.25}
        value={free}
        onChange={setFree}
        valueLabel
      />
      <Joystick
        label="Step 0.25"
        shape="square"
        step={0.25}
        returnToCenter={false}
        value={stepped}
        onChange={setStepped}
        showCrosshair
        valueLabel
      />
    </Flex>
  );
}
```

### Axis lock
ID: `Joystick.axis-lock` • Tags: lockAxis, single-axis, pan • Category: features • Status: stable • Since: 1.1.0

`lockAxis` restricts travel to one direction. A single-axis pad also leaves the perpendicular direction to the page, so vertical scrolling still works over a horizontal control.

```tsx
const [pan, setPan] = useState({ x: 0, y: 0 });
  const position = pan.x === 0
    ? 'Center'
    : `${pan.x < 0 ? 'L' : 'R'} ${Math.round(Math.abs(pan.x) * 100)}`;
  return (
    <Flex direction="column" gap="md" align="flex-start">
      <Joystick
        label="Pan"
        lockAxis="x"
        size="sm"
        value={pan}
        onChange={setPan}
      />
      <Text size="sm" c="dimmed">{position}</Text>
    </Flex>
  );
}
```
