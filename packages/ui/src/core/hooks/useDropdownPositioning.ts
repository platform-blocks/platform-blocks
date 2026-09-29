import { useCallback, useEffect, useRef } from 'react';
import type { View } from 'react-native';
import { useOverlayApi } from '../providers/OverlayProvider';
import { warnOnce } from '../utils/logger';
import { useParentLayerId } from '../overlay/useLayer';
import { usePopoverPositioning, UsePopoverPositioningOptions } from './usePopoverPositioning';

export interface UseDropdownPositioningOptions extends UsePopoverPositioningOptions {
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Called when the dropdown should close */
  onClose?: () => void;
  /** Whether to close on click outside */
  closeOnClickOutside?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** id put on the overlay's content container, so the trigger's `aria-controls` resolves. */
  floatingId?: string;
  /** ARIA role for the overlay's content container (e.g. 'listbox', 'dialog'). */
  role?: string;
}

/** `TAnchor` / `TPopover`: the host types the refs attach to (see `UsePopoverPositioningReturn`). */
export interface UseDropdownPositioningReturn<TAnchor = View, TPopover = View> {
  /** Current position result */
  position: import('../utils/positioning-enhanced').PositionResult | null;
  /** Update position manually. Pass `{ silent: true }` to skip the isPositioning flag. */
  updatePosition: (options?: { silent?: boolean }) => Promise<void>;
  /** Whether positioning is currently being calculated */
  isPositioning: boolean;
  /** Ref to attach to the anchor element */
  anchorRef: React.RefObject<TAnchor | null>;
  /** Ref to attach to the popover element for size measurement */
  popoverRef: React.RefObject<TPopover | null>;
  /** Function to create and show the overlay with content */
  showOverlay: (
    content: React.ReactElement,
    overrides?: {
      width?: number | string;
      maxHeight?: number | string;
      zIndex?: number;
      /**
       * Interaction that opened the overlay. `'hover'` is meaningful to the
       * renderer: hover overlays are exempt from outside-click dismissal, since
       * they close when the pointer leaves instead.
       */
      trigger?: 'click' | 'hover' | 'contextmenu' | 'manual';
      /** Defaults to `'fixed'`; pass `'portal'` for a native modal-hosted overlay. */
      strategy?: 'absolute' | 'fixed' | 'portal';
    }
  ) => void;
  /** Function to hide the overlay */
  hideOverlay: () => void;
  /**
   * False when there is no OverlayProvider above the component: `showOverlay`
   * is then a no-op (with a one-time dev warning) and the component should
   * render its dropdown inline instead.
   */
  hasOverlayProvider: boolean;
}

/**
 * The nearest OverlayProvider's API, or null. (`useOverlayApi` is a plain
 * context read that throws only when the provider is missing.)
 */
function useOverlayApiOrNull(): ReturnType<typeof useOverlayApi> | null {
  try {
    return useOverlayApi();
  } catch {
    return null;
  }
}

/**
 * Hook for managing dropdown positioning and overlay lifecycle.
 * 
 * This hook combines usePopoverPositioning with useOverlay to provide a complete
 * dropdown solution that handles:
 * - Intelligent positioning with viewport constraints
 * - Automatic flipping and shifting
 * - Overlay lifecycle management
 * - Click outside and escape key handling
 * 
 * Used by both AutoComplete and ColorInput components to ensure consistent
 * dropdown behavior across the component library.
 * 
 * @example
 * ```tsx
 * const { anchorRef, popoverRef, showOverlay, position } = useDropdownPositioning({
 *   isOpen: dropdownOpen,
 *   placement: 'bottom-start',
 *   flip: true,
 *   shift: true,
 *   onClose: () => setDropdownOpen(false),
 * });
 * 
 * // When ready to show dropdown
 * if (position) {
 *   showOverlay(<DropdownContent />);
 * }
 * ```
 */
