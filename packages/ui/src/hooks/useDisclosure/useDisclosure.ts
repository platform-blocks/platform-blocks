import { useCallback, useMemo, useRef, useState } from 'react';

import { useLatestCallback } from '../../core/hooks/useLatestCallback';

export interface UseDisclosureCallbacks {
  /** Called when the state transitions from closed → open. */
  onOpen?: () => void;
  /** Called when the state transitions from open → closed. */
  onClose?: () => void;
}

export interface UseDisclosureHandlers {
  /** Set state to `true`. No-op if already open. */
  open: () => void;
  /** Set state to `false`. No-op if already closed. */
  close: () => void;
  /** Flip the state. */
  toggle: () => void;
}

export type UseDisclosureReturn = readonly [boolean, UseDisclosureHandlers];

/**
 * Boolean-state hook with `open` / `close` / `toggle` handlers. Optional
 * `onOpen` / `onClose` callbacks fire only on actual transitions, never on
 * no-op calls. The handlers object is stable for the component's lifetime
 * (callbacks may be inline functions; the latest ones are called).
 *
 * @example
 * const [opened, { open, close, toggle }] = useDisclosure(false, {
 *   onOpen: () => track('opened'),
 *   onClose: () => track('closed'),
 * });
 */
export function useDisclosure(
  initialState: boolean = false,
  callbacks?: UseDisclosureCallbacks,
): UseDisclosureReturn {
  const [opened, setOpened] = useState<boolean>(initialState);
  // Mirrors the latest requested state so repeated calls in one event see each
  // other, and so callbacks run in the handler — not inside a state updater,
  // which StrictMode may run twice.
  const openedRef = useRef(initialState);
  const onOpen = useLatestCallback(callbacks?.onOpen);
  const onClose = useLatestCallback(callbacks?.onClose);

  const open = useCallback(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    setOpened(true);
    onOpen();
  }, [onOpen]);

  const close = useCallback(() => {
    if (!openedRef.current) return;
    openedRef.current = false;
    setOpened(false);
    onClose();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (openedRef.current) close();
    else open();
  }, [open, close]);

  const handlers = useMemo(() => ({ open, close, toggle }), [open, close, toggle]);

  return useMemo(() => [opened, handlers] as const, [opened, handlers]);
}
