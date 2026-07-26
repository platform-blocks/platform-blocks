# Knob Customization Spec

## Background

The current `<Knob>` supports multiple behaviors (level, stepped, endless, dual, status — the `behavior` prop, formerly `variant`) with marks, value labels, and theme-driven colors. However, its visual surface is still fairly fixed: a single-width gray ring, a thumb that always rides the ring centerline, simple dot marks, and full-circle geometry. To unlock richer UI/UX scenarios (music production knobs, accessibility-friendly controls, branded theming), we need a more composable styling system that lets product teams control every visible layer without forking the component.

## Goals

- Expressive styling hooks for ring, inner fill, thumb, tick marks, and optional clock-style pointer.
- Support partial arcs (start/end angles or semicircle sweeps) without breaking existing bounded/endless math.
- Provide progress coloring similar to sliders, including split progress for bi-directional/panning knobs.
- Allow marks/ticks to become icons, lines, or custom React nodes positioned inside/on/outside the ring with individual labels.
- Support Apple-style control modes (spin, vertical slide, horizontal slide, scroll) so knobs feel great with touch, mouse, and trackpad input.
- Keep simple use-cases ergonomic; defaults should auto-configure from behaviors and theme tokens.
- Prepare the component for modular sub-components so design systems can reorder or replace layers when needed.

## Non-goals

- Rewriting gesture logic (PanResponder/reanimated) beyond what is necessary to accommodate new geometry.
- Building fully custom animations per brand; instead we expose hooks so teams can supply their own via render props.
- Supporting arbitrary SVG path knobs in v1 (future work once the layer API is proven).

## Visual variants

`variant` selects a named preset — `default`, `minimal`, `digital`, `retro`, `studio` — resolved in `variants.ts` as a `KnobAppearance` built from the theme, the resolved size, and the accent color. Presets are merged *under* the caller's `appearance` by `mergeKnobAppearance`, one layer deep: caller keys win per property, `false`/`null` removes a layer outright, and arrays (`ticks`, `ring.segments`) replace rather than concatenate. Presets never define their own palette — color comes from the theme so variants survive theming and dark mode.

## Proposed API

Introduce a new optional `appearance` prop that encapsulates visual knobs. Existing props (`thumbSize`, `trackStyle`, etc.) remain for backward compatibility but will internally map into the new structures.

```ts
export interface KnobAppearance {
  ring?: KnobRingStyle;
  fill?: KnobFillStyle;
  thumb?: KnobThumbStyle | false;
  ticks?: KnobTickLayer | KnobTickLayer[] | false;
  pointer?: KnobPointerStyle | false; // the centre arm, opt-in; omitted or `false` leaves it off
  arc?: KnobArcConfig;
  progress?: KnobProgressConfig | false;
  panning?: KnobPanningConfig;
  interaction?: KnobInteractionConfig;
}
```

### Interaction modes (spin, slides, combo)

