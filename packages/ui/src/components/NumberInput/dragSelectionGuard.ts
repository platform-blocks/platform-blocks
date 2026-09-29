/**
 * Native counterpart of `dragSelectionGuard.web.ts`: there is no browser text
 * selection to fight while scrubbing, so every operation is a no-op.
 */
import type { DragSelectionGuard } from './dragSelectionGuard.types';

export type { DragSelectionGuard } from './dragSelectionGuard.types';

const NOOP_GUARD: DragSelectionGuard = {
  begin: () => {},
  collapse: () => {},
  end: () => false,
};

export function createDragSelectionGuard(_getInput: () => unknown): DragSelectionGuard {
  return NOOP_GUARD;
}
