# useLayer

Register a custom overlay in the app-wide layer stack (no provider needed), so Escape and Android back close only the topmost layer, a press inside a nested layer doesn't close its parent, and focus moves in on open, can be trapped, and returns on close. Wrap its content in `<LayerScope id={id}>` so layers opened from inside it stack above it, and use `useIsTopLayer(id)` to know whether it is currently on top.

## Metadata

- Import: `import { useLayer } from '@plocks/ui';`
- Tags: overlay, layer, dismiss, escape, focus
- Docs: https://plocks.dev/hooks/useLayer
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/overlay/useLayer.tsx

## Definition

```ts
export interface UseLayerOptions {
  /** Whether the layer is open. The layer registers on true and unregisters on false/unmount. */
  active: boolean;
  /** Called when Escape, hardware back, or an outside press asks the layer to close. */
  onDismiss?: (reason: LayerDismissReason) => void;
  /** Dismiss on Escape when this is the topmost layer (web). @default true */
  closeOnEscape?: boolean;
  /** Dismiss on Android hardware back when this is the topmost layer. @default closeOnEscape */
  closeOnBack?: boolean;
  /** Dismiss when a press lands outside the container (web). @default false */
  closeOnOutsidePress?: boolean;
  /**
   * Modal layers block the layers below them: Escape/back never reach past a
   * modal layer, outside presses never dismiss layers under it, and on native
   * the screen reader focus moves into it on open. @default false
   */
  modal?: boolean;
  /** Keep Tab / Shift+Tab focus cycling inside the container (web). @default modal */
  trapFocus?: boolean;
  /** Move focus into the layer when it activates. @default true */
  autoFocus?: boolean;
  /**
   * Where `autoFocus` puts focus when there is no `initialFocusRef`:
   * the first tabbable element, or the container itself (keyboard users then
   * Tab into the content, and no on-screen keyboard pops up for an input).
   * @default 'first-tabbable'
   */
  initialFocus?: 'first-tabbable' | 'container';
  /** Element to focus on activation (takes precedence over `initialFocus`). */
  initialFocusRef?: RefObject<unknown>;
  /**
   * Return focus when the layer closes — only if focus is still inside the
   * layer (or was lost with it), so closing by clicking elsewhere never steals
   * focus back. @default true
   */
  restoreFocus?: boolean;
  /** Where to return focus. @default the element focused when the layer opened */
  restoreFocusRef?: RefObject<unknown>;
  /** The layer's content node. Needed for focus management and outside-press detection. */
  containerRef?: RefObject<unknown>;
  /** Presses inside these don't count as outside (e.g. the trigger, which toggles itself). */
  outsidePressIgnoreRefs?: ReadonlyArray<RefObject<unknown>>;
  /** Parent layer id. @default the enclosing `LayerScope` */
  parentId?: string | null;
  /** Explicit id (otherwise generated). */
  id?: string;
}

export interface UseLayerResult {
  /** Stable id of this layer in the stack. Pass to `LayerScope` / `useIsTopLayer`. */
  id: string;
}

export function useLayer(options: UseLayerOptions): UseLayerResult;
```

## Examples

### Dismissable panel

`useLayer({ active, onDismiss, containerRef, … })` registers the panel while `active` is true and returns its `{ id }`. `onDismiss(reason)` receives `'escape-key'`, `'back-button'` or `'outside-press'`, and the panel stays open until you set `active` back to false; `closeOnOutsidePress` is off by default, and `outsidePressIgnoreRefs` stops a press on the trigger from counting as outside. Escape and outside press are web-only: on native, Android back dismisses the topmost layer, and a tap outside needs your own backdrop. `modal: true` walls off the layers below it and traps Tab, and focus moves into the panel on open and back on close (`autoFocus`, `restoreFocus`, both on by default).

```tsx
import { useRef, useState } from 'react';
import type { View } from 'react-native';
import { Badge, Block, Button, LayerScope, Text, useLayer } from '@plocks/ui';
import type { LayerDismissReason } from '@plocks/ui';

export function Demo() {
  const [opened, setOpened] = useState(false);
  const [reason, setReason] = useState<LayerDismissReason | null>(null);
  const triggerRef = useRef<View>(null);
  const panelRef = useRef<View>(null);

  const { id } = useLayer({
    active: opened,
    onDismiss: (why) => {
      setReason(why);
      setOpened(false);
    },
    closeOnOutsidePress: true,
    containerRef: panelRef,
    outsidePressIgnoreRefs: [triggerRef],
  });

  const toggle = () => {
    setReason(null);
    setOpened((current) => !current);
  };

  return (
    <Block align="flex-start">
      <Button ref={triggerRef} onPress={toggle}>
        {opened ? 'Close panel' : 'Open panel'}
      </Button>

      {opened ? (
        <LayerScope id={id}>
          <Block ref={panelRef} p="md" radius="md" bg="elevated" shadow="md" miw={220}>
            <Text fw="600">Panel</Text>
          </Block>
        </LayerScope>
      ) : null}

      {reason ? <Badge variant="light">{reason}</Badge> : null}
    </Block>
  );
}
```