Apple’s GarageBand knobs expose three distinct gestures—spin, vertical slide, horizontal slide—and let users mix them (plus scroll input). The “Apple’s Three Ways to Turn a Virtual Knob” article and the open-source [`jherrm/knobs`](https://github.com/jherrm/knobs/blob/main/Knob.js) implementation document the math and heuristics we should mirror. We need similar multimodal control that works with React Native touch, React Native Web mouse/trackpad, and hybrid devices. The new `KnobInteractionConfig` centralizes those options.

```ts
type KnobInteractionMode = 'spin' | 'vertical-slide' | 'horizontal-slide' | 'scroll';

interface KnobInteractionConfig {
  modes?: KnobInteractionMode[]; // defaults to spin + both slides
  lockThresholdPx?: number; // distance before we lock into a gesture axis
  variancePx?: number; // allowable perpendicular wiggle before lock resets (default ≈5px)
  slideDominanceRatio?: number; // how much larger a primary axis must be before we pick a slide (default ≈1.35x)
  slideRatio?: number; // pixels → degrees conversion for slide modes
  slideHysteresisPx?: number; // ignore minuscule slide deltas to prevent jitter
  spinStopAtLimits?: boolean; // stop spin gestures at min/max instead of wrapping (bounded mode only)
  spinDeadZoneDegrees?: number; // ignore tiny angular deltas to keep the thumb from jittering
  spinPrecisionRadius?: number; // when dragging beyond the thumb, increase precision
  respectStartSide?: boolean; // toggles GarageBand rule: right/down = clockwise, left/down = counter-clockwise
  tapToSet?: boolean; // mouse-down jumps to that angle and starts scrubbing (default true, bounded only)
  tapDeadRadiusRatio?: number; // fraction of the radius around the centre where presses are ignored (default 0.15)
  scroll?: { enabled?: boolean; ratio?: number; invert?: boolean; preventPageScroll?: boolean };
  onModeChange?: (mode: KnobInteractionMode | null) => void; // useful for analytics, haptics
}

When the knob isn’t in endless mode, slide gestures now scale their degree math to the configured `arc.sweepAngle`, so semicircle gauges react proportionally to finger travel instead of assuming a full 360° rotation.
```

| Mode | Behavior | Implementation notes |
| --- | --- | --- |
| `spin` | Classic circular drag. Users can drag away from the knob to gain leverage. | Keep using polar math (`atan2`). Delay lock-in until ~12px of movement to avoid hijacking taps. If `spinPrecisionRadius` is set, stretch the virtual radius as the pointer moves outward, similar to Knob.js’s “followFinger”. |
| `vertical-slide` | Drag straight up/down; knob rotates multiple turns without lifting. Direction is based on which side of the knob the drag began (start on right half → drag down = clockwise). | Track starting quadrant, compute `deltaAngle = deltaY * slideRatio`, flip sign using the horizontal half. Lock into this mode when `abs(deltaY)` dominates `abs(deltaX)` by `slideDominanceRatio` and lateral jitter remains under `variancePx`. |
| `horizontal-slide` | Drag left/right; direction determined by starting above vs below the center. | Same lock logic but axes swapped. Particularly helpful when knobs are stacked vertically but the user’s wrist prefers sideways motion. |
| `scroll` | Mouse wheel or trackpad two-finger scroll adjusts the value without grabbing the knob. | On web, listen for `wheel` and `pointermove` while hovered. Multiply the delta by `scroll.ratio`, flipping sign based on cursor quadrant so clockwise/counter-clockwise feels natural. Set `scroll.preventPageScroll` (defaults to `true`) to call `preventDefault()`/`stopPropagation()` and keep the parent `ScrollView` from moving. |
#### Gesture locking & multi-input support

`spinStopAtLimits` augments the `spin` mode for bounded knobs—set it to `true` to create slider-like hard stops so the value won’t wrap past `min`/`max` during a spin until the user reverses direction. Pair it with `spinDeadZoneDegrees` (defaults to ~0.8°) to filter out tiny finger tremors that otherwise make the readout flicker, and `slideHysteresisPx` (defaults to <2px depending on `slideRatio`) to damp jitter when nudging vertically or horizontally.

#### Gesture locking & multi-input support

- **Lock detection**: mimic Knob.js—start in a neutral state, accumulate `totalDistance`, and once we exceed `lockThresholdPx` commit to the dominant axis. If vertical and horizontal magnitudes are both high, fall back to spin.
- **Quadrant-aware direction**: vertical slides compare the initial x-position to the center; horizontal slides compare the initial y-position. This mirrors Apple’s “turn the side you grabbed” heuristic and feels natural regardless of handedness.
- **Parallel adjustments**: PanResponder already exposes multiple touches; vertical slide mode enables “one finger per knob” adjustments like in the article. We must avoid global listeners that would cancel other knobs while a slide is active.
- **Pointer capture**: on web, call `event.target.setPointerCapture` during `onPointerDown` so rapid slides don’t lose focus. Native touch continues through PanResponder.
- **Scroll & keyboard**: when `scroll.enabled`, apply deltas from mouse wheel, trackpad, or even hardware dial events. Respect accessibility by mapping keyboard arrows/PageUp/PageDown to the same `slideRatio` increments.
- **Preset bundles**: behavior presets can pre-populate `interaction`. Ex: `behavior="status"` might keep only spin + vertical for simplicity, while `behavior="endless"` enables all four.

#### Use cases unlocked

- Fine-grained automation lanes: endless vertical slides let users spin through dozens of turns without finger fatigue.
- Multi-knob sweeps: DJs or audio engineers can drag multiple knobs vertically in parallel, matching the “mixing board” behavior described in the article.
- Desktop parity: trackpad users gain smooth scroll-based adjustment without needing to “draw” circles with a mouse.
- Accessibility: apps can disable spin in favor of linear slides for users with limited range of motion, while still allowing power users to turn on all modes.

Usage example:

```tsx
<Knob
  value={pan}
  min={-100}
  max={100}
  appearance={{
    arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
    ring: { thickness: 14, color: '#0f172a', trailColor: '#1e293b' },
    fill: { color: '#020617', radiusOffset: -18 },
    progress: {
      mode: 'split',
      pivotValue: 0,
      positiveColor: '#34d399',
      negativeColor: '#fb7185',
      roundedCaps: true,
    },
    thumb: { size: 22, color: '#f8fafc', strokeColor: '#0f172a', offset: 6 },
    pointer: { visible: true, length: 54, width: 2, color: '#e2e8f0', offset: -4 },
    ticks: {
      source: 'marks',
      shape: 'line',
      length: 12,
      position: 'outer',
      label: { position: 'outer', formatter: (mark) => mark.label },
    },
    panning: { pivotValue: 0, showZeroIndicator: true },
    interaction: {
      modes: ['spin', 'vertical-slide', 'horizontal-slide', 'scroll'],
      lockThresholdPx: 36,
      slideRatio: 2,
      spinStopAtLimits: true,
      scroll: { enabled: true, ratio: 0.5 },
    },
  }}
/>
```

### Ring styling

| Field | Type | Description |
| --- | --- | --- |
| `thickness` | `number` | Width of the ring stroke (defaults to current `trackThickness`). |
| `color` | `string` | Primary ring stroke color. Can accept theme tokens. |
| `trailColor` | `string` | Color for the unfilled portion when progress is enabled. |
| `backgroundColor` | `string` | Behind-ring fill (inner area outside the fill disk). |
| `cap` | `'butt' \| 'round'` | Stroke cap for the arc when start/end are not equal. |
| `radiusOffset` | `number` | Allows shrinking or expanding the ring relative to the component bounds. |
| `shadow` | `{ color, offset, blur, opacity }` | Optional drop shadow for depth. |
| `segments` | `KnobRingSegment[]` | Colored bands drawn over the ring, laid end to end from `min` — see below. |
| `segmentMode` | `'track' \| 'progress'` | Whether the bands are a static backdrop or the progress arc itself. Defaults to `'track'`. |

#### Ring segments

Multi-color rings work like stacking `Progress.Section`s: each segment declares how much of the range it covers, in the knob's own value units, and they are laid end to end starting at `min`. On a 0–100 knob those values read as percentages. Uncovered range keeps the plain ring color. Segments use butt caps so neighbours meet cleanly rather than overlapping like the ring's default round cap would.

| Field | Type | Description |
| --- | --- | --- |
| `value` | `number` | Span of this band in value units. |
| `color` | `string` | Band color. Defaults to the ring color (the progress color in `'progress'` mode). |
| `thickness` | `number` | Band thickness. Defaults to the ring thickness (the progress thickness in `'progress'` mode). |

```tsx
// Equivalent forms
<Knob appearance={{ ring: { segments: [{ value: 60, color: '#166534' }, { value: 40, color: '#7f1d1d' }] } }} />

<Knob.Root>
  <Knob.RingSegment value={60} color="#166534" />
  <Knob.RingSegment value={40} color="#7f1d1d" />
</Knob.Root>
```

##### `segmentMode`

`'track'` (the default) paints every band across the whole ring as a fixed backdrop, and the progress arc still draws on top — zones you read the value against, like a gauge redline.

`'progress'` makes the bands the progress arc: they are clipped at the current value and nothing is drawn past it, so the dial fills through each color in turn. The plain progress stroke is suppressed because the bands replace it, and the bands adopt the progress radius and thickness so they land where that stroke would have. Split progress (`progress.mode: 'split'`) renders its own two arcs and is unaffected — segments there fall back to `'track'`.

```tsx
// Zones behind a thinner progress arc
<Knob appearance={{
  ring: { thickness: 14, segments: zones },
  progress: { mode: 'contiguous', thickness: 6 },
}} />

// The fill itself runs green → amber → red
<Knob appearance={{ ring: { thickness: 14, segments: zones, segmentMode: 'progress' } }} />
```

### Inner fill styling

| Field | Type | Description |
| --- | --- | --- |
| `color` | `string` | Solid fill inside the ring. |
| `borderWidth` / `borderColor` | `number` / `string` | Inner disk border. |
| `radiusOffset` | `number` | Controls gap between ring and fill; defaults to `-thickness`. |

### Thumb styling

| Field | Type | Description |
| --- | --- | --- |
| `size` | `number` | Diameter override (replaces `thumbSize`). |
| `shape` | `'circle' \| 'pill' \| 'square'` | Quick shape helper; falling back to `thumbStyle`. |
| `color` | `string` | Fill color. |
| `strokeWidth` / `strokeColor` | `number` / `string` | Outline around the thumb. |
| `offset` | `number` | Positive pushes thumb outward from the ring, negative pulls inward. |
| `glow` | `{ color, blur, intensity }` | Soft glow for focus states. |
| `renderThumb` | `(ctx) => ReactNode` | Escape hatch for bespoke thumbs (e.g., LED). |

### Tick layers

`ticks` may be a single `KnobTickLayer` or an array (stacking multiple tiers, e.g., coarse lines + fine dots).

Key fields:

- `source`: `'marks' | 'steps' | 'values'`. When `marks`, it uses the existing `marks` prop (respecting labels/icons). `steps` uses `step` to auto-generate values. `values` accepts an explicit array.
- `shape`: `'dot' | 'line' | 'icon' | 'custom'`.
- `length`, `width`, `radiusOffset`, `position`: control geometry. `position` supports `'inner' | 'center' | 'outer'` relative to the ring.
- `color` / `inactiveColor`: lit and unlit colors. Either takes a string for the whole layer or a resolver, `({ value, index, angle, isActive, mark }) => string | undefined`, so ticks can differ from one another; `undefined` falls through to the defaults. For `source: 'marks'` a mark's own `accentColor` colors its lit tick ahead of a flat string — see below.
- `activeMode`: `'fill' | 'nearest'`, per layer — see below.
- `icon`: allow `IconProps` to render small glyphs (ties directly into the Icon registry).
- `label`: `{ show, formatter, position, offset, style }` to display text or React nodes, optionally pointing to the center.
- `renderTick(context)`: final customization hook with `{ value, angle, isActive, index }`.

#### Which ticks are active

`activeMode` decides what `color` versus `inactiveColor` means for a layer, and reaches `renderTick` through its `isActive` flag.

`'fill'` (the default) lights every tick from `min` up to the current value, the way a meter fills. Endless knobs have no absolute value-to-angle mapping, so nothing lights.

`'nearest'` lights only the single tick the pointer is aimed at — a selector or detent readout rather than a level. The match is by angle, not value, so it wraps correctly at the seam of a full circle and works on endless knobs too. It is resolved per layer, so a coarse selector tier and a fine meter tier can sit on the same dial.

```tsx
ticks: [
  { source: 'marks', shape: 'line', activeMode: 'nearest' },  // one detent lit
  { source: 'steps', shape: 'dot', radiusOffset: -10 },       // fills as the value climbs
]
```

#### Per-tick color, and the accent that follows it

Color resolution for a tick runs most specific first: a resolver the caller passed, then the mark's `accentColor` (lit ticks only), then the layer's flat color, then the theme.

`appearance.accentFromMarks` extends the same idea to the knob body: the nearest mark's `accentColor` becomes the knob's accent, so the thumb, arm, and progress arc match the detent the dial is on. `behavior="status"` does this unconditionally; the flag opts any other behavior in. Marks without an `accentColor`, and disabled knobs, keep the theme accent.

```tsx
<Knob
  marks={POSITIONS}              // each carrying its own accentColor
  restrictToMarks
  appearance={{
    accentFromMarks: true,
    ticks: [{
      source: 'marks',
      shape: 'line',
      activeMode: 'nearest',
      inactiveColor: ({ mark }) => (mark?.accentColor ? `${mark.accentColor}44` : undefined),
    }],
  }}
/>
```

### Pointer / "hand"

`pointer` defaults to hidden. When enabled it draws a hand anchored at the knob center.

| Field | Type | Description |
| --- | --- | --- |
| `visible` | `boolean` | Toggle pointer rendering. |
| `length` | `number` | Distance from center; defaults to ring radius minus padding. |
| `width` | `number` | Stroke width of the pointer. |
| `offset` | `number` | Moves pointer tip inside/outside the ring. |
| `color` | `string` | Pointer color. |
| `cap` | `'round' | 'butt'` | Stroke cap. |
| `counterweight` | `{ size, color }` | Optional tail circle for analog styling. |

### Arc configuration (partial circles)

`arc` defines how knob values map to physical angles.

| Field | Type | Description |
| --- | --- | --- |
| `startAngle` | `number` | Degrees where the sweep begins (default `0`). |
| `sweepAngle` | `number` | Total degrees covered (default `360`). Set to `180` for semicircle, etc. |
| `direction` | `'cw' | 'ccw'` | Clockwise or counter-clockwise sweep. |
| `clampInput` | `boolean` | Keeps values within `min/max` even if angles don’t cover 360°. |
| `wrap` | `boolean` | Allows endless mode to loop beyond the sweep while animation wraps. |

This replaces the current assumption that value → angle is always `((value - min)/(max - min))*360`.

### Progress coloring

`progress` shares logic with Slider to show colored ranges before/after the thumb.

| Field | Type | Description |
| --- | --- | --- |
| `mode` | `'none' | 'contiguous' | 'split'` | `contiguous` colors from `startAngle` to thumb. `split` mirrors from a pivot (for panning). |
| `color` | `string` | Color used for contiguous mode. |
| `trailColor` | `string` | Color for the remaining arc. Overrides `ring.trailColor` when set. |
| `roundedCaps` | `boolean` | Whether the progress arc uses round caps. |
| `thickness` | `number` | Optional override independent of the ring thickness. |

### Panning helpers

`panning` builds on `progress` for DAW-style knobs.

| Field | Type | Description |
| --- | --- | --- |
| `pivotValue` | `number` | Value that represents "center" (defaults to `(min + max) / 2`). |
| `positiveColor` / `negativeColor` | `string` | Colors for each side when `progress.mode = 'split'`. |
| `showZeroIndicator` | `boolean` | Renders a zero tick/label at the pivot. |
| `valueFormatter` | `(value) => string` | Overrides label formatting when near zero (e.g., `"C"`). |
| `mirrorThumbOffset` | `boolean` | Mirrors thumb offsets so left/right appear symmetric. |

### Backwards compatibility

- Providing `thumbSize`, `trackStyle`, or `thumbStyle` continues to work. During render we build a normalized `appearance` object using (a) behavior defaults, (b) `appearance`, (c) legacy props.
- `marks` remain the primary way to define labeled anchors; `ticks` simply determines how to visualize them.
- Behaviors map to presets (e.g., `behavior="status"` auto-sets `ring.color = accent`, `ticks.source = 'marks'`).

## Modular sub-components

Expose a low-level API for composition:

```tsx
<Knob.Root value={value} onChange={setValue} arc={{ startAngle: -120, sweepAngle: 240 }}>
  <Knob.Fill />
  <Knob.Ring thickness={12} />
  <Knob.Progress mode="split" positiveColor="#22c55e" negativeColor="#fb7185" />
  <Knob.TickLayer source="marks" shape="line" />
  <Knob.Pointer />
  <Knob.Thumb size={20} />
  <Knob.ValueLabel slot="center" />
</Knob.Root>
```

The high-level `<Knob>` continues to wrap these parts, but advanced users can import individual pieces for full control (similar to how Slider exposes `Slider.Track`, `Slider.Thumb`, etc.).

## Example configs

### Branded measurement knob

- `arc`: start `-150`, sweep `300`.
- `ring`: `thickness: 18`, `color: tokens.brand.700`, `trailColor: tokens.neutral.600`.
- `progress`: contiguous accent color (lime) to highlight the active range.
- `thumb`: pill-shaped, offset `4`, glow on focus.
- `ticks`: two layers (coarse lines every 30°, fine dots every 5°) with outside labels.
- `pointer`: thin silver hand.

### Stereo panning knob

- `min=-100`, `max=100`, `pivotValue=0`.
- `progress.mode = 'split'` with positive/negative colors.
- `ticks.source='values'` for `[-100,-50,0,50,100]` and `label.formatter` returning `L100…R100`.
- `pointer.visible=false` (thumb communicates value), `fill.color` tinted to show left/right bias.

## Implementation phases

1. **Interaction engine upgrade** – add `interaction` config, gesture locking thresholds, quadrant-aware direction, scroll listeners on web, and pointer capture integration. Port the Knob.js heuristics into a platform-agnostic controller shared by native/web PanResponders.
2. **Geometry & state refactor** – introduce `arc` math, expand `valueToAngle`/`updateFromPoint` to respect `startAngle`, `sweepAngle`, and `direction`. Add shared polar coordinate helpers.
3. **Appearance normalization** – create utilities that merge behavior defaults, theme tokens, legacy props, and the new `appearance` object into a canonical layer description consumed by render.
4. **Progress + ring layers** – render stacked `Svg` arcs (ring, trail, progress) so we can style thickness/caps independently.
5. **Thumb/pointer flexibility** – move thumb into its own component that reads from normalized styles; add pointer drawing logic (either `Svg` line or transformed `View`).
6. **Tick framework** – generalize mark rendering into tick layers. Support icon/label/pointer lines via a render function.
7. **Panning helpers & docs** – implement `split` progress mode, pivot logic, zero indicator, and ship new demos (panning, semicircle gauge, pointer clock).

Each phase can be merged incrementally, guarded by Storybook/Playground demos and unit tests around geometry helpers.
