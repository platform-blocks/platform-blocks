import { useCallback, useMemo, useState } from 'react';

import type { WebMouseEvent } from '../../core/platform/webProps';

export interface UseHoverHandlers {
  /** Pointer entered the element. Wire to RN `onHoverIn` (Pressable). */
  onHoverIn: () => void;
  /** Pointer left the element. Wire to RN `onHoverOut` (Pressable). */
  onHoverOut: () => void;
  /**
   * Web-only alias for `onHoverIn`, for plain `View`s (react-native-web
   * forwards `onMouseEnter`; native ignores it).
   */
  onMouseEnter: (event?: WebMouseEvent) => void;
  /** Web-only alias for `onHoverOut`, for plain `View`s. */
  onMouseLeave: (event?: WebMouseEvent) => void;
}

export type UseHoverReturn = readonly [boolean, UseHoverHandlers];

/**
 * Returns hover state + handlers to spread onto a Pressable / View — the
 * library's sanctioned hover primitive (components don't attach raw mouse
 * handlers). Cross-platform: `onHoverIn`/`onHoverOut` for Pressable (web
 * mouse, iPad pointer), `onMouseEnter`/`onMouseLeave` for plain Views on web.
 * Setting the same state twice (both pairs firing on web) is a no-op.
 *
 * The handlers object is stable for the component's lifetime.
 *
 * @example
 * const [hovered, hoverHandlers] = useHover();
 * return (
 *   <Pressable {...hoverHandlers} style={hovered ? styles.active : styles.idle}>
 *     ...
 *   </Pressable>
 * );
 */
export function useHover(): UseHoverReturn {
  const [hovered, setHovered] = useState<boolean>(false);

  const onHoverIn = useCallback(() => setHovered(true), []);
  const onHoverOut = useCallback(() => setHovered(false), []);

  const handlers = useMemo<UseHoverHandlers>(
    () => ({
      onHoverIn,
      onHoverOut,
      onMouseEnter: onHoverIn,
      onMouseLeave: onHoverOut,
    }),
    [onHoverIn, onHoverOut]
  );

  return useMemo(() => [hovered, handlers] as const, [hovered, handlers]);
}
