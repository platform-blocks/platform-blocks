import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Pressable, ScrollView, Platform, Dimensions } from 'react-native';
// NOTE: Direct imports to avoid circular barrel dependency
import { Text } from '../Text';
import { Card } from '../Card';
import { useOptionalOverlayApi } from '../../core/providers/OverlayProvider';
import { useControllableState } from '../../hooks/useControllableState';
import type { ContextMenuItem, ContextMenuProps } from './types';
export type { ContextMenuItem, ContextMenuProps } from './types';

interface Coords { x: number; y: number }

// Rough estimate used only to keep the menu inside the viewport; the real size is
// laid out by the content itself once rendered.
const ESTIMATED_WIDTH = 200;
const ROW_HEIGHT = 32;
const VIEWPORT_PADDING = 8;

export const ContextMenu = React.forwardRef<View, ContextMenuProps>(({
  children,
  items,
  closeOnSelect = true,
  longPressDelay = 350,
  maxHeight = 280,
  onOpen,
  onClose,
  open: controlledOpen,
  position: controlledPosition,
  style,
}, ref) => {
  const [actualOpen, setOpen] = useControllableState<boolean>({
    value: controlledOpen,
    defaultValue: false,
  });
  const [coords, setCoords] = useState<Coords>({ x: 0, y: 0 });
  const longPressTimer = useRef<any>(null);

  // When an OverlayProvider is available (the default via PlatformBlocksProvider),
  // the menu is portaled through the app-level OverlayRenderer so it escapes any
  // `overflow: hidden` ancestor and is positioned in viewport coordinates. Without
  // a provider (e.g. isolated tests) we fall back to inline absolute rendering.
  const overlayApi = useOptionalOverlayApi();
  const usePortal = overlayApi !== null;
  const overlayIdRef = useRef<string | null>(null);

  const effectivePos = controlledPosition ?? coords;

  // Clamp a raw pointer position so the menu stays on screen.
  const clampToViewport = useCallback((x: number, y: number): Coords => {
    const { width: winW, height: winH } = Dimensions.get('window');
    const estHeight = Math.min(maxHeight, items.length * ROW_HEIGHT + 8);
    let nextX = x;
    let nextY = y;
    if (nextX + ESTIMATED_WIDTH > winW - VIEWPORT_PADDING) {
      nextX = Math.max(VIEWPORT_PADDING, winW - ESTIMATED_WIDTH - VIEWPORT_PADDING);
    }
    if (nextY + estHeight > winH - VIEWPORT_PADDING) {
      nextY = Math.max(VIEWPORT_PADDING, winH - estHeight - VIEWPORT_PADDING);
    }
    return { x: nextX, y: nextY };
  }, [items.length, maxHeight]);

  const openAt = useCallback((x: number, y: number) => {
    setCoords(clampToViewport(x, y));
    if (!actualOpen) {
      setOpen(true);
      onOpen?.();
    }
  }, [actualOpen, setOpen, onOpen, clampToViewport]);

  const handleOverlayClosed = useCallback(() => {
    overlayIdRef.current = null;
    setOpen(false);
    onClose?.();
  }, [setOpen, onClose]);

  const handleSelect = useCallback((item: ContextMenuItem) => {
    item.onSelect?.();
    if (!closeOnSelect) return;
    if (usePortal) {
      if (overlayIdRef.current) overlayApi!.closeOverlay(overlayIdRef.current);
    } else {
      setOpen(false);
      if (actualOpen) onClose?.();
    }
  }, [closeOnSelect, usePortal, overlayApi, setOpen, actualOpen, onClose]);

  // The menu surface, shared by the portal and inline-fallback paths.
  const renderMenu = useCallback(() => (
    <Card shadow="md" style={{ paddingVertical: 4, minWidth: 160 }}>
      <ScrollView style={{ maxHeight }} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <Pressable
            key={item.id}
            disabled={item.disabled}
            onPress={() => handleSelect(item)}
            style={({ pressed }) => ({
              opacity: item.disabled ? 0.4 : 1,
              backgroundColor: pressed ? 'rgba(0,0,0,0.06)' : 'transparent',
              paddingHorizontal: 10,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            })}
          >
            {item.icon && <View style={{ width: 16, alignItems: 'center' }}>{item.icon}</View>}
            <Text size="xs" color={item.danger ? 'error' : 'gray'} style={{ fontWeight: 500 }}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Card>
  ), [items, maxHeight, handleSelect]);

  // Sync the portaled overlay to the open state + pointer position.
  useEffect(() => {
    if (!usePortal) return;
    if (actualOpen) {
      const config = {
        content: renderMenu(),
        anchor: { x: effectivePos.x, y: effectivePos.y, width: 0, height: 0 },
        placement: 'bottom-start' as const,
        trigger: 'contextmenu' as const,
        closeOnClickOutside: true,
        closeOnEscape: true,
        onClose: handleOverlayClosed,
      };
      if (overlayIdRef.current) {
        overlayApi!.updateOverlay(overlayIdRef.current, config);
      } else {
        overlayIdRef.current = overlayApi!.openOverlay(config);
      }
    } else if (overlayIdRef.current) {
      overlayApi!.closeOverlay(overlayIdRef.current);
      overlayIdRef.current = null;
    }
  }, [usePortal, actualOpen, effectivePos.x, effectivePos.y, renderMenu, handleOverlayClosed]);

  // Close any open overlay on unmount.
  useEffect(() => () => {
    if (overlayIdRef.current) overlayApi?.closeOverlay(overlayIdRef.current);
  }, [overlayApi]);

  const close = useCallback(() => {
    if (usePortal) {
      if (overlayIdRef.current) overlayApi!.closeOverlay(overlayIdRef.current);
    } else {
      setOpen(false);
      if (actualOpen) onClose?.();
    }
  }, [usePortal, overlayApi, setOpen, actualOpen, onClose]);

  // Inline-fallback only: close on click outside / scroll (web).
  useEffect(() => {
    if (usePortal) return;
    if (Platform.OS !== 'web') return;
    if (!actualOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest && target.closest('[data-context-menu]')) return;
      close();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [usePortal, actualOpen, close]);

  const extractCoords = (e: any): Coords => {
    const ne = e?.nativeEvent ?? e;
    if (Platform.OS === 'web') {
      // Viewport coordinates — the overlay uses `position: fixed` on web.
      return { x: ne?.clientX ?? e?.clientX ?? 0, y: ne?.clientY ?? e?.clientY ?? 0 };
    }
    return { x: ne?.pageX ?? ne?.locationX ?? 0, y: ne?.pageY ?? ne?.locationY ?? 0 };
  };

  const triggerProps = {
    onContextMenu: (e: any) => {
      e.preventDefault?.();
      const { x, y } = extractCoords(e);
      openAt(x, y);
    },
    onPressIn: (e: any) => {
      if (Platform.OS === 'web') return; // rely on contextmenu for web
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      const { x, y } = extractCoords(e);
      longPressTimer.current = setTimeout(() => {
        openAt(x, y);
      }, longPressDelay);
    },
    onPressOut: () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    }
  };

  return (
    <View ref={ref} style={style}>
      {children(triggerProps)}
      {!usePortal && actualOpen && (
        <View
          style={{
            position: 'absolute',
            top: effectivePos.y,
            left: effectivePos.x,
            zIndex: 1000,
            maxHeight,
            minWidth: 160,
          }}
          data-context-menu
        >
          {renderMenu()}
        </View>
      )}
    </View>
  );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
