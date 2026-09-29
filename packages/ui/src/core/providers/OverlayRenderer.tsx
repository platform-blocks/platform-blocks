import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nManager, Modal, Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

import { OverlayProvider, useOverlay } from './OverlayProvider';
import type { OverlayConfig } from './OverlayProvider';
import { useTheme } from '../theme/ThemeProvider';
import { getZIndex } from '../theme/zIndices';
import { isNative, isWeb } from '../platform';
import { handleModalRequestClose } from '../overlay/layerStack';
import type { LayerDismissReason } from '../overlay/layerStack';
import { LayerScope, useLayer } from '../overlay/useLayer';
import { getViewport } from '../utils/positioning-enhanced';
import { pointerEventsStyles } from '../platform/pointerEvents';

export interface OverlayRendererProps {
  /** Additional styles for each overlay's full-screen container */
  style?: StyleProp<ViewStyle>;
  /**
   * Set by `OverlayHost`: this renderer lives inside a modal's window, so
   * `'portal'` overlays render as plain views here instead of opening yet
   * another native Modal (which iOS can't present from outside the modal).
   */
  hosted?: boolean;
}

/** Page-coordinate frame of the renderer's parent (native), used to convert anchor coordinates. */
interface HostFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

// `pointerEvents` as a style (RN ≥ 0.71); the View prop is deprecated on react-native-web.
const PROBE_STYLE: StyleProp<ViewStyle> = [StyleSheet.absoluteFill, { pointerEvents: 'none' }];

type MeasurableNode = {
  measure?: (
    callback: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void
  ) => void;
};

/**
 * Renders the overlays of the nearest OverlayProvider.
 *
 * Every overlay is registered in the global layer stack (`core/overlay`),
 * which owns Escape (web), Android back and outside presses (web) and gives
 * each only to the topmost layer. Native: a transparent backdrop catches taps
 * outside; `'portal'` overlays open in an RN Modal whose `onRequestClose`
 * (Android back) goes to the layer stack.
 */
export function OverlayRenderer({ style, hosted = false }: OverlayRendererProps = {}) {
  const { overlays, closeOverlay } = useOverlay();

  // Native: overlay coordinates are page coordinates (from `measure`), but the
  // renderer's views are laid out inside its parent. A zero-interaction probe
  // filling the parent tells us where that parent sits so the two agree even
  // when the renderer isn't at the window origin (inside a SafeAreaView, or an
  // OverlayHost in a modal card).
  const probeRef = useRef<View>(null);
  const [frame, setFrame] = useState<HostFrame | null>(null);
  const measureFrame = useCallback(() => {
    const node = probeRef.current as unknown as MeasurableNode | null;
    node?.measure?.((_x, _y, width, height, pageX, pageY) => {
      if (typeof pageX !== 'number' || typeof pageY !== 'number') return;
      setFrame(prev =>
        prev && prev.x === pageX && prev.y === pageY && prev.width === width && prev.height === height
          ? prev
          : { x: pageX, y: pageY, width, height }
      );
    });
  }, []);

  const overlayCount = overlays.length;
  useEffect(() => {
    if (isNative && overlayCount > 0) measureFrame();
  }, [overlayCount, measureFrame]);

  const probe = isNative ? (
    <View
      ref={probeRef}
      style={PROBE_STYLE}
      collapsable={false}
      onLayout={measureFrame}
    />
  ) : null;

  if (overlayCount === 0) return probe;

  return (
    <>
      {probe}
      {overlays.map((overlay) => {
        const asNativeModal = isNative && !hosted && overlay.strategy === 'portal';

        if (asNativeModal) {
          return (
            <Modal
              key={overlay.id}
              visible
              transparent
              animationType="fade"
              statusBarTranslucent
              // Android delivers the back button here rather than to
              // BackHandler; the layer stack dismisses the topmost layer.
              onRequestClose={handleModalRequestClose}
            >
              {/* A nested host (what OverlayHost does), so floating content
                  opened from inside this overlay — a submenu, a select in a
                  popover — renders in this Modal above it instead of trying to
                  present a second root Modal, which iOS refuses. */}
              <OverlayProvider>
                <OverlayContent overlay={overlay} closeOverlay={closeOverlay} frame={null} style={style} />
                <OverlayRenderer hosted />
              </OverlayProvider>
            </Modal>
          );
        }

        return (
          <OverlayContent
            key={overlay.id}
            overlay={overlay}
            closeOverlay={closeOverlay}
            frame={isNative ? frame : null}
            style={style}
          />
        );
      })}
    </>
  );
}

const FILL: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

interface OverlayContentProps {
  overlay: OverlayConfig;
  closeOverlay: (id: string) => void;
  frame: HostFrame | null;
  style?: StyleProp<ViewStyle>;
}

