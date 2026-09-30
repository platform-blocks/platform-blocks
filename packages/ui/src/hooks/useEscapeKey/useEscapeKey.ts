import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useLayer } from '../../core/overlay/useLayer';

/**
 * Calls `handler` when Escape is pressed (web) while `enabled`.
 *
 * A thin wrapper over the overlay layer stack: while enabled it registers a
 * focus-neutral layer, so Escape reaches it only when it is the topmost
 * layer. A Select opened inside a panel that uses this hook closes first;
 * the next Escape reaches the panel. It does not react to Android back.
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  const onEscape = useLatestCallback(handler);
  useLayer({
    active: enabled,
    onDismiss: () => {
      onEscape();
    },
    closeOnEscape: true,
    closeOnBack: false,
    closeOnOutsidePress: false,
    autoFocus: false,
    restoreFocus: false,
  });
}
