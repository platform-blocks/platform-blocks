# Knob

Comprehensive rotary input supporting behavior presets, value labels, split progress, and the new tick-layer system.

## Behavior vs. variant

Two independent axes:

- **`behavior`** — *what kind of control* it is: `level` (default), `stepped`, `endless`, `dual`, `status`. Drives mode, mark snapping, and which readouts appear.
- **`variant`** — *how it looks*: `default`, `minimal`, `digital`, `retro`, `studio`. Drives stroke weights, caps, body fill, and which indicator carries the value.

They compose freely — `<Knob behavior="stepped" variant="retro" />` is a detented dial in a hardware skin.

```tsx
<Knob variant="studio" behavior="level" value={value} onChange={setValue} />
```

| variant | look |
| --- | --- |
| `default` | stock dial: neutral ring, accent thumb, no arm |
| `minimal` | hairline track and a small dot, no body or arm; for dense panels |
| `digital` | a 128-segment collar that lights as the value climbs, butt caps, square glowing marker |
| `retro` | solid body with a bevel border and a stubby indicator arm, no rim dot |
| `studio` | chunky track with a bright filled arc and an outlined rim dot |

Variants take their colors from the theme and the accent rather than shipping palettes, so the same knob reads correctly in light and dark and never fights a brand. Every value a variant sets is a default: the preset is merged *under* `appearance`, so you can retune one property without opting out of the preset.

```tsx
// retro's thickness, caps, body, and arm — with a different ring color
<Knob variant="retro" appearance={{ ring: { color: '#b45309' } }} />
```

`variant` used to carry the behavior values. Passing one there still works and warns in development; rename `variant="stepped"` to `behavior="stepped"`.

## Tick layers

Configure `appearance.ticks` with one or more layers derived from marks, steps, explicit values, or a fixed count:

- `source`: `'marks' | 'steps' | 'values' | 'count'`
- `count`: with `source: 'count'`, how many evenly spaced ticks to lay around the arc — a fixed-resolution collar that ignores `step` and `marks`, so it reads the same whether the knob runs 0–1 or 0–360. Capped at 512.
- `shape`: `'dot' | 'line' | 'icon' | 'custom'`
- `position`, `radiusOffset`, `length`, `width`: geometry controls
- `activeMode`: `'fill'` (default) lights every tick up to the value like a meter; `'nearest'` lights only the tick the pointer is aimed at, like a selector. Set per layer, and matched by angle so it wraps at the seam of a full circle and works on endless knobs.
- `color` / `inactiveColor`: lit and unlit colors — see below
- `label`: show/format labels per tick
- `renderTick`: custom React output

Example:

```tsx
ticks: [
  { source: 'marks', shape: 'line', label: { show: true } },
  { source: 'steps', values: [0, 10, 20], shape: 'dot', radiusOffset: -8 },
]
```

### Coloring ticks individually

A layer's `color` and `inactiveColor` take one color for the whole layer, or a resolver called per tick — `({ value, index, angle, isActive, mark }) => string | undefined`. Returning `undefined` falls through to the usual defaults, so a resolver can restyle a few ticks and leave the rest alone.

For `source: 'marks'`, a mark's own `accentColor` already colors its lit tick, so per-detent colors need no resolver at all. `appearance.accentFromMarks` then hands that same color to the knob itself — thumb, arm, and progress arc — so the control matches the detent it is sitting on. (`behavior="status"` does this already; the flag opts other behaviors in.)

```tsx
<Knob
  marks={[
    { value: 0, accentColor: '#f87171' },
    { value: 1, accentColor: '#4ade80' },
    { value: 2, accentColor: '#38bdf8' },
  ]}
  restrictToMarks
  appearance={{
    accentFromMarks: true,
    ticks: [
      {
        source: 'marks',
        shape: 'line',
        activeMode: 'nearest',
        // Unlit ticks keep their own hue, dimmed.
        inactiveColor: ({ mark }) => (mark?.accentColor ? `${mark.accentColor}44` : undefined),
      },
    ],
  }}
/>
```

## Compound parts

Use `Knob.Root` together with the exported statics to declaratively control every visual layer. Each child simply merges into the `appearance` map, so you can reorder, swap, or disable layers without rewriting the component internals.

```tsx
<Knob.Root value={value} onChange={setValue} appearance={{ arc: { startAngle: -120, sweepAngle: 240 } }}>
  <Knob.Fill color="#0f172a" />
  <Knob.Ring thickness={22} color="#1f2937" trailColor="#0f172a" />
  <Knob.RingSegment value={60} color="#166534" />
  <Knob.RingSegment value={40} color="#7f1d1d" />
  <Knob.Progress mode="split" thickness={12} roundedCaps />
  <Knob.TickLayer source="marks" shape="line" length={18} label={{ show: true }} />
  <Knob.Pointer visible length={72} width={3} color="#f8fafc" />
  <Knob.Thumb size={24} strokeWidth={2} strokeColor="#0f172a" />
  <Knob.ValueLabel position="center" formatter={(val) => `${Math.round(val)}%`} />
</Knob.Root>
```

Available parts:

