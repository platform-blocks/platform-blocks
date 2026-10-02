# usePopoverPositioning

The measure-and-place engine under `useFloating`: attach `anchorRef` (and `popoverRef`) and it returns where the popover fits in the viewport — coordinates, the side it landed on after flipping, and the space available. `useTooltipPositioning` is a preset with tooltip defaults, and `useDropdownPositioning` adds `showOverlay` / `hideOverlay` to render the result through the overlay host; for most uses, reach for `useFloating` instead.

## Metadata

- Import: `import { usePopoverPositioning } from '@plocks/ui';`
- Tags: overlay, positioning, popover, tooltip, dropdown
- Docs: https://plocks.dev/hooks/usePopoverPositioning
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/hooks/usePopoverPositioning.ts

## Definition

```ts
export interface UsePopoverPositioningOptions extends PositioningOptions {
  /** Whether to automatically reposition on window resize */
  autoUpdate?: boolean;
  /** Debounce delay for resize/scroll updates in ms */
  updateDelay?: number;
  /** Adjust viewport height when on-screen keyboard is visible (default: true) */
  keyboardAvoidance?: boolean;
  /**
   * Layout direction the placement is written for. In `'rtl'` the `left`/`right`
   * sides and the `-start`/`-end` alignment of `top`/`bottom` placements are
   * mirrored, so `bottom-start` hugs the trigger's right edge. The returned
   * `position.placement` is always the physical side. Defaults to the
   * DirectionProvider's direction (or the platform's when there is none).
   */
  direction?: 'ltr' | 'rtl';
}

export interface UsePopoverPositioningReturn<TAnchor = View, TPopover = View> {
  /** Current position result */
  position: PositionResult | null;
  /** Update position manually. Pass `{ silent: true }` to skip the isPositioning flag. */
  updatePosition: (options?: { silent?: boolean }) => Promise<void>;
  /** Whether positioning is currently being calculated */
  isPositioning: boolean;
  /** Ref to attach to the anchor element */
  anchorRef: React.RefObject<TAnchor | null>;
  /** Ref to attach to the popover element for size measurement */
  popoverRef: React.RefObject<TPopover | null>;
}

export function usePopoverPositioning<TAnchor = View, TPopover = View>(isOpen: boolean, options: UsePopoverPositioningOptions = {}): UsePopoverPositioningReturn<TAnchor, TPopover>;
```

## Examples

### Position readout

`usePopoverPositioning(isOpen, options)` returns `{ position, anchorRef, popoverRef, updatePosition, isPositioning }`; while `isOpen` is true, `position` holds the popover's `x` / `y` in viewport coordinates, the physical `placement` (after RTL mirroring and flipping), `flipped` / `shifted` and `maxWidth` / `maxHeight`, and it is `null` while closed. Until `popoverRef` is on a rendered element the popover is assumed to be 200px wide with no height, and drawing it at those coordinates (`position: fixed` on web, a portal on native) is up to you, which is exactly what `useFloating` handles. It re-computes every frame while the page scrolls or resizes on web and after rotation on native, and with `keyboardAvoidance` (on by default) it keeps clear of the keyboard `KeyboardManagerProvider` reports. `useTooltipPositioning(isOpen, placement)` presets `flip`, `shift`, an 8px `offset` and `boundary`, while `useDropdownPositioning({ isOpen, onClose, …options })` also returns `showOverlay(content)` / `hideOverlay()` and closes the overlay when `isOpen` turns false.

```tsx
import { useState } from 'react';
import { Block, Button, Text, usePopoverPositioning } from '@plocks/ui';

export function Demo() {
  const [measuring, setMeasuring] = useState(false);
  const { anchorRef, position } = usePopoverPositioning(measuring, {
    placement: 'top',
    offset: 8,
  });

  return (
    <Block align="center">
      <Button ref={anchorRef} onPress={() => setMeasuring((current) => !current)}>
        {measuring ? 'Stop' : 'Measure'}
      </Button>

      {position ? (
        <Text size="sm" ff="monospace">
          {position.placement} · x {Math.round(position.x)} · y {Math.round(position.y)}
        </Text>
      ) : null}
    </Block>
  );
}
```
