import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Platform } from 'react-native';
import type { RefObject } from 'react';
import { devWarn } from '../utils/logger';
import type { LayerDismissReason } from '../overlay/layerStack';

/**
 * Layer-stack behaviour of an overlay (see `core/overlay/useLayer`). The
 * renderer registers every overlay as a layer. Omitted options use the
 * renderer's defaults.
 */
export interface OverlayLayerOptions {
  closeOnEscape?: boolean;
  closeOnBack?: boolean;
  closeOnOutsidePress?: boolean;
  modal?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  initialFocus?: 'first-tabbable' | 'container';
  initialFocusRef?: RefObject<unknown>;
  restoreFocus?: boolean;
  restoreFocusRef?: RefObject<unknown>;
}

export interface OverlayConfig {
  id: string;
  content: ReactNode;
  trigger?: 'click' | 'hover' | 'focus' | 'contextmenu' | 'manual';
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end' | 'auto';
  offset?: number;
  anchor?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /**
   * The anchor/trigger DOM node (web). Used by the non-blocking outside-click
   * detection so clicking the trigger doesn't count as an "outside" click (the
   * trigger handles its own toggle). Optional — omit for cursor-anchored overlays.
   */
  anchorNode?: unknown;
  /**
   * Viewport edge to pin the overlay to on its main axis, with the distance from
   * that edge. Supplied by the positioning layer for vertical placements.
   *
   * Pinning by the trigger-adjacent edge keeps the rendered position independent
   * of the overlay's own height, so content that grows or shrinks (a filtering
   * suggestion list) expands away from the trigger instead of dragging the whole
   * overlay with it. When absent the renderer falls back to `anchor.y`.
   */
  pinEdge?: 'top' | 'bottom';
  pinOffset?: number;
  width?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  onClose?: () => void;
  strategy?: 'absolute' | 'fixed' | 'portal';
  /** Stacking order. Defaults to the theme's `popover` layer (`getZIndex(theme, 'popover')`). */
  zIndex?: number;
  viewport?: {
    padding: number;
  };
  /**
   * id for the overlay's content container, so a trigger's `aria-controls`
   * resolves to a real element. (`useFloating` puts the id on the floating
   * element itself instead; this is for callers that hand the renderer bare content.)
   */
  floatingId?: string;
  /** ARIA role for the content container (e.g. 'dialog', 'menu', 'listbox'). */
  role?: string;
  /** Accessible name for the content container. */
  ariaLabel?: string;
  /** Explicit layer behaviour; see {@link OverlayLayerOptions}. */
  layer?: OverlayLayerOptions;
  /**
   * Called instead of closing the overlay when the layer stack asks it to
   * close (Escape, Android back, outside press). The owner then closes it —
   * which lets controlled components decide. Without it the overlay closes
   * itself (and `onClose` runs).
   */
  onDismissRequest?: (reason: LayerDismissReason) => void;
  /** Layer the overlay was opened from, so it always stacks above it. */
  parentLayerId?: string | null;
  /**
   * Viewport layer instead of an anchored one: the content fills the host
   * (the viewport, at the app root) and presses fall through everywhere its
   * own children don't cover. No backdrop, and `anchor` / `pin*` / sizing are
   * ignored — the content positions itself. See `ViewportPortal`.
   */
  fill?: boolean;
}

interface OverlayApiValue {
  openOverlay: (config: Omit<OverlayConfig, 'id'>) => string;
  closeOverlay: (id: string) => void;
  closeAllOverlays: () => void;
  updateOverlay: (id: string, updates: Partial<OverlayConfig>) => void;
}

// Split contexts: API vs. state so API consumers don't re-render on overlay list changes
const OverlayApiContext = createContext<OverlayApiValue | null>(null);
const OverlaysStateContext = createContext<OverlayConfig[] | null>(null);