- `Knob.Fill` – inner disk styling with solid colors and borders.
- `Knob.Ring` – primary stroke layer with independent thickness and colors.
- `Knob.RingSegment` – one colored band of a segmented ring. Repeat it the way you would stack `Progress.Section`s: each segment covers `value` units of the knob's range, laid end to end from `min`, so on a 0–100 knob the values read as percentages. Anything the segments leave uncovered keeps the plain ring color. By default the bands are a static backdrop with the progress arc drawn on top; `appearance.ring.segmentMode: 'progress'` instead makes them the progress arc itself, clipped at the current value. Equivalent to `appearance.ring.segments`.
- `Knob.Progress` – contiguous or split progress arc; set `visible={false}` to remove it.
- `Knob.TickLayer` – add one or more tick/label tiers derived from marks, steps, or explicit values.
- `Knob.Pointer` – the arm anchored at the knob center. Opt-in: adding the part (or `appearance.pointer`) draws it, reaching from the center out to the thumb by default. Tune it with `length`/`width`/`color`/`cap`/`offset`/`counterweight`, or drop it again with `visible={false}`.
- `Knob.Thumb` – rotary handle marker (can be hidden for pointer-driven designs).
- `Knob.ValueLabel` – center or external readouts, including secondary lines.

`Knob.Root` accepts all `Knob` props, so you can opt into the low-level API only when you need bespoke layouts.

## Keyboard & assistive tech

The knob takes focus on web (`tabIndex=0`) and reports itself as an adjustable slider with its current value, so it is operable without a pointer:

| Key | Effect |
| --- | --- |
| `←` `↓` / `→` `↑` | one `step` (horizontal arrows swap under RTL) |
| `shift` + arrow | ten steps |
| `PageUp` / `PageDown` | a tenth of the range |
| `Home` / `End` | `min` / `max` (ignored on endless knobs, which have no ends) |

On a knob with `restrictToMarks`, arrows move between adjacent marks rather than by `step` — a step-sized nudge would usually re-snap to the detent it started on. Every keypress commits, so `onChangeEnd` fires alongside `onChange`; `disabled` and `readOnly` knobs ignore keys entirely.

Physical keys are web-only. On native the same moves are exposed as `increment`/`decrement` accessibility actions, which is how VoiceOver and TalkBack drive an adjustable control.

## Press state

While the knob is being scrubbed, the thumb grows to `appearance.thumb.activeScale` (default `1.25`) and settles back on release, so the control acknowledges the grab under your finger. Set `activeScale: 1` to switch it off, or below `1` to shrink instead.

The scale rides in the same `transform` array as the thumb's position — one style key can only be set once, so a second `transform` would replace the position rather than compose with it — and it is applied after the translation, which is what makes the thumb grow in place rather than drift outward. Custom thumbs get the same signal: `renderThumb` receives `isScrubbing` alongside `value`, `angle`, and `size`.

The change is instant in both directions rather than eased. `transform` carries the position too, so a transition on it would smear the thumb behind the pointer during a drag — and behind the wheel in `scroll` mode, where the value moves without a press at all.

## Interaction modes

Enable spin, slide, and scroll gestures through `appearance.interaction`:

- `modes`: opt into `'spin'`, `'vertical-slide'`, `'horizontal-slide'`, and `'scroll'` simultaneously.
- `lockThresholdPx` / `variancePx`: tune how quickly slide gestures lock to an axis.
- `slideDominanceRatio`: require that one axis exceeds the other (default ~1.35×) before committing to a slide, making circular spins easier.
- `slideRatio`: convert linear drag distance into rotary degrees.
- `spinStopAtLimits`: keep bounded knobs from wrapping when spinning so they behave like sliders with hard stops.
- `tapToSet`: jump to the pressed angle on mouse-down and start scrubbing from there, so the knob tracks the pointer for the rest of the gesture without waiting out `lockThresholdPx`. Defaults to `true`; set it to `false` if the knob should only respond to turning. Endless knobs ignore it, since an angle there has no absolute value. Knobs without `'spin'` in `modes` still resolve the value on release instead.
- `tapDeadRadiusRatio`: fraction of the radius around the centre where presses are ignored, because a few pixels of movement there swing the angle wildly. Defaults to `0.15`. Presses inside it fall through to the slide modes, which is how vertical/horizontal drags stay reachable on a knob that otherwise scrubs on press.
- `scroll`: `{ enabled, ratio, invert, preventPageScroll }` configures wheel behavior. `preventPageScroll` defaults to `true` so mouse wheels don’t bubble up to the parent `ScrollView`.

Presses that land in the uncovered gap of a partial arc (for example the bottom wedge of a 270° knob) are ignored rather than snapped to the nearest end, so a mis-hit can’t slam the value to a limit.

Example:

```tsx
appearance={{
  interaction: {
    modes: ['spin', 'vertical-slide', 'horizontal-slide', 'scroll'],
    lockThresholdPx: 32,
    slideRatio: 1.5,
    spinStopAtLimits: true,
    scroll: { enabled: true, ratio: 0.75, preventPageScroll: true },
  },
}}
```