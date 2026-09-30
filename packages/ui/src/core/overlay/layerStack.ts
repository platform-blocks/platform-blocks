import { BackHandler } from 'react-native';

import { hasDOM, isWeb } from '../platform';
import { devWarn } from '../utils/logger';
import {
  focusContainer,
  focusElement,
  getActiveElement,
  getTabbableElements,
  resolveDOMElement,
} from './focus';

/**
 * The layer stack: one ordered list of every open overlay layer (popovers,
 * menus, dialogs, sheets, anything registered through `useLayer`), shared by
 * the whole app as a module-level singleton — no provider needed.
 *
 * It owns the *global* dismissal inputs so that exactly one layer reacts to
 * each of them:
 *
 * - **Escape (web)** — ONE capture-phase `keydown` listener on `document`
 *   dismisses only the topmost layer that accepts Escape, then stops the
 *   event so no other document/window listener (or the matching `keyup` that
 *   react-native-web's Modal turns into `onRequestClose`) closes a second
 *   layer with the same key press.
 * - **Hardware back (Android)** — ONE `hardwareBackPress` listener dismisses
 *   only the topmost layer that accepts back, returning `true` so navigation
 *   doesn't also pop. RN `Modal`s swallow back presses before BackHandler sees
 *   them; route their `onRequestClose` to {@link handleModalRequestClose}.
 * - **Outside press (web)** — ONE capture-phase `pointerdown` listener. A
 *   layer is dismissed when the press lands outside it, outside its ignore
 *   nodes (its trigger, which toggles itself), and outside every layer stacked
 *   above it. Layers underneath a modal layer are never outside-pressed.
 * - **Focus trap (web)** — Tab / Shift+Tab cycle inside the topmost layer when
 *   it traps focus, and focus that escapes a trapping layer is pulled back.
 *
 * Listeners are attached lazily when the first layer registers and removed
 * when the last one unregisters.
 */

export type LayerDismissReason = 'escape-key' | 'back-button' | 'outside-press';

/** Live behaviour of a registered layer. Read on every event, so it is never stale. */
export interface LayerBehavior {
  closeOnEscape: boolean;
  closeOnBack: boolean;
  closeOnOutsidePress: boolean;
  modal: boolean;
  trapFocus: boolean;
  onDismiss?: (reason: LayerDismissReason) => void;
  /** The layer's content node (DOM element on web, host instance on native). */
  getContainer: () => unknown;
  /** Nodes whose presses are not "outside" — typically the trigger. */
  getOutsidePressIgnoreNodes?: () => unknown[];
}

interface LayerRecord {
  id: string;
  parentId: string | null;
  getBehavior: () => LayerBehavior;
}

const layers: LayerRecord[] = [];
/** id → parent id for every mounted layer, active or not. Used to keep children above parents. */
const parentLinks = new Map<string, string | null>();
const subscribers = new Set<() => void>();
let snapshot: readonly string[] = [];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

function isAncestor(ancestorId: string, id: string): boolean {
  let current = parentLinks.get(id) ?? null;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    if (current === ancestorId) return true;
    seen.add(current);
    current = parentLinks.get(current) ?? null;
  }
  return false;
}

function notify(): void {
  snapshot = layers.map((layer) => layer.id);
  subscribers.forEach((listener) => listener());
}

/** Records `id`'s parent layer. Call for every mounted layer, active or not. */
export function setLayerParent(id: string, parentId: string | null): void {
  parentLinks.set(id, parentId);
}

export function clearLayerParent(id: string): void {
  parentLinks.delete(id);
}

/**
 * Pushes a layer onto the stack and returns its unregister function.
 *
 * A layer normally goes on top. The exception is a parent activating in the
 * same commit as a child that registered first (effects run child-first): the
 * parent is inserted just below its first registered descendant, so the child
 * still ends up above it.
 */
export function registerLayer(
  id: string,
  parentId: string | null,
  getBehavior: () => LayerBehavior
): () => void {
  const existing = layers.findIndex((layer) => layer.id === id);
  if (existing !== -1) {
    layers.splice(existing, 1);
  }
  // `useLayer` records the link for as long as the layer is mounted; direct
  // callers get one for as long as the layer is registered.
  const ownsParentLink = !parentLinks.has(id);
  parentLinks.set(id, parentId);

  const record: LayerRecord = { id, parentId, getBehavior };
  const descendantIndex = layers.findIndex((layer) => isAncestor(id, layer.id));
  if (descendantIndex === -1) {
    layers.push(record);
  } else {
    layers.splice(descendantIndex, 0, record);
  }

  syncListeners(true);
  notify();

  let removed = false;
  return () => {
    if (removed) return;
    removed = true;
    if (ownsParentLink) parentLinks.delete(id);
    const index = layers.indexOf(record);
    if (index !== -1) {
      layers.splice(index, 1);
      syncListeners(false);
      notify();
    }
  };
}

