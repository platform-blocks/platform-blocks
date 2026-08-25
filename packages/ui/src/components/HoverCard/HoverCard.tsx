import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Platform, Pressable, ViewStyle } from 'react-native';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { getRadius, getSpacing } from '../../core/theme/sizes';
import { useDropdownPositioning } from '../../core/hooks/useDropdownPositioning';
import type { HoverCardProps, HoverCardFactoryPayload } from './types';

// A lightweight hover-activated floating panel
function HoverCardBase(props: HoverCardProps, ref: React.Ref<View>) {
  const {
    children,
    target,
    position: position_ = 'bottom',
    offset = 8,
    openDelay = 100,
    closeDelay = 150,
    opened: controlledOpened,
    shadow = 'md',
    radius = 'md',
    w,
    withArrow = false,
    closeOnEscape = true,
    onOpen,
    onClose,
    disabled = false,
    style,
    testID,
    zIndex = 3000,
    trigger = 'hover',
    strategy = Platform.OS === 'web' ? 'fixed' : 'portal',
  } = props;

  const [opened, setOpened] = useState(false);
  const openTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<View>(null);
  const isHoveringTargetRef = useRef(false);
  const isHoveringOverlayRef = useRef(false);
  const isOpenedRef = useRef(false);
  const theme = useTheme();

  const isOpened = controlledOpened !== undefined ? controlledOpened : opened;
  isOpenedRef.current = isOpened;

  /**
   * Positioning, measurement and overlay lifecycle all come from the shared
   * hook now.
   *
   * The hand-rolled version this replaces measured the trigger behind a pair of
   * `setTimeout`s, assumed a flat `120px` card height, positioned once, and then
   * never looked again — so a card whose content was taller than the guess
   * opened on the wrong side of a trigger near the viewport edge, and any scroll
   * left it stranded at its original coordinates. The hook measures the card
   * itself, caps it to the space available, pins it to the trigger-adjacent edge
   * and keeps it docked as the page scrolls.
   */
  const {
    position,
    anchorRef,
    popoverRef,
    showOverlay,
    hideOverlay,
  } = useDropdownPositioning({
    isOpen: isOpened && !disabled,
    placement: position_,
    offset,
    flip: true,
    shift: true,
    closeOnClickOutside: trigger !== 'hover',
    closeOnEscape,
    onClose: () => handleCloseRef.current(),
  });

  // `handleClose` is defined below but referenced by the hook's onClose above.
  const handleCloseRef = useRef<() => void>(() => {});

  const clearTimers = useCallback(() => {
    if (openTimeout.current) { clearTimeout(openTimeout.current); openTimeout.current = null; }
    if (closeTimeout.current) { clearTimeout(closeTimeout.current); closeTimeout.current = null; }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const shadowStyle: ViewStyle = (() => {
    switch (shadow) {
      case 'sm':
        return { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', elevation: 2 };
      case 'md':
        return { boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', elevation: 4 };
      case 'lg':
        return { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', elevation: 8 };
      default:
        return {};
    }
  })();

  const renderArrow = useCallback((placement: string) => {
    if (!withArrow) return null;
    const base: ViewStyle = { position: 'absolute', width: 0, height: 0 } as any;
    const color = theme.colors.gray[0];
    const styles: Record<string, ViewStyle> = {
      top: { top: '100%' as any, left: 12, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color },
      bottom: { bottom: '100%' as any, left: 12, borderLeftWidth: 6, borderRightWidth: 6, borderBottomWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color },
      left: { left: '100%' as any, top: 12, borderTopWidth: 6, borderBottomWidth: 6, borderLeftWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: color },
      right: { right: '100%' as any, top: 12, borderTopWidth: 6, borderBottomWidth: 6, borderRightWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: color },
    };
    const key = placement.split('-')[0];
    return <View style={{ ...base, ...(styles[key] || styles.top) }} />;
  }, [withArrow, theme.colors.gray]);

  const handleClose = useCallback(() => {
    if (!isOpenedRef.current) return;
    hideOverlay();
    setOpened(false);
    isOpenedRef.current = false;
    onClose?.();
  }, [hideOverlay, onClose]);

  handleCloseRef.current = handleClose;

  // Escape key (web only)
  useEffect(() => {
    if (!closeOnEscape || Platform.OS !== 'web') return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeOnEscape, handleClose]);

  const scheduleClose = useCallback(() => {
    clearTimers();
    closeTimeout.current = setTimeout(() => {
      // Only close if neither target nor overlay are hovered (web)
      if (Platform.OS === 'web') {
        if (isHoveringTargetRef.current || isHoveringOverlayRef.current) return;
      }
      handleClose();
    }, closeDelay);
  }, [handleClose, closeDelay, clearTimers]);

  const handleOpen = useCallback(() => {
    if (disabled || isOpenedRef.current) return;
    setOpened(true);
    isOpenedRef.current = true;
    onOpen?.();
  }, [disabled, onOpen]);

  const overlayContent = useMemo(() => (
    <View
      ref={popoverRef}
      style={[
        {
          backgroundColor: theme.colors.gray[0],
          borderRadius: getRadius(radius),
          paddingHorizontal: getSpacing('md'),
          paddingVertical: getSpacing('sm'),
          borderWidth: 1,
          borderColor: theme.colors.gray[3],
          minWidth: w || 160,
          maxWidth: w || 320,
        },
        shadowStyle,
      ]}
      {...(Platform.OS === 'web' && trigger === 'hover' ? {
        onMouseEnter: () => { isHoveringOverlayRef.current = true; clearTimers(); },
        onMouseLeave: () => { isHoveringOverlayRef.current = false; scheduleClose(); },
      } : {})}
    >
      {children}
      {renderArrow(position?.placement ?? position_)}
    </View>
  ), [popoverRef, theme.colors.gray, radius, w, shadowStyle, trigger, clearTimers, scheduleClose, children, renderArrow, position?.placement, position_]);

  // Push the card once the hook has measured a position, and update it in place
  // afterwards — re-opening the overlay on every position change would tear down
  // the node the pointer is hovering and close the card out from under it.
  useEffect(() => {
    if (!isOpened || !position) return;

    showOverlay(overlayContent, {
      zIndex,
      trigger,
      strategy,
      maxHeight: position.maxHeight,
    });
  }, [isOpened, position, overlayContent, showOverlay, zIndex, trigger, strategy]);

  useEffect(() => () => hideOverlay(), [hideOverlay]);

  const scheduleOpen = useCallback(() => {
    clearTimers();
    openTimeout.current = setTimeout(handleOpen, openDelay);
  }, [handleOpen, openDelay, clearTimers]);

  const handleToggle = useCallback(() => {
    if (isOpenedRef.current) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [handleOpen, handleClose]);

  const targetProps: any = {};
  if (trigger === 'hover') {
    if (Platform.OS === 'web') {
      targetProps.onMouseEnter = () => { isHoveringTargetRef.current = true; scheduleOpen(); };
      targetProps.onMouseLeave = () => { isHoveringTargetRef.current = false; scheduleClose(); };
    } else {
      // fallback: tap to toggle on native
      targetProps.onPress = handleToggle;
    }
  } else if (trigger === 'click') {
    targetProps.onPress = handleToggle;
  }

  // Create a callback ref that forwards to both internal and external refs, and
  // to the positioning hook's anchor — the container is what the card is
  // measured against and stays docked to.
  const combinedRef = useCallback((node: View | null) => {
    containerRef.current = node;
    (anchorRef as any).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as any).current = node;
    }
  }, [ref, anchorRef]);

  return (
    <View 
      ref={combinedRef} 
      style={[{ alignSelf: 'flex-start' }, style]} 
      testID={testID}
    >
      <Pressable
        {...targetProps}
        style={({ pressed }) => [
          { opacity: pressed ? 0.85 : 1 },
          (target as any)?.props?.style,
        ]}
      >
        {target}
      </Pressable>
    </View>
  );
}

export const HoverCard = factory<HoverCardFactoryPayload>(HoverCardBase);
HoverCard.displayName = 'HoverCard';