// Overlay ids are unique across providers: an OverlayHost nests a provider
// inside a modal, and both providers' overlays share one layer stack.
let nextOverlayId = 0;

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [overlays, setOverlays] = useState<OverlayConfig[]>([]);

  const openOverlay = useCallback((config: Omit<OverlayConfig, 'id'>) => {
    const id = `overlay-${++nextOverlayId}`;
    const overlayConfig: OverlayConfig = {
      id,
      trigger: 'manual',
      placement: 'auto',
      offset: 8,
      strategy: Platform.OS === 'web' ? 'fixed' : 'portal',
      viewport: { padding: 8 },
      ...config,
    };

    setOverlays(prev => [...prev, overlayConfig]);
    return id;
  }, []);

  const closeOverlay = useCallback((id: string) => {
    setOverlays(prev => {
      const overlay = prev.find(o => o.id === id);
      // Schedule onClose after state commit to avoid setState during render warnings
      if (overlay?.onClose) {
        setTimeout(() => {
          try {
            if (overlay.onClose) {
              overlay.onClose();
            }
          } catch {
            devWarn('Error in overlay onClose callback');
          }
        }, 0);
      }
      return prev.filter(o => o.id !== id);
    });
  }, []);

  const updateOverlay = useCallback((id: string, updates: Partial<OverlayConfig>) => {
    setOverlays(prev => {
      let changed = false;
      const next = prev.map(overlay => {
        if (overlay.id !== id) return overlay;
        const merged = { ...overlay, ...updates };
        // Shallow equality checks to avoid no-op updates
        const a = overlay.anchor, b = merged.anchor;
        const sameAnchor = (
          (!!a === !!b) && (!a || (
            a.x === b!.x && a.y === b!.y && a.width === b!.width && a.height === b!.height
          ))
        );
        const sameMeta = overlay.width === merged.width && overlay.maxWidth === merged.maxWidth && overlay.maxHeight === merged.maxHeight && overlay.zIndex === merged.zIndex && overlay.strategy === merged.strategy && overlay.pinEdge === merged.pinEdge && overlay.pinOffset === merged.pinOffset && overlay.floatingId === merged.floatingId && overlay.role === merged.role && overlay.ariaLabel === merged.ariaLabel;
        const sameBehavior = overlay.layer === merged.layer && overlay.onDismissRequest === merged.onDismissRequest && overlay.anchorNode === merged.anchorNode && overlay.onClose === merged.onClose;
        const sameContent = overlay.content === merged.content;
        if (sameAnchor && sameMeta && sameBehavior && sameContent) {
          return overlay;
        }
        changed = true;
        return merged;
      });
      return changed ? next : prev;
    });
  }, []);

  const closeAllOverlays = useCallback(() => {
    setOverlays(prev => {
      // Schedule all onClose callbacks after state commit
      prev.forEach(overlay => {
        if (overlay.onClose) {
          setTimeout(() => {
            try {
              if (overlay.onClose) {
                overlay.onClose();
              }
            } catch {
              devWarn('Error in overlay onClose callback');
            }
          }, 0);
        }
      });
      return [];
    });
  }, []);

  const apiValue = useMemo<OverlayApiValue>(() => ({
    openOverlay,
    closeOverlay,
    closeAllOverlays,
    updateOverlay,
  }), [openOverlay, closeOverlay, closeAllOverlays, updateOverlay]);

  return (
    <OverlayApiContext.Provider value={apiValue}>
      <OverlaysStateContext.Provider value={overlays}>
        {children}
      </OverlaysStateContext.Provider>
    </OverlayApiContext.Provider>
  );
}

// Separate selectors, so a component that only opens overlays doesn't
// re-render when the list changes.
export function useOverlayApi(): OverlayApiValue {
  const api = useContext(OverlayApiContext);
  if (!api) {
    throw new Error('useOverlayApi must be used within an OverlayProvider');
  }
  return api;
}

// Non-throwing variant: returns null when no OverlayProvider is present so
// components can gracefully fall back to inline rendering (e.g. standalone/tests).
export function useOptionalOverlayApi(): OverlayApiValue | null {
  return useContext(OverlayApiContext);
}

export function useOverlays(): OverlayConfig[] {
  const overlays = useContext(OverlaysStateContext);
  if (!overlays) {
    throw new Error('useOverlays must be used within an OverlayProvider');
  }
  return overlays;
}

export type { OverlayApiValue };
