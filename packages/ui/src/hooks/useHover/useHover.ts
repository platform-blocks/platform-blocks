import { useCallback, useState } from 'react';

export interface UseHoverHandlers {
  /** Pointer entered the element. Wire to RN `onHoverIn` / `onMouseEnter`. */
  onHoverIn: () => void;
  /** Pointer left the element. Wire to RN `onHoverOut` / `onMouseLeave`. */
  onHoverOut: () => void;
  /** Web-only alias for `onHoverIn`. */
  onMouseEnter: () => void;
  /** Web-only alias for `onHoverOut`. */
  onMouseLeave: () => void;
}

export type UseHoverReturn = readonly [boolean, UseHoverHandlers];

/**
 * Returns hover state + handlers to spread onto a Pressable / View.
 * Cross-platform: handlers work for both RN's `onHoverIn`/`onHoverOut` and
 * DOM's `onMouseEnter`/`onMouseLeave`.
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

  return [
    hovered,
    {
      onHoverIn,
      onHoverOut,
      onMouseEnter: onHoverIn,
      onMouseLeave: onHoverOut,
    },
  ] as const;
}
