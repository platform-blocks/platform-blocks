import { useCallback, useEffect, useRef } from 'react';

import { useLatestCallback } from '../../core/hooks/useLatestCallback';

/**
 * Field-level `onFocus` / `onBlur` for a control made of several focusable
 * parts (radio options, PIN cells): `onFocus` when focus enters the group,
 * `onBlur` once it has left — not on every move between parts (moving blurs
 * one part a tick before the next one takes focus).
 *
 * @returns handlers to call from each part's own onFocus / onBlur.
 */
export function useGroupFocus(onFocus?: () => void, onBlur?: () => void) {
  const emitFocus = useLatestCallback(onFocus);
  const emitBlur = useLatestCallback(onBlur);
  const insideRef = useRef(false);
  const pendingBlurRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pendingBlurRef.current) clearTimeout(pendingBlurRef.current);
    },
    []
  );

  const onPartFocus = useCallback(() => {
    if (pendingBlurRef.current) {
      // Focus moved to another part: still inside.
      clearTimeout(pendingBlurRef.current);
      pendingBlurRef.current = null;
      return;
    }
    if (insideRef.current) return;
    insideRef.current = true;
    emitFocus();
  }, [emitFocus]);

  const onPartBlur = useCallback(() => {
    if (pendingBlurRef.current) clearTimeout(pendingBlurRef.current);
    pendingBlurRef.current = setTimeout(() => {
      pendingBlurRef.current = null;
      insideRef.current = false;
      emitBlur();
    }, 0);
  }, [emitBlur]);

  return { onPartFocus, onPartBlur };
}
