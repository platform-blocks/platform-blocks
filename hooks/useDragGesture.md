# useDragGesture

The drag gesture behind Slider, RangeSlider, Joystick and Rating: spread its handlers, ref and style onto a View to get pointer samples in that View's own coordinates, which keep tracking after the finger leaves it, without the page or a ScrollView stealing the drag. `getGestureSurfaceStyle` and `GESTURE_RESPONDER_LOCK` are the two pieces it's built on, for a `PanResponder` of your own.

## Metadata

- Import: `import { useDragGesture } from '@plocks/ui';`
- Tags: gesture, drag, pan, touch, scroll
- Docs: https://plocks.dev/hooks/useDragGesture
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/gestures/useDragGesture.ts

## Definition

```ts
export interface UseDragGestureOptions {
  /** Turn the whole gesture off (disabled / read-only controls). Default true. */
  enabled?: boolean;
  /** Directions the surface consumes. Drives `touch-action` on web. Default `both`. */
  axis?: DragAxis;
  /**
   * Claim the gesture the moment the surface is touched, so a tap commits a
   * value and the drag is already ours before the browser or a parent
   * ScrollView can consider the touch a scroll. Default true.
   */
  claimOnStart?: boolean;
  /**
   * Travel (px) required before a *move* claims the gesture. Only consulted
   * when `claimOnStart` is false — controls that must let a tap fall through to
   * something else (a text field that also drag-scrubs) set this.
   */
  activationDistance?: number;
  /** Claim in the capture phase, outranking any child responders. Default false. */
  capture?: boolean;
  /** Hold the web page-scroll lock while dragging. Default true. */
  lockPageScroll?: boolean;
  /** Hold the web text-selection lock while dragging. Default true. */
  lockTextSelection?: boolean;
  /** Web cursor for the idle surface. */
  cursor?: string;
  /** Web cursor while a drag is in flight. Defaults to `cursor`. */
  activeCursor?: string;
  /** Fired once when the gesture is granted, with the press location. */
  onStart?: DragGestureCallback;
  /** Fired for every pointer sample while the gesture is held. */
  onMove?: DragGestureCallback;
  /** Fired once when the pointer is released. */
  onEnd?: DragGestureCallback;
  /** Fired instead of `onEnd` when the gesture is terminated (backgrounded, torn down). */
  onCancel?: () => void;
}

export interface UseDragGestureResult {
  /** Spread onto the View that owns the gesture. */
  panHandlers: GestureResponderHandlers;
  /** Web-only style props (`touch-action`, selection, cursor) for that same View. */
  surfaceStyle: ViewStyle;
  /** Attach to the same View — used to measure the surface's page origin. */
  ref: React.MutableRefObject<View | null>;
  /** Pass to the same View's `onLayout` (compose it if the caller needs its own). */
  onLayout: (event: LayoutChangeEvent) => void;
  /** True between grant and release/terminate. */
  isDragging: boolean;
  /** Latest known surface box, in page coordinates. */
  getSurfaceRect: () => { x: number; y: number; width: number; height: number };
}

export function useDragGesture(options: UseDragGestureOptions = {}): UseDragGestureResult;
```

## Examples

### Drag a knob

`useDragGesture(options)` returns `{ ref, onLayout, surfaceStyle, panHandlers, isDragging, getSurfaceRect }`; put the first four on the same View (composing `onLayout` when you need your own) and give its children `pointerEvents: 'none'` so every press lands on the surface. `onStart`, `onMove` and `onEnd` each receive a `DragPoint` with `x` / `y` relative to the surface, its `width` / `height` (0 until the first layout) and `dx` / `dy` / `distance` travelled since the press, while `onCancel` fires instead of `onEnd` when the gesture is taken away. `axis` sets web `touch-action`: `'x'` here leaves vertical page scrolling alone, `'both'` (the default) claims every direction, and on web a drag also holds page-scroll and text-selection locks until release, cancel or unmount. `claimOnStart: false` with an `activationDistance` lets a tap fall through to something else, and `enabled: false` turns the surface back into ordinary content.

```tsx
import { useState } from 'react';
import { Block, Text, useDragGesture } from '@plocks/ui';
import type { DragPoint } from '@plocks/ui';

const KNOB = 28;
// Children of the surface let the press through, so it always lands on the surface itself.
const PASS_THROUGH = { pointerEvents: 'none' } as const;

export function Demo() {
  const [ratio, setRatio] = useState(0.5);
  const [trackWidth, setTrackWidth] = useState(0);

  const follow = (point: DragPoint) => {
    const travel = point.width - KNOB;
    if (travel <= 0) return;
    setRatio(Math.min(1, Math.max(0, (point.x - KNOB / 2) / travel)));
  };

  const drag = useDragGesture({
    axis: 'x',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onStart: follow,
    onMove: follow,
  });

  return (
    <Block fullWidth maw={360}>
      <Block
        ref={drag.ref}
        onLayout={(event) => {
          drag.onLayout(event);
          setTrackWidth(event.nativeEvent.layout.width);
        }}
        style={drag.surfaceStyle}
        {...drag.panHandlers}
        h={KNOB}
        justify="center"
      >
        <Block h={4} radius="full" bg="border" style={PASS_THROUGH} />
        <Block
          position="absolute"
          top={0}
          left={ratio * Math.max(0, trackWidth - KNOB)}
          w={KNOB}
          h={KNOB}
          radius="full"
          bg="primary.5"
          opacity={drag.isDragging ? 0.8 : 1}
          style={PASS_THROUGH}
        />
      </Block>

      <Text ta="center" ff="monospace">
        {Math.round(ratio * 100)}%
      </Text>
    </Block>
  );
}
```
