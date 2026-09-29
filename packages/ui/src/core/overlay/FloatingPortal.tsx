import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { MutableRefObject, ReactNode, RefObject } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { useOptionalOverlayApi } from '../providers/OverlayProvider';
import type { OverlayConfig, OverlayLayerOptions } from '../providers/OverlayProvider';
import { hasDOM, isNative } from '../platform';
import type { PlacementType, PositionResult } from '../utils/positioning-enhanced';
import type { LayerDismissReason } from './layerStack';
import { LayerScope, useLayer } from './useLayer';
import { pointerEventsStyles } from '../platform/pointerEvents';

const useIsomorphicLayoutEffect = hasDOM || isNative ? useLayoutEffect : useEffect;


/** Why a floating element asked to close. `'closed-externally'`: something else closed its overlay (e.g. `closeAllOverlays`). */
export type FloatingDismissReason = LayerDismissReason | 'closed-externally';

/** Sizing overrides for one `renderFloating` call. */
export interface FloatingRenderOptions {
  /** Width of the floating container. Defaults to the anchor width with `matchWidth`, otherwise sized to content. */
  width?: number | string;
  /** Max height. Defaults to the space the positioner found on the chosen side. */
  maxHeight?: number | string;
  /** Max width. Defaults to the positioner's result. */
  maxWidth?: number | string;
}

/** Everything the portal needs from `useFloating`; built there, memoized. */
export interface FloatingPortalState {
  opened: boolean;
  position: PositionResult | null;
  /** Placement as requested (logical: mirrored later for RTL). Used by the inline fallback. */
  requestedPlacement: PlacementType;
  offset: number;
  matchWidth: boolean;
  zIndex: number;
  strategy: 'fixed' | 'absolute' | 'portal';
  trigger: OverlayConfig['trigger'];
  layer: OverlayLayerOptions;
  anchorRef: MutableRefObject<unknown>;
  parentLayerId: string | null;
  onDismissRequest: (reason: FloatingDismissReason) => void;
}

interface FloatingPortalProps {
  state: FloatingPortalState;
  content: ReactNode;
  renderOptions?: FloatingRenderOptions;
}

/**
 * Hands floating content to the nearest OverlayProvider (the app root's, or an
 * OverlayHost's inside a modal) and keeps it in sync; renders nothing itself.
 * Without a provider, renders the content inline next to the anchor instead.
 */
export function FloatingPortal({ state, content, renderOptions }: FloatingPortalProps) {
  const api = useOptionalOverlayApi();
  const overlayIdRef = useRef<string | null>(null);
  const apiRef = useRef(api);

  const { opened, position } = state;

  useIsomorphicLayoutEffect(() => {
    apiRef.current = api;
    if (!api) return;

    if (!opened || !position) {
      if (overlayIdRef.current) {
        const id = overlayIdRef.current;
        overlayIdRef.current = null;
        api.closeOverlay(id);
      }
      return;
    }

    const width = renderOptions?.width ?? (state.matchWidth ? position.finalWidth : undefined);
    const config: Omit<OverlayConfig, 'id'> = {
      content,
      anchor: {
        x: position.x,
        y: position.y,
        // The renderer uses anchor.width as a width fallback; 0 lets content size itself.
        width: typeof width === 'number' ? width : 0,
        height: position.finalHeight,
      },
      pinEdge: position.anchorEdge && typeof position.anchorOffset === 'number' ? position.anchorEdge : undefined,
      pinOffset: position.anchorEdge && typeof position.anchorOffset === 'number' ? position.anchorOffset : undefined,
      anchorNode: state.anchorRef.current,
      placement: position.placement,
      width,
      maxWidth: renderOptions?.maxWidth ?? position.maxWidth,
      maxHeight: renderOptions?.maxHeight ?? position.maxHeight,
      zIndex: state.zIndex,
      strategy: state.strategy,
      trigger: state.trigger,
      closeOnEscape: state.layer.closeOnEscape,
      closeOnClickOutside: state.layer.closeOnOutsidePress,
      layer: state.layer,
      parentLayerId: state.parentLayerId,
      onDismissRequest: state.onDismissRequest,
    };

    if (overlayIdRef.current) {
      api.updateOverlay(overlayIdRef.current, config);
      return;
    }

    const id = api.openOverlay({
      ...config,
      // Fires for every close; only an external close (not ours) matters.
      onClose: () => {
        if (overlayIdRef.current !== id) return;
        overlayIdRef.current = null;
        state.onDismissRequest('closed-externally');
      },
    });
    overlayIdRef.current = id;
  });

  // Close on unmount (the effect above only closes on state changes).
  useIsomorphicLayoutEffect(() => () => {
    const id = overlayIdRef.current;
    overlayIdRef.current = null;
    if (id) apiRef.current?.closeOverlay(id);
  }, []);

  if (api || !opened) return null;
  return <InlineFloating state={state} content={content} renderOptions={renderOptions} />;
}

/**
 * Fallback when no OverlayProvider is mounted: an absolutely positioned view
 * inside the anchor's container, placed with logical (start/end) insets so it
 * follows the layout direction. No flip/shift — it's a graceful degradation.
 */
function InlineFloating({ state, content, renderOptions }: FloatingPortalProps) {
  const containerRef = useRef<View>(null);
  const ignoreRefs = useMemo<ReadonlyArray<RefObject<unknown>>>(() => [state.anchorRef], [state.anchorRef]);

  const { id } = useLayer({
    active: true,
    ...state.layer,
    containerRef,
    outsidePressIgnoreRefs: ignoreRefs,
    parentId: state.parentLayerId,
    onDismiss: state.onDismissRequest,
  });

  const style = useMemo(
    () => getInlinePlacementStyle(state.requestedPlacement, state.offset, state.zIndex, renderOptions),
    [state.requestedPlacement, state.offset, state.zIndex, renderOptions]
  );

  return (
    <View ref={containerRef} style={[style, pointerEventsStyles.boxNone]}>
      <LayerScope id={id}>{content}</LayerScope>
    </View>
  );
}

export function getInlinePlacementStyle(
  placement: PlacementType,
  offset: number,
  zIndex: number,
  renderOptions?: FloatingRenderOptions
): ViewStyle {
  const [rawSide, align] = (placement === 'auto' ? 'bottom' : placement).split('-') as [string, string | undefined];
  const style: ViewStyle = {
    position: 'absolute',
    zIndex,
    width: renderOptions?.width as ViewStyle['width'],
    maxWidth: renderOptions?.maxWidth as ViewStyle['maxWidth'],
    maxHeight: renderOptions?.maxHeight as ViewStyle['maxHeight'],
  };

  // `left` / `right` are written for LTR; as logical sides they are start / end.
  if (rawSide === 'top' || rawSide === 'bottom') {
    if (rawSide === 'top') {
      style.bottom = '100%';
      style.marginBottom = offset;
    } else {
      style.top = '100%';
      style.marginTop = offset;
    }
    if (align === 'start') style.start = 0;
    else if (align === 'end') style.end = 0;
    else {
      style.start = 0;
      style.end = 0;
      style.alignItems = 'center';
    }
  } else {
    if (rawSide === 'left') {
      style.end = '100%';
      style.marginEnd = offset;
    } else {
      style.start = '100%';
      style.marginStart = offset;
    }
    if (align === 'start') style.top = 0;
    else if (align === 'end') style.bottom = 0;
    else {
      style.top = 0;
      style.bottom = 0;
      style.justifyContent = 'center';
    }
  }
  return style;
}
