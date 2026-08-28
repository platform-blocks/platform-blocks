# Gesture core

Shared plumbing for every control whose value is set by dragging: `Slider`,
`RangeSlider`, `Knob`, `Joystick`, `Rating`, `NumberInput`'s drag-scrub, and
`Waveform`'s scrub.

## The bug this exists to fix

Press a Slider on a phone, drag sideways, let the thumb wander a few pixels
above or below the rail — and the page starts scrolling while the drag is still
live. The same happened on the Rating row, the Knob, and the Waveform.

Two independent causes, one per platform:

**Web.** react-native-web's responder system registers its `touchmove` listener
on `document` *without* `{ passive: false }`. Every `event.preventDefault()`
those components were calling from `onPanResponderMove` was a silent no-op in
every modern browser. Nothing was stopping the browser from deciding, a few
pixels into the gesture, that the touch was a scroll.

**Native.** A `PanResponder` inside a `ScrollView` can be asked to hand the
gesture back. Without `onPanResponderTerminationRequest` returning `false`, an
iOS `ScrollView` takes the touch as soon as it looks like a pan; without
`onShouldBlockNativeResponder` returning `true`, an Android `ScrollView` never
gets the `requestDisallowInterceptTouchEvent` that would make it stand down.

A third, quieter bug rode along: the components derived their value from
`locationX`/`locationY`, which are relative to *whatever view the touch is
currently over*. During a drag that is whichever child slid under the finger, so
the mapping drifted the moment the pointer left the control.

## What the fix looks like

| Piece | Job |
| --- | --- |
| `getGestureSurfaceStyle` | `touch-action` on the surface (plus selection / callout / tap-highlight suppression). This is the load-bearing one on web: the browser never claims the touch, so it cannot take it away mid-drag. |
| `GESTURE_RESPONDER_LOCK` | `onPanResponderTerminationRequest: false` + `onShouldBlockNativeResponder: true`. Spread into every `PanResponder.create` config. |
| `pageScrollLock` | Ref-counted, web-only. Held from responder grant to release: sets `overscroll-behavior: none` and registers a genuinely non-passive `touchmove` blocker. Second line of defence for the cases CSS cannot cover. |
| `textSelectionLock` | Ref-counted `user-select: none` on `document.body`, so a mouse drag does not highlight the page it sweeps over. |
| `useDragGesture` | All of the above, plus surface-relative coordinates measured once per gesture and derived from `pageX`/`pageY`, plus termination and unmount cleanup. |

## Choosing `axis`

`axis` decides the `touch-action` value, which is a real trade: a surface that
claims a direction is a surface the page cannot be scrolled from.

- **`both`** → `touch-action: none`. Use for compact controls (a 40px Slider
  rail, a Knob, a Joystick). The dead band is small and the gesture is never
  ambiguous.
- **`x` / `y`** → `pan-y` / `pan-x`. Use for large scrub surfaces — `Waveform`
  is the current example — where turning the whole area into a scroll dead zone
  would cost more than it buys. The browser drops the scroll for the rest of the
  sequence once the gesture starts along the claimed axis.

## Using it

```tsx
const drag = useDragGesture({
  enabled: !disabled,
  axis: 'both',
  onStart: (point) => commit(point.x, point.y, point.width, point.height),
  onMove: (point) => commit(point.x, point.y, point.width, point.height),
  onEnd: () => setSettled(),
});

<View
  ref={drag.ref}
  onLayout={drag.onLayout}
  style={[styles.rail, drag.surfaceStyle]}
  {...drag.panHandlers}
/>
```

`point` is in the surface's own coordinate space and stays correct after the
pointer leaves it. `point.width` / `point.height` are `0` until the first layout
lands, so fall back to the configured size for a press that beats `onLayout`.

Controls that must let a tap fall through to something else — `NumberInput`,
whose field is also a text input — set `claimOnStart: false` with an
`activationDistance`, and take the page-scroll lock only once the scrub actually
wins the gesture.
