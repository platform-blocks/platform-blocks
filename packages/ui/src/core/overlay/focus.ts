/**
 * DOM focus helpers for overlay layers (web only).
 *
 * Every function here tolerates a non-DOM value (a React Native host instance
 * on iOS/Android, `null`, a stale ref) and does nothing with it, so callers
 * don't have to branch on platform before calling.
 */

const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/** Minimal structural view of a DOM element, so this file needs no DOM lib casts at call sites. */
export type DOMElementLike = HTMLElement;

/** True when `value` is a DOM element (not an RN host instance or a plain object). */
export function isDOMElement(value: unknown): value is HTMLElement {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { nodeType?: unknown }).nodeType === 1 &&
    typeof (value as { contains?: unknown }).contains === 'function'
  );
}

/** Resolve a ref-ish value (ref object, element, or RN-web host instance) to a DOM element. */
export function resolveDOMElement(value: unknown): HTMLElement | null {
  if (!value) return null;
  const maybeRef = value as { current?: unknown };
  const target = 'current' in (maybeRef as object) ? maybeRef.current : value;
  return isDOMElement(target) ? target : null;
}

function isHiddenOrInert(element: HTMLElement): boolean {
  if (element.closest('[hidden],[inert],[aria-hidden="true"]')) return true;
  // `display: none` subtrees can't take focus. Skip the style check where the
  // environment has no layout engine to report it (it would only ever say "block").
  const view = element.ownerDocument?.defaultView;
  if (view && typeof view.getComputedStyle === 'function') {
    const style = view.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return true;
  }
  return false;
}

/** True when `element` is reachable with the Tab key. */
export function isTabbable(element: HTMLElement): boolean {
  if (!element.matches(TABBABLE_SELECTOR)) return false;
  const tabIndexAttr = element.getAttribute('tabindex');
  if (tabIndexAttr !== null && Number(tabIndexAttr) < 0) return false;
  if ((element as HTMLButtonElement).disabled) return false;
  return !isHiddenOrInert(element);
}

/** True when `element` can receive programmatic focus (tabbable, or tabindex="-1"). */
export function isFocusable(element: HTMLElement): boolean {
  if (isTabbable(element)) return true;
  return element.getAttribute('tabindex') !== null && !isHiddenOrInert(element);
}

/** Tabbable descendants of `container`, in DOM (tab) order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR));
  // Positive tabindex values are an anti-pattern and not supported here; DOM order wins.
  return nodes.filter(isTabbable);
}

/** Focus without scrolling the page when the browser supports the option. */
export function focusElement(element: HTMLElement | null | undefined): boolean {
  if (!element || typeof element.focus !== 'function') return false;
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
  return element.ownerDocument?.activeElement === element;
}

/**
 * Move focus to `target` if it is focusable, otherwise to its first tabbable
 * descendant, otherwise to its first programmatically focusable one
 * (`tabindex="-1"`, e.g. a menu item that roving focus keeps out of the tab
 * order). Used to return focus to a trigger whose ref points at a wrapper
 * around the actual button.
 */
export function focusElementOrFirstTabbable(target: HTMLElement | null | undefined): boolean {
  if (!target) return false;
  if (isFocusable(target)) return focusElement(target);
  const first = getTabbableElements(target)[0];
  if (first) return focusElement(first);
  const focusable = Array.from(target.querySelectorAll<HTMLElement>('[tabindex]')).find(isFocusable);
  return focusable ? focusElement(focusable) : false;
}

/**
 * Focus the container itself, making it programmatically focusable
 * (tabindex="-1") first if needed — the fallback when a layer has no tabbable
 * content, so keyboard focus still lands inside it.
 */
export function focusContainer(container: HTMLElement): boolean {
  if (container.getAttribute('tabindex') === null) {
    container.setAttribute('tabindex', '-1');
  }
  return focusElement(container);
}

/** The element that currently has focus, or null when focus is on <body>/nowhere. */
export function getActiveElement(doc: Document | undefined = typeof document !== 'undefined' ? document : undefined): HTMLElement | null {
  if (!doc) return null;
  let active = doc.activeElement as HTMLElement | null;
  // Follow focus into open shadow roots.
  while (active && active.shadowRoot && active.shadowRoot.activeElement) {
    active = active.shadowRoot.activeElement as HTMLElement;
  }
  if (!active || active === doc.body || active === doc.documentElement) return null;
  return active;
}
