# useFloating

Anchor a floating element such as a popover, menu or tooltip to a trigger: it places it with flip and shift, renders it through the app's overlay host, registers it in the layer stack for Escape, back, outside press and focus, and returns the ARIA props for both ends. Popover, Menu, Tooltip, HoverCard and Select are built on it.

## Metadata

- Import: `import { useFloating } from '@plocks/ui';`
- Tags: overlay, popover, positioning, floating, aria
- Docs: https://plocks.dev/hooks/useFloating
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/overlay/useFloating.ts

## Definition

```ts
export interface UseFloatingOptions {
  /** Whether the floating element is open. */
  opened: boolean;
  /** Escape / Android back / outside press (or an external close) asked it to close. */
  onDismiss?: (reason: FloatingDismissReason) => void;
  /**
   * Placement relative to the anchor, written for LTR: in RTL `left`/`right`
   * and the `-start`/`-end` alignment of `top`/`bottom` are mirrored.
   * @default 'bottom'
   */
  placement?: PlacementType;
  /** Gap between anchor and floating element, px. @default 8 */
  offset?: number;
  /** Flip to the opposite side when it doesn't fit. @default true */
  flip?: boolean;
  /** Shift along the anchor to stay in the viewport. @default true */
  shift?: boolean;
  /** Match the anchor's width. @default false */
  matchWidth?: boolean;
  /**
   * 'fixed' (default): web `position: fixed`; native plain view in the nearest
   * overlay renderer. 'absolute': web `position: absolute`. 'portal': native
   * RN Modal at the app root (inside an OverlayHost it is a plain view).
   */
  strategy?: 'fixed' | 'absolute' | 'portal';
  /** What opens it. Hover/focus-triggered elements don't take focus or close on outside press. @default 'click' */
  trigger?: FloatingTrigger;
  /** Modal: traps focus, blocks layers below from Escape/back/outside press. @default false */
  modal?: boolean;
  /** Role of the floating element. `null` for none. @default 'dialog' */
  role?: string | null;
  /** The trigger's `aria-haspopup`. @default derived from `role` ('menu', 'listbox', 'tree', 'grid', else 'dialog') */
  popupType?: FloatingPopupType;
  /** Emit role/aria-* props at all. @default true */
  withRoles?: boolean;
  /** id of the floating element (the trigger's `aria-controls` target). @default generated */
  id?: string;
  /** Theme z-index layer. @default 'popover' */
  layer?: FloatingLayer;
  /** Explicit z-index (overrides `layer`). */
  zIndex?: number;
  /** @default true */
  closeOnEscape?: boolean;
  /** @default closeOnEscape */
  closeOnBack?: boolean;
  /** @default true, false for hover/focus triggers */
  closeOnOutsidePress?: boolean;
  /** Trap Tab inside the floating element (web). @default modal */
  trapFocus?: boolean;
  /** Move focus into the floating element on open. @default true for click/contextmenu/manual triggers */
  autoFocus?: boolean;
  /** @default 'first-tabbable' when trapping focus, otherwise 'container' */
  initialFocus?: 'first-tabbable' | 'container';
  initialFocusRef?: RefObject<unknown>;
  /** Return focus on close (when focus is still inside). @default true */
  restoreFocus?: boolean;
  /**
   * Where focus returns on close when `restoreFocus` is on — e.g. an input
   * that should get focus back instead of the anchor. @default the anchor (reference)
   */
  restoreFocusRef?: RefObject<unknown>;
  /** Minimum distance from the viewport edges, px. */
  boundary?: number;
  /** Placements to try when the preferred one doesn't fit (mirrored in RTL too). */
  fallbackPlacements?: PlacementType[];
  viewport?: PositioningOptions['viewport'];
  /** Avoid the on-screen keyboard. @default true */
  keyboardAvoidance?: boolean;
  /** Expected height before measuring, so the first frame picks the right side. */
  desiredHeight?: number;
  /** Reposition on scroll / resize / rotation. @default true */
  autoUpdate?: boolean;
  /** Layout direction override. @default DirectionProvider / platform */
  direction?: 'ltr' | 'rtl';
}

export interface UseFloatingReturn {
  opened: boolean;
  /** id carried by the floating element. */
  floatingId: string;
  /** Physical placement on screen (after RTL mirroring and flipping). */
  placement: PlacementType;
  position: PositionResult | null;
  /** True once the floating element has been measured and placed. */
  isPositioned: boolean;
  zIndex: number;
  /** False when rendering inline because no OverlayProvider is mounted. */
  hasOverlayProvider: boolean;
  refs: FloatingRefs;
  /**
   * Props for the trigger: `aria-haspopup` / `aria-expanded` / `aria-controls`
   * (web; native gets `aria-expanded`) and the reference ref. Pass
   * `{ ref: false }` to omit the ref when another element is the anchor.
   */
  getReferenceProps: (userProps?: AnyProps, options?: { ref?: boolean }) => AnyProps;
  /** Props for the floating element: `id`, `role`, `aria-modal`, ref, `onLayout`, `style`. */
  getFloatingProps: (userProps?: AnyProps) => AnyProps;
  /** Re-measure and reposition now. */
  update: () => Promise<void>;
  /**
   * Returns an element to render anywhere in the component: it opens `content`
   * in the nearest overlay host while open (rendering nothing itself), or
   * renders it inline next to the anchor when there is no OverlayProvider.
   */
  renderFloating: (content: ReactNode, options?: FloatingRenderOptions) => ReactElement | null;
}

export type FloatingLayer = 'dropdown' | 'popover' | 'tooltip';

export type FloatingPopupType = 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid' | boolean;

export type FloatingTrigger = 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual';

export interface FloatingRefs {
  /**
   * The anchor (measured for positioning, exempt from outside press, focus
   * returns to it): a host view / DOM node, or a point anchor (`createPointAnchor`).
   */
  reference: MutableRefObject<unknown>;
  /** The floating element (measured for its size, focus container). */
  floating: MutableRefObject<unknown>;
  setReference: (node: unknown) => void;
  setFloating: (node: unknown) => void;
}

export function useFloating(options: UseFloatingOptions): UseFloatingReturn;
```

## Examples

### Anchored panel

Spread `getReferenceProps()` on the trigger and `getFloatingProps()` on the panel, then pass the panel to `renderFloating()`, which opens it in the nearest overlay host and renders nothing in place. `placement` (default `'bottom'`, written for LTR and mirrored in RTL) flips when the panel doesn't fit, and the returned `placement` is the side it actually landed on; `offset`, `matchWidth`, `modal`, `role` and `trigger` cover the rest, with `'hover'` / `'focus'` triggers neither taking focus nor closing on outside press. `onDismiss(reason)` fires for Escape, Android back, an outside press, or `'closed-externally'` when something else closed the overlay. Without an `OverlayProvider` (PlocksProvider mounts one) the panel renders inline next to the trigger, without flipping.

```tsx
import { useState } from 'react';
import { Block, Button, Text, useFloating } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const floating = useFloating({
    opened,
    onDismiss: () => setOpened(false),
    placement: 'bottom-start',
  });

  return (
    <>
      <Button {...floating.getReferenceProps()} onPress={() => setOpened((current) => !current)}>
        {opened ? 'Close' : 'Open'}
      </Button>

      {floating.renderFloating(
        <Block {...floating.getFloatingProps()} p="md" radius="md" bg="elevated" shadow="md" maw={260}>
          <Text fw="600">Anchored panel</Text>
          <Text size="sm" ff="monospace">
            {floating.placement}
          </Text>
        </Block>
      )}
    </>
  );
}
```
