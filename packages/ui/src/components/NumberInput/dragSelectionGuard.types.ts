/** Suppresses the browser's text selection while a value is scrubbed by dragging (no-op on native). */
export interface DragSelectionGuard {
  /** Start suppressing text selection for a drag along `axis`. */
  begin(axis: 'horizontal' | 'vertical'): void;
  /** Collapse any selection the drag produced so far. */
  collapse(): void;
  /** Stop suppressing; returns whether the field gave up focus for the drag and should get it back. */
  end(): boolean;
}
