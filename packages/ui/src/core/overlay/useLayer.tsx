import React, {
  createContext,
  useContext,
  useId,
  useRef,
  useSyncExternalStore,
} from 'react';
import type { ReactNode, RefObject } from 'react';
import { AccessibilityInfo } from 'react-native';

import { hasDOM, isNative } from '../platform';
import {
  focusContainer,
  focusElement,
  focusElementOrFirstTabbable,
  getActiveElement,
  getTabbableElements,
  resolveDOMElement,
} from './focus';
import {
  clearLayerParent,
  getLayerStackSnapshot,
  isTopLayer,
  registerLayer,
  setLayerParent,
  subscribeLayerStack,
} from './layerStack';
import type { LayerBehavior, LayerDismissReason } from './layerStack';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

/** Id of the layer the current subtree renders inside (null at the root). */
const LayerContext = createContext<string | null>(null);

/**
 * Marks `children` as rendering inside layer `id`, so layers opened from
 * within it are ordered above it even when both activate in the same commit.
 * `useFloating` wraps its floating content in one automatically; wrap a
 * Dialog's content in one when it calls `useLayer` directly.
 */
export function LayerScope({ id, children }: { id: string; children?: ReactNode }) {
  return <LayerContext.Provider value={id}>{children}</LayerContext.Provider>;
}

/** The id of the layer the calling component renders inside, or null. */
export function useParentLayerId(): string | null {
  return useContext(LayerContext);
}

export type { LayerDismissReason };

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

function buildBehavior(options: UseLayerOptions): LayerBehavior {
  const closeOnEscape = options.closeOnEscape ?? true;
  const modal = options.modal ?? false;
  return {
    closeOnEscape,
    closeOnBack: options.closeOnBack ?? closeOnEscape,
    closeOnOutsidePress: options.closeOnOutsidePress ?? false,
    modal,
    trapFocus: options.trapFocus ?? modal,
    onDismiss: options.onDismiss,
    getContainer: () => options.containerRef?.current ?? null,
    getOutsidePressIgnoreNodes: () =>
      (options.outsidePressIgnoreRefs ?? []).map((ref) => ref?.current ?? null),
  };
}

/** React's useId output varies by version (`:r0:`, `«r0»`, `_r_0_`); keep ids selector-safe. */
export function sanitizeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

const MAX_FOCUS_ATTEMPTS = 10;
const NATIVE_A11Y_FOCUS_DELAY = 100;

function moveDOMFocusIntoLayer(options: UseLayerOptions): boolean {
  const container = resolveDOMElement(options.containerRef);
  if (!container) return false;

  const active = getActiveElement(container.ownerDocument);
  if (active && container.contains(active)) return true; // content autofocused itself

  const initial = resolveDOMElement(options.initialFocusRef);
  if (initial && focusElementOrFirstTabbable(initial)) return true;

  if ((options.initialFocus ?? 'first-tabbable') === 'first-tabbable') {
    const first = getTabbableElements(container)[0];
    if (first && focusElement(first)) return true;
  }
  focusContainer(container);
  return true;
}

function sendNativeAccessibilityFocus(node: unknown): void {
  if (!node) return;
  try {
    AccessibilityInfo.sendAccessibilityEvent(
      node as Parameters<typeof AccessibilityInfo.sendAccessibilityEvent>[0],
      'focus'
    );
  } catch {
    // Unmounted or not a host instance — nothing to focus.
  }
}

/**
 * Registers an overlay layer in the global layer stack while `active`.
 *
 * The stack gives Escape / Android back / outside presses to the topmost
 * layer only, and this hook adds focus management: move focus in on open,
 * optionally trap Tab, restore focus on close.
 *
 * @example
 * const contentRef = useRef<View>(null);
 * const { id } = useLayer({
 *   active: opened,
 *   onDismiss: () => setOpened(false),
 *   modal: true,
 *   containerRef: contentRef,
 * });
 * return <LayerScope id={id}><View ref={contentRef}>…</View></LayerScope>;
 */
export function useLayer(options: UseLayerOptions): UseLayerResult {
  const generatedId = useId();
  const id = options.id ?? `plocks-layer-${sanitizeId(generatedId)}`;
  const contextParentId = useContext(LayerContext);
  const parentId = options.parentId !== undefined ? options.parentId : contextParentId;

  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });

  useIsomorphicLayoutEffect(() => {
    setLayerParent(id, parentId);
    return () => clearLayerParent(id);
  }, [id, parentId]);

  const { active } = options;

  useIsomorphicLayoutEffect(() => {
    if (!active) return undefined;

    const previouslyFocused = hasDOM ? getActiveElement() : null;
    const unregister = registerLayer(id, parentId, () => buildBehavior(optionsRef.current));

    let frame: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const initial = optionsRef.current;

    if (initial.autoFocus ?? true) {
      if (hasDOM) {
        // Portaled content may mount a frame after the layer activates.
        let attempts = 0;
        const attempt = () => {
          frame = null;
          if (moveDOMFocusIntoLayer(optionsRef.current)) return;
          if (++attempts < MAX_FOCUS_ATTEMPTS && typeof requestAnimationFrame === 'function') {
            frame = requestAnimationFrame(attempt);
          }
        };
        attempt();
      } else if (isNative && initial.modal) {
        timer = setTimeout(() => {
          timer = null;
          const current = optionsRef.current;
          sendNativeAccessibilityFocus(current.initialFocusRef?.current ?? current.containerRef?.current);
        }, NATIVE_A11Y_FOCUS_DELAY);
      }
    }

    return () => {
      if (frame !== null && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(frame);
      if (timer !== null) clearTimeout(timer);
      unregister();

      const latest = optionsRef.current;
      if (!(latest.restoreFocus ?? true)) return;

      if (hasDOM) {
        const container = resolveDOMElement(latest.containerRef);
        const activeNow = getActiveElement();
        const focusWasInside = !activeNow || (!!container && container.contains(activeNow));
        if (!focusWasInside) return;
        const explicitTarget = resolveDOMElement(latest.restoreFocusRef);
        const restore = (): boolean => {
          if (explicitTarget) {
            return explicitTarget.isConnected && focusElementOrFirstTabbable(explicitTarget);
          }
          return !!previouslyFocused && previouslyFocused.isConnected && focusElement(previouslyFocused);
        };
        restore();
        // A react-native-web Modal that stays mounted with `visible={false}`
        // (DropdownSheet) keeps its own focus trap live until its passive
        // effects run, and pulls focus straight back in. Re-assert once, a
        // frame later, unless focus has meanwhile gone somewhere on purpose.
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            const now = getActiveElement();
            const target = explicitTarget ?? previouslyFocused;
            if (!target || now === target || (!!now && target.contains(now))) return;
            const pulledBack = !now || !now.isConnected || (!!container && container.contains(now));
            if (pulledBack) restore();
          });
        }
      } else if (isNative && latest.modal) {
        const target = latest.restoreFocusRef?.current;
        if (target) sendNativeAccessibilityFocus(target);
      }
    };
    // Only (de)activation re-runs this; every other option is read live from optionsRef.
  }, [active, id, parentId]);

  return { id };
}

/** True while layer `id` is the topmost registered layer. Re-renders when that changes. */
export function useIsTopLayer(id: string): boolean {
  return useSyncExternalStore(
    subscribeLayerStack,
    () => isTopLayer(id),
    () => false
  );
}

/** Ids of all registered layers, bottom → top. */
export function useLayerStack(): readonly string[] {
  return useSyncExternalStore(subscribeLayerStack, getLayerStackSnapshot, getLayerStackSnapshot);
}
