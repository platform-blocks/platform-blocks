import { hasDOM } from '../../core/platform';

import type { DragSelectionGuard } from './dragSelectionGuard.types';

export type { DragSelectionGuard } from './dragSelectionGuard.types';

/**
 * Web: keeps the browser's own text-selection drag from fighting a
 * press-and-drag value scrub.
 *
 * The gesture starts inside a focused <input>, so the browser runs its own
 * text-selection drag on the same pointer stream; nothing in the responder
 * system cancels that, which is why the value ended up highlighted while being
 * scrubbed. While active, this blocks `selectstart`, sets `user-select: none`
 * (body and field) with a resize cursor, collapses any selection on every move,
 * and blurs a focused field for the duration (the browser's `select` event
 * would otherwise terminate the responder); `end()` reports whether focus
 * should be handed back.
 */
export function createDragSelectionGuard(getInput: () => unknown): DragSelectionGuard {
  let active = false;
  let caret: number | null = null;
  let blurredForDrag = false;
  let prevBodyUserSelect = '';
  let prevBodyCursor = '';
  let prevInputUserSelect = '';
  let prevInputCursor = '';

  const getElement = (): HTMLInputElement | null => {
    const node = getInput() as HTMLInputElement | null;
    if (!node || typeof node.setSelectionRange !== 'function') return null;
    return node;
  };

  // `selectionStart` throws on input types without selection support, and this
  // runs inside a pointer-move handler where a throw would abort the gesture.
  const readSelectionRange = (element: HTMLInputElement) => {
    try {
      const { selectionStart, selectionEnd } = element;
      if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') return null;
      return { start: selectionStart, end: selectionEnd };
    } catch {
      return null;
    }
  };

  const preventSelectStart = (event: Event) => {
    if (active) event.preventDefault();
  };

  const collapse = () => {
    if (!hasDOM) return;

    const element = getElement();
    if (element) {
      const range = readSelectionRange(element);
      if (range && range.start !== range.end) {
        const text = element.value ?? '';
        const bounded = Math.max(0, Math.min(caret ?? text.length, text.length));
        try {
          element.setSelectionRange(bounded, bounded);
        } catch {
          // Some input modes reject programmatic selection; the highlight is cosmetic here.
        }
      }
    }

    // A drag that started on the label or description selects document text
    // instead, which the input's own selection API cannot clear.
    if (element && document.activeElement === element) return;
    const selection = document.getSelection?.();
    if (selection && !selection.isCollapsed) {
      selection.removeAllRanges();
    }
  };

  const begin = (axis: 'horizontal' | 'vertical') => {
    if (!hasDOM || active) return;

    const element = getElement();
    const cursor = axis === 'vertical' ? 'ns-resize' : 'ew-resize';
    // Where the pointer went down, so the caret can be parked there instead of
    // jumping once the browser's half-formed selection is collapsed.
    const range = element ? readSelectionRange(element) : null;

    active = true;
    caret = range && range.start === range.end ? range.start : null;

    const body = document.body;
    if (body) {
      prevBodyUserSelect = body.style.userSelect;
      prevBodyCursor = body.style.cursor;
      body.style.userSelect = 'none';
      body.style.cursor = cursor;
    }

    if (element) {
      // Form controls opt out of an inherited `user-select: none`, so the field needs its own.
      prevInputUserSelect = element.style.userSelect;
      prevInputCursor = element.style.cursor;
      element.style.userSelect = 'none';
      element.style.cursor = cursor;
    }

    document.addEventListener('selectstart', preventSelectStart);
    collapse();

    // `user-select: none` doesn't apply inside editable elements, so a focused
    // field still drag-selects its own text — and the resulting `select` event
    // terminates the responder. Handing focus back at the end keeps the field
    // typeable; holding it mid-scrub breaks the scrub.
    if (element && document.activeElement === element) {
      blurredForDrag = true;
      element.blur();
    }
  };

  const end = () => {
    if (!hasDOM || !active) return false;

    active = false;
    document.removeEventListener('selectstart', preventSelectStart);

    const body = document.body;
    if (body) {
      body.style.userSelect = prevBodyUserSelect;
      body.style.cursor = prevBodyCursor;
    }

    const element = getElement();
    if (element) {
      element.style.userSelect = prevInputUserSelect;
      element.style.cursor = prevInputCursor;
    }

    collapse();
    caret = null;

    const shouldRestoreFocus = blurredForDrag;
    blurredForDrag = false;
    return shouldRestoreFocus;
  };

  return { begin, collapse, end };
}
