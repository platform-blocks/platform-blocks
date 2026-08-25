import { useCallback, useState } from 'react';

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
 * Boolean-state hook with `open` / `close` / `toggle` handlers — the canonical
 * Optional `onOpen` / `onClose` callbacks fire only on actual
 * transitions, never on no-op calls.
 *
 * @example
 * const [opened, { open, close, toggle }] = useDisclosure(false, {
 *   onOpen: () => console.log('opened'),
 *   onClose: () => console.log('closed'),
 * });
 */
export function useDisclosure(
  initialState: boolean = false,
  callbacks?: UseDisclosureCallbacks,
): UseDisclosureReturn {
  const [opened, setOpened] = useState<boolean>(initialState);

  const open = useCallback(() => {
    setOpened((isOpened) => {
      if (isOpened) return isOpened;
      callbacks?.onOpen?.();
      return true;
    });
  }, [callbacks]);

  const close = useCallback(() => {
    setOpened((isOpened) => {
      if (!isOpened) return isOpened;
      callbacks?.onClose?.();
      return false;
    });
  }, [callbacks]);

  const toggle = useCallback(() => {
    if (opened) {
      close();
    } else {
      open();
    }
  }, [opened, open, close]);

  return [opened, { open, close, toggle }] as const;
}