export function useDropdownPositioning<TAnchor = View, TPopover = View>(
  options: UseDropdownPositioningOptions
): UseDropdownPositioningReturn<TAnchor, TPopover> {
  const {
    isOpen,
    onClose,
    closeOnClickOutside = true,
    closeOnEscape = true,
    floatingId,
    role,
    ...positioningOptions
  } = options;

  const overlayApi = useOverlayApiOrNull();
  // Warn only once a dropdown actually opens without a provider.
  if (isOpen && !overlayApi) {
    warnOnce(
      'useDropdownPositioning:no-provider',
      '[platform-blocks] A dropdown was rendered outside an OverlayProvider, so it cannot open as an overlay. ' +
        'Wrap the app in <PlatformBlocksProvider> (or <OverlayProvider> + <OverlayRenderer />).'
    );
  }
  const openOverlay = overlayApi?.openOverlay;
  const closeOverlay = overlayApi?.closeOverlay;
  const updateOverlay = overlayApi?.updateOverlay;
  const parentLayerId = useParentLayerId();
  const overlayIdRef = useRef<string | null>(null);

  // Use the existing positioning hook
  const {
    position,
    anchorRef,
    popoverRef,
    updatePosition,
    isPositioning,
  } = usePopoverPositioning<TAnchor, TPopover>(isOpen, positioningOptions);

  const hideOverlay = useCallback(() => {
    if (overlayIdRef.current) {
      closeOverlay?.(overlayIdRef.current);
      overlayIdRef.current = null;
    }
  }, [closeOverlay]);

  const showOverlay = useCallback((content: React.ReactElement, overrides: {
    width?: number | string;
    maxHeight?: number | string;
    zIndex?: number;
    trigger?: 'click' | 'hover' | 'contextmenu' | 'manual';
    strategy?: 'absolute' | 'fixed' | 'portal';
  } = {}) => {
    if (!position || !openOverlay || !updateOverlay) return;

    // Close existing overlay first
    const anchor = {
      x: position.x,
      y: position.y,
      width: position.finalWidth,
      height: position.finalHeight,
    };

    const width = overrides.width ?? position.finalWidth;
    const maxHeight = overrides.maxHeight ?? position.maxHeight;
    const zIndex = overrides.zIndex;

    // Edge pin, when the placement produced one. The renderer prefers it over
    // `anchor.y`, which keeps the dropdown still while its content resizes.
    const pin = position.anchorEdge && typeof position.anchorOffset === 'number'
      ? { pinEdge: position.anchorEdge, pinOffset: position.anchorOffset }
      : { pinEdge: undefined, pinOffset: undefined };

    if (overlayIdRef.current) {
      updateOverlay(overlayIdRef.current, {
        content,
        anchor,
        ...pin,
        width,
        maxHeight,
        floatingId,
        role,
        ...(zIndex !== undefined ? { zIndex } : {}),
      });
      return;
    }

    const overlayId = openOverlay({
      content,
      anchor,
      ...pin,
      anchorNode: anchorRef.current,
      width,
      maxHeight,
      strategy: overrides.strategy ?? 'fixed',
      closeOnClickOutside,
      closeOnEscape,
      floatingId,
      role,
      parentLayerId,
      ...(overrides.trigger !== undefined ? { trigger: overrides.trigger } : {}),
      ...(zIndex !== undefined ? { zIndex } : {}),
      onClose: () => {
        overlayIdRef.current = null;
        onClose?.();
      }
    });

    overlayIdRef.current = overlayId;
  }, [position, openOverlay, updateOverlay, closeOnClickOutside, closeOnEscape, onClose, floatingId, role, parentLayerId, anchorRef]);

  // Clean up overlay when component unmounts or isOpen becomes false
  useEffect(() => {
    if (!isOpen) {
      hideOverlay();
    }
  }, [isOpen, hideOverlay]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      hideOverlay();
    };
  }, [hideOverlay]);

  return {
    position,
    updatePosition,
    isPositioning,
    anchorRef,
    popoverRef,
    showOverlay,
    hideOverlay,
    hasOverlayProvider: !!overlayApi,
  };
}