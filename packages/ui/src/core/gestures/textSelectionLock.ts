import { Platform } from 'react-native';

/**
 * Web-only text-selection lock held while a pointer drag is in flight.
 *
 * A mouse drag that starts on a control and leaves it selects every piece of
 * text it sweeps over, which leaves the page looking broken once the drag ends.
 * Suppressing selection on the surface alone is not enough — the selection is
 * anchored on the surface but extends into the document — so the lock goes on
 * `document.body`.
 *
 * Ref-counted at module scope (rather than per component) so two controls that
 * overlap in time restore the author's original `user-select` exactly once.
 */

let lockCount = 0;
let savedUserSelect: string | null = null;

const isWeb = () => Platform.OS === 'web' && typeof document !== 'undefined';

/** Take (or increment) the text-selection lock. No-op off web. */
export const acquireTextSelectionLock = (): void => {
  if (!isWeb()) return;
  const body = document.body;
  if (!body) return;
  lockCount += 1;
  if (lockCount > 1) return;
  savedUserSelect = body.style.userSelect ?? '';
  body.style.userSelect = 'none';
  (body.style as any).webkitUserSelect = 'none';
};

/** Release (or decrement) the text-selection lock. No-op off web. */
export const releaseTextSelectionLock = (): void => {
  if (!isWeb()) return;
  const body = document.body;
  if (!body) return;
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount > 0) return;
  body.style.userSelect = savedUserSelect ?? '';
  (body.style as any).webkitUserSelect = savedUserSelect ?? '';
  savedUserSelect = null;
};

/** Drop the lock regardless of depth. Teardown paths only. */
export const resetTextSelectionLock = (): void => {
  if (lockCount === 0) return;
  lockCount = 1;
  releaseTextSelectionLock();
};

/** Current lock depth. Exposed for tests. */
export const getTextSelectionLockCount = (): number => lockCount;
