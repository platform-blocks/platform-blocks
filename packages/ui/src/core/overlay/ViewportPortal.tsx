import React, { useRef } from 'react';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { useLatestCallback } from '../hooks/useLatestCallback';
import { isWeb, webStyle } from '../platform';
import { pointerEventsStyles } from '../platform/pointerEvents';
import { useOptionalOverlayApi } from '../providers/OverlayProvider';
import type { OverlayConfig } from '../providers/OverlayProvider';
import type { LayerDismissReason } from './layerStack';
import { LayerScope, useLayer, useParentLayerId } from './useLayer';

export interface ViewportPortalProps {
  /** Content, positioned absolutely against the viewport. */
  children: ReactNode;
  /**
   * Render at the app root through the nearest OverlayProvider, clear of any
   * ancestor's `overflow` / `transform`. `false` (or no provider) renders the
   * layer in place. @default true
   */
  withinPortal?: boolean;
  /** Stacking order of the layer. */
  zIndex: number;
  /** Close on Escape (web) / Android back while this is the topmost layer that accepts it. @default false */
  closeOnEscape?: boolean;
  /** Called when Escape / back asks the layer to close. */
  onDismiss?: (reason: LayerDismissReason) => void;
}

const FILL: ViewStyle = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 };

/**
 * A click-through layer the size of the viewport, for content that positions
 * itself against the screen rather than an anchor: ActionBar, FloatingWindow.
 *
 * It renders through the OverlayProvider at the app root (a plain view there on
 * native, never an RN Modal, so the page stays interactive), sits in the layer
 * stack so Escape reaches it after anything opened above it, and passes
 * presses through everywhere its children don't cover. Children must position
 * themselves (`position: 'absolute'` against the layer's edges).
 */
export function ViewportPortal({
  children,
  withinPortal = true,
  zIndex,
  closeOnEscape = false,
  onDismiss,
}: ViewportPortalProps) {
  const api = useOptionalOverlayApi();
  const parentLayerId = useParentLayerId();
  const overlayIdRef = useRef<string | null>(null);
  const apiRef = useRef(api);
  const dismiss = useLatestCallback(onDismiss);
  const portaled = withinPortal && !!api;

  useIsomorphicLayoutEffect(() => {
    apiRef.current = api;
    if (!portaled || !api) {
      if (overlayIdRef.current) {
        apiRef.current?.closeOverlay(overlayIdRef.current);
        overlayIdRef.current = null;
      }
      return;
    }
    const config: Omit<OverlayConfig, 'id'> = {
      content: children,
      fill: true,
      strategy: 'fixed',
      trigger: 'manual',
      zIndex,
      layer: {
        closeOnEscape,
        closeOnBack: closeOnEscape,
        closeOnOutsidePress: false,
        autoFocus: false,
        restoreFocus: false,
      },
      parentLayerId,
      onDismissRequest: (reason) => dismiss(reason),
    };
    if (overlayIdRef.current) {
      api.updateOverlay(overlayIdRef.current, config);
      return;
    }
    overlayIdRef.current = api.openOverlay(config);
  });

  useIsomorphicLayoutEffect(() => () => {
    const id = overlayIdRef.current;
    overlayIdRef.current = null;
    if (id) apiRef.current?.closeOverlay(id);
  }, []);

  if (portaled) return null;
  return (
    <InlineViewportLayer zIndex={zIndex} closeOnEscape={closeOnEscape} onDismiss={dismiss}>
      {children}
    </InlineViewportLayer>
  );
}

/** In-place fallback: `position: fixed` on web, the parent's box on native. */
function InlineViewportLayer({
  children,
  zIndex,
  closeOnEscape,
  onDismiss,
}: {
  children: ReactNode;
  zIndex: number;
  closeOnEscape: boolean;
  onDismiss: (reason: LayerDismissReason) => void;
}) {
  const containerRef = useRef<View>(null);
  const { id } = useLayer({
    active: true,
    containerRef,
    closeOnEscape,
    closeOnBack: closeOnEscape,
    closeOnOutsidePress: false,
    autoFocus: false,
    restoreFocus: false,
    onDismiss,
  });

  return (
    <View
      ref={containerRef}
      style={[FILL, { zIndex }, isWeb ? webStyle({ position: 'fixed' }) : null, pointerEventsStyles.boxNone]}
    >
      <LayerScope id={id}>{children}</LayerScope>
    </View>
  );
}
