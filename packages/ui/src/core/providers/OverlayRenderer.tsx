import React, { useEffect, useRef, ReactNode } from 'react';
import { View, Modal, Platform, ViewStyle, StyleSheet, Pressable } from 'react-native';
import { useOverlay } from './OverlayProvider';
import { useTheme } from '../theme/ThemeProvider';

export interface OverlayRendererProps {
  /** Additional styles for the overlay container */
  style?: ViewStyle;
}

export function OverlayRenderer({ style }: OverlayRendererProps = {}) {
  const { overlays, closeOverlay } = useOverlay();
  const theme = useTheme();

  // Maps each overlay id -> its content DOM node (web) for outside-click hit-testing.
  const contentNodesRef = useRef<Map<string, any>>(new Map());

  // Debug: uncomment to inspect overlay render cycles
  // console.log('OverlayRenderer render:', overlays.length, 'overlays');

  // Non-blocking outside-click detection (web).
  //
  // Previously a full-screen transparent <Pressable> backdrop caught outside
  // clicks — but it also *swallowed* them, so clicking another trigger while a
  // popover was open wasted a click (it only closed the first popover). Here we
  // instead listen on the document, so the click still reaches whatever was
  // clicked (the next trigger opens, a button fires) while the overlay closes.
  //
  // An overlay closes only when the pointer target is outside: (a) its own
  // content, (b) its anchor/trigger — which handles its own toggle — and (c) any
  // overlay stacked above it, so clicking inside a submenu never closes its parent.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (overlays.length === 0) return;

    const handler = (event: any) => {
      const target = event.target;
      const nodes = contentNodesRef.current;
      const contains = (node: any) => !!(node && typeof node.contains === 'function' && node.contains(target));

      for (let i = 0; i < overlays.length; i++) {
        const ov = overlays[i];
        if (!ov.closeOnClickOutside || ov.trigger === 'hover') continue;
        if (contains(nodes.get(ov.id))) continue;      // inside the overlay itself
        if (contains(ov.anchorNode)) continue;         // on its trigger (trigger toggles itself)

        // Inside an overlay stacked above this one? (e.g. a submenu of this menu)
        let insideAbove = false;
        for (let j = i + 1; j < overlays.length; j++) {
          if (contains(nodes.get(overlays[j].id)) || contains(overlays[j].anchorNode)) {
            insideAbove = true;
            break;
          }
        }
        if (insideAbove) continue;

        closeOverlay(ov.id);
      }
    };

    // Capture phase + no preventDefault → we detect the click without blocking it.
    document.addEventListener('pointerdown', handler, true);
    return () => document.removeEventListener('pointerdown', handler, true);
  }, [overlays, closeOverlay]);

  // Handle escape key for web
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close topmost overlay that supports escape
        const topOverlay = overlays
          .filter(o => o.closeOnEscape)
          .slice(-1)[0];
        
        if (topOverlay) {
          closeOverlay(topOverlay.id);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [overlays, closeOverlay]);

  if (overlays.length === 0) return null;

  return (
    <>
      {overlays.map((overlay, index) => {
        const isTopmost = index === overlays.length - 1;
        
        if (overlay.strategy === 'portal' && Platform.OS !== 'web') {
          // Use Modal for React Native
          return (
            <Modal
              key={overlay.id}
              visible={true}
              transparent={true}
              animationType="fade"
              statusBarTranslucent
            >
              <OverlayContent
                overlay={overlay}
                isTopmost={isTopmost}
                nodesMap={contentNodesRef.current}
                overlayId={overlay.id}
                onBackdropPress={() => {
                  if (overlay.closeOnClickOutside) {
                    closeOverlay(overlay.id);
                  }
                }}
              />
            </Modal>
          );
        }

        // Render overlays directly for web and other cases
        return (
          <OverlayContent
            key={overlay.id}
            overlay={overlay}
            isTopmost={isTopmost}
            nodesMap={contentNodesRef.current}
            overlayId={overlay.id}
            onBackdropPress={() => {
              if (overlay.closeOnClickOutside) {
                closeOverlay(overlay.id);
              }
            }}
          />
        );
      })}
    </>
  );
}

interface OverlayContentProps {
  overlay: any;
  isTopmost: boolean;
  onBackdropPress: () => void;
  nodesMap?: Map<string, any>;
  overlayId?: string;
}

function OverlayContent({ overlay, isTopmost, onBackdropPress, nodesMap, overlayId }: OverlayContentProps) {
  const theme = useTheme();
  const contentRef = useRef<any>(null);

  // Register this overlay's content node so OverlayRenderer's outside-click
  // listener can hit-test against it (web).
  useEffect(() => {
    if (!nodesMap || !overlayId) return;
    nodesMap.set(overlayId, contentRef.current);
    return () => {
      nodesMap.delete(overlayId);
    };
  }, [nodesMap, overlayId]);

  const DEBUG = (overlay as any).debug === true;
  if (DEBUG) {
    console.log('Rendering overlay content:');
    console.log('- anchor:', overlay.anchor);
    console.log('- placement:', overlay.placement);
    console.log('- strategy:', overlay.strategy);
    console.log('- zIndex:', overlay.zIndex);
  }

  const overlayStyle: ViewStyle & any = {
    // Use fixed positioning on web for viewport-anchored overlays
    position: (Platform.OS === 'web' && overlay.strategy === 'fixed') ? ('fixed' as any) : 'absolute',
    left: overlay.anchor?.x || 0,
    zIndex: overlay.zIndex,
    width: overlay.width || (overlay.anchor?.width ? overlay.anchor.width : undefined),
    maxWidth: overlay.maxWidth,
    maxHeight: overlay.maxHeight,
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
    overlayStyle.top = undefined;
    overlayStyle.bottom = overlay.pinOffset;
  } else if (overlay.pinEdge === 'top' && typeof overlay.pinOffset === 'number') {
    overlayStyle.top = overlay.pinOffset;
  } else {
    overlayStyle.top = overlay.anchor?.y || 0;
  }

  if (DEBUG) {
    console.log('- overlayStyle:', overlayStyle);
  }

  const backdropStyle: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: overlay.zIndex - 1,
    backgroundColor: 'transparent',
  };

  // For web, use a container that properly positions overlays relative to viewport
  const containerStyle: ViewStyle & any = Platform.OS === 'web' ? {
    // Fixed container ensures overlay contents can anchor to viewport reliably
    position: (overlay.strategy === 'fixed') ? ('fixed' as any) : 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none',
  } : {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'box-none',
  };

  return (
    <View style={containerStyle} pointerEvents="box-none">
      {/* Backdrop for click-outside detection.
          Web uses a non-blocking document listener in OverlayRenderer instead, so
          the click isn't swallowed — only native keeps the tap-catcher backdrop. */}
      {Platform.OS !== 'web' && overlay.closeOnClickOutside && overlay.trigger !== 'hover' && (
        <Pressable
          style={backdropStyle}
          onPress={onBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Close overlay"
        />
      )}

      {/* Overlay content */}
      <View ref={contentRef} style={overlayStyle} pointerEvents="auto">
        {overlay.content}
      </View>
    </View>
  );
}