/** Ids of the registered layers, bottom → top. Stable between changes (for useSyncExternalStore). */
export function getLayerStackSnapshot(): readonly string[] {
  return snapshot;
}

export function subscribeLayerStack(listener: () => void): () => void {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

export function isTopLayer(id: string): boolean {
  return layers.length > 0 && layers[layers.length - 1].id === id;
}

export function getLayerCount(): number {
  return layers.length;
}

function safeDismiss(layer: LayerRecord, behavior: LayerBehavior, reason: LayerDismissReason): void {
  try {
    behavior.onDismiss?.(reason);
  } catch (error) {
    devWarn(`[layerStack] onDismiss of layer "${layer.id}" threw`, error);
  }
}

// ---------------------------------------------------------------------------
// Dismissal
// ---------------------------------------------------------------------------

/**
 * Dismisses the topmost layer that accepts Escape. A modal layer that does
 * not accept Escape is a barrier: layers below it are left alone.
 * Returns true when a layer handled the key.
 */
export function dismissTopLayerOnEscape(): boolean {
  for (let i = layers.length - 1; i >= 0; i--) {
    const behavior = layers[i].getBehavior();
    if (behavior.closeOnEscape) {
      safeDismiss(layers[i], behavior, 'escape-key');
      return true;
    }
    if (behavior.modal) return false;
  }
  return false;
}

/**
 * Hardware back: dismisses the topmost layer that accepts back and returns
 * true. A modal layer that doesn't accept back swallows the press (returns
 * true without dismissing), matching how an RN Modal without a closing
 * `onRequestClose` behaves. Returns false when no layer is interested, so the
 * app's navigation handles it.
 */
export function handleBackPress(): boolean {
  for (let i = layers.length - 1; i >= 0; i--) {
    const behavior = layers[i].getBehavior();
    if (behavior.closeOnBack) {
      safeDismiss(layers[i], behavior, 'back-button');
      return true;
    }
    if (behavior.modal) return true;
  }
  return false;
}

/**
 * `onRequestClose` for React Native `Modal`s that host layers.
 *
 * - Native: Android delivers the back button to the Modal instead of
 *   BackHandler, so this forwards it to {@link handleBackPress}.
 * - Web: react-native-web fires `onRequestClose` on Escape *keyup*; the layer
 *   stack has already handled that Escape on keydown, so this does nothing
 *   (otherwise one press would close two layers).
 */
export function handleModalRequestClose(): void {
  if (isWeb) return;
  handleBackPress();
}

function containsNode(container: unknown, target: unknown): boolean {
  const element = resolveDOMElement(container);
  return !!element && !!target && element.contains(target as Node);
}

function isInsideLayer(behavior: LayerBehavior, target: unknown): boolean {
  if (containsNode(behavior.getContainer(), target)) return true;
  const ignore = behavior.getOutsidePressIgnoreNodes?.() ?? [];
  return ignore.some((node) => containsNode(node, target));
}

/**
 * Web outside-press. Every layer that closes on outside press and that the
 * press is outside of is dismissed — except layers under a modal layer, and
 * layers the press counts as "inside" because it hit a layer stacked above
 * them (clicking a submenu never closes its parent menu).
 */
export function handleOutsidePress(target: unknown): void {
  if (!target) return;
  const toDismiss: Array<{ layer: LayerRecord; behavior: LayerBehavior }> = [];
  const behaviors = layers.map((layer) => layer.getBehavior());

  for (let i = 0; i < layers.length; i++) {
    const behavior = behaviors[i];
    if (!behavior.closeOnOutsidePress) continue;
    if (isInsideLayer(behavior, target)) continue;

    let blocked = false;
    for (let j = i + 1; j < layers.length; j++) {
      if (behaviors[j].modal || isInsideLayer(behaviors[j], target)) {
        blocked = true;
        break;
      }
    }
    if (blocked) continue;
    toDismiss.push({ layer: layers[i], behavior });
  }

  // Top-down, so children close before their parents.
  for (let i = toDismiss.length - 1; i >= 0; i--) {
    safeDismiss(toDismiss[i].layer, toDismiss[i].behavior, 'outside-press');
  }
}

// ---------------------------------------------------------------------------
// Focus trap (web)
// ---------------------------------------------------------------------------

function topTrappingLayerIndex(): number {
  for (let i = layers.length - 1; i >= 0; i--) {
    if (layers[i].getBehavior().trapFocus) return i;
  }
  return -1;
}

function handleTabKey(event: KeyboardEvent): void {
  if (layers.length === 0) return;
  const top = layers[layers.length - 1].getBehavior();
  if (!top.trapFocus) return;
  const container = resolveDOMElement(top.getContainer());
  if (!container) return;

  const tabbables = getTabbableElements(container);
  if (tabbables.length === 0) {
    event.preventDefault();
    focusContainer(container);
    return;
  }

  const first = tabbables[0];
  const last = tabbables[tabbables.length - 1];
  const active = getActiveElement(container.ownerDocument);
  const outside = !active || !container.contains(active);

  if (event.shiftKey) {
    if (outside || active === first || active === container) {
      event.preventDefault();
      focusElement(last);
    }
  } else if (outside || active === last) {
    event.preventDefault();
    focusElement(first);
  }
}

function onFocusIn(event: FocusEvent): void {
  const index = topTrappingLayerIndex();
  if (index === -1) return;
  const target = event.target;
  for (let i = index; i < layers.length; i++) {
    if (containsNode(layers[i].getBehavior().getContainer(), target)) return;
  }
  const container = resolveDOMElement(layers[index].getBehavior().getContainer());
  if (!container) return;
  const first = getTabbableElements(container)[0];
  if (!first || !focusElement(first)) {
    focusContainer(container);
  }
}

// ---------------------------------------------------------------------------
// Global listeners
// ---------------------------------------------------------------------------

let pendingEscapeKeyUp: { remove: () => void } | null = null;

/**
 * After the stack consumes an Escape keydown, swallow the matching keyup too:
 * react-native-web's Modal closes itself on Escape *keyup*, which would
 * otherwise dismiss a second layer (e.g. the Dialog under a Select).
 */
function swallowNextEscapeKeyUp(doc: Document): void {
  pendingEscapeKeyUp?.remove();
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.stopPropagation();
    cleanup();
  };
  const timer = setTimeout(() => cleanup(), 1000);
  const cleanup = () => {
    clearTimeout(timer);
    doc.removeEventListener('keyup', onKeyUp, true);
    if (pendingEscapeKeyUp?.remove === cleanup) pendingEscapeKeyUp = null;
  };
  doc.addEventListener('keyup', onKeyUp, true);
  pendingEscapeKeyUp = { remove: cleanup };
}

function onDocumentKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Tab') {
    handleTabKey(event);
    return;
  }
  if (event.key !== 'Escape' && event.key !== 'Esc') return;
  if (event.isComposing) return;
  if (dismissTopLayerOnEscape()) {
    event.preventDefault();
    event.stopPropagation();
    const doc = (event.target as Node | null)?.ownerDocument ?? (typeof document !== 'undefined' ? document : null);
    if (doc) swallowNextEscapeKeyUp(doc);
  }
}

function onDocumentPointerDown(event: Event): void {
  handleOutsidePress(event.target);
}

let domListening = false;
let backSubscription: { remove: () => void } | null = null;

function onHardwareBackPress(): boolean {
  return handleBackPress();
}

function syncListeners(layerAdded: boolean): void {
  const shouldListen = layers.length > 0;

  if (hasDOM) {
    if (shouldListen && !domListening) {
      document.addEventListener('keydown', onDocumentKeyDown, true);
      document.addEventListener('pointerdown', onDocumentPointerDown, true);
      document.addEventListener('focusin', onFocusIn, true);
      domListening = true;
    } else if (!shouldListen && domListening) {
      document.removeEventListener('keydown', onDocumentKeyDown, true);
      document.removeEventListener('pointerdown', onDocumentPointerDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      domListening = false;
    }
    return;
  }

  if (isWeb) return;

  if (!shouldListen) {
    backSubscription?.remove();
    backSubscription = null;
    return;
  }
  // BackHandler calls the most recently added listener first. Re-adding on
  // every new layer keeps ours ahead of navigation listeners that registered
  // after the first layer opened.
  if (layerAdded || !backSubscription) {
    backSubscription?.remove();
    backSubscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
  }
}

/** Test helper: drops every layer and listener. */
export function __resetLayerStackForTests(): void {
  layers.length = 0;
  parentLinks.clear();
  pendingEscapeKeyUp?.remove();
  syncListeners(false);
  notify();
}