function OverlayContent({ overlay, closeOverlay, frame, style }: OverlayContentProps) {
  const theme = useTheme();
  const contentRef = useRef<View>(null);

  const layerOptions = overlay.layer;
  const closeOnEscape = layerOptions?.closeOnEscape ?? overlay.closeOnEscape !== false;
  const closeOnOutsidePress =
    layerOptions?.closeOnOutsidePress ?? (overlay.closeOnClickOutside !== false && overlay.trigger !== 'hover');
  const modal = layerOptions?.modal ?? false;

  const dismiss = (reason: LayerDismissReason) => {
    if (overlay.onDismissRequest) {
      overlay.onDismissRequest(reason);
    } else {
      closeOverlay(overlay.id);
    }
  };

  // The trigger toggles itself, so presses on it are not "outside".
  const ignoreRefs = useMemo(() => [{ current: overlay.anchorNode as unknown }], [overlay.anchorNode]);

  const { id: layerId } = useLayer({
    active: true,
    parentId: overlay.parentLayerId,
    containerRef: contentRef,
    outsidePressIgnoreRefs: ignoreRefs,
    onDismiss: dismiss,
    closeOnEscape,
    closeOnBack: layerOptions?.closeOnBack ?? closeOnEscape,
    closeOnOutsidePress,
    modal,
    trapFocus: layerOptions?.trapFocus ?? modal,
    // Legacy overlays (no `layer` options) manage focus themselves.
    autoFocus: layerOptions?.autoFocus ?? false,
    initialFocus: layerOptions?.initialFocus,
    initialFocusRef: layerOptions?.initialFocusRef,
    restoreFocus: layerOptions?.restoreFocus ?? false,
    restoreFocusRef: layerOptions?.restoreFocusRef,
  });

  const zIndex = overlay.zIndex ?? getZIndex(theme, 'popover');
  const originX = frame?.x ?? 0;
  const originY = frame?.y ?? 0;
  const x = (overlay.anchor?.x || 0) - originX;

  // With I18nManager RTL, RN swaps `left`/`right` by default; `right` is then
  // the physical left edge. Coordinates here are physical, so undo the swap.
  const swapsLeftRight = isNative && I18nManager.isRTL && I18nManager.doLeftAndRightSwapInRTL !== false;

  const overlayStyle: ViewStyle = {
    // Use fixed positioning on web for viewport-anchored overlays
    position: (isWeb && overlay.strategy === 'fixed') ? ('fixed' as ViewStyle['position']) : 'absolute',
    ...(swapsLeftRight ? { right: x } : { left: x }),
    zIndex,
    pointerEvents: 'auto',
    width: (overlay.width || (overlay.anchor?.width ? overlay.anchor.width : undefined)) as ViewStyle['width'],
    maxWidth: overlay.maxWidth as ViewStyle['maxWidth'],
    maxHeight: overlay.maxHeight as ViewStyle['maxHeight'],
  };

  // Pin to the trigger-adjacent viewport edge when the positioning layer supplied
  // one. A `bottom` pin is what makes an above-the-trigger overlay grow upward
  // without its top coordinate depending on its own height — the overlay can
  // then change size (filtering a list, loading more rows) without moving.
  //
  // Both edges are plain numbers, so this works identically on web and native;
  // it replaces an earlier web-only `calc(100vh - …)` that derived the edge from
  // the overlay's *estimated* height and so mispositioned until re-measured.
  if (overlay.pinEdge === 'bottom' && typeof overlay.pinOffset === 'number') {
    // The pin is measured from the viewport bottom; convert to the parent's bottom.
    const parentBottomGap = frame ? getViewport().height - (frame.y + frame.height) : 0;
    overlayStyle.bottom = overlay.pinOffset - parentBottomGap;
  } else if (overlay.pinEdge === 'top' && typeof overlay.pinOffset === 'number') {
    overlayStyle.top = overlay.pinOffset - originY;
  } else {
    overlayStyle.top = (overlay.anchor?.y || 0) - originY;
  }

  const backdropStyle: ViewStyle = {
    ...FILL,
    zIndex: zIndex - 1,
    backgroundColor: 'transparent',
  };

  // Web: a fixed container ensures overlay contents can anchor to the viewport reliably.
  const containerStyle: ViewStyle = isWeb
    ? {
        position: (overlay.strategy === 'fixed' ? 'fixed' : 'absolute') as ViewStyle['position'],
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }
    : FILL;

  return (
    <View style={[containerStyle, pointerEventsStyles.boxNone, style]}>
      {/* Backdrop for tap-outside on native. Web uses the layer stack's
          non-blocking document listener instead, so the click isn't swallowed. */}
      {!isWeb && closeOnOutsidePress && (
        <Pressable
          style={backdropStyle}
          onPress={() => dismiss('outside-press')}
          role="button"
          aria-label="Close overlay"
        />
      )}

      <View
        ref={contentRef}
        style={overlayStyle}
        id={overlay.floatingId}
        nativeID={overlay.floatingId}
        role={overlay.role as ViewProps['role']}
        aria-label={overlay.ariaLabel}
        aria-modal={modal || undefined}
      >
        <LayerScope id={layerId}>{overlay.content}</LayerScope>
      </View>
    </View>
  );
}
