import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import type { Ref } from 'react';
import { Modal, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import type { GestureResponderEvent, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

import { Text } from '../Text/Text';
import { Button } from '../Button/Button';
import { Icon } from '../Icon';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { resolveSurface } from '../../core/theme/surfaces';
import { resolveScrim, resolveShadow } from '../../core/theme/tokens';
import { useViewport } from '../../core/responsive';
import { isNative, isWeb, webStyle } from '../../core/platform';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { LayerScope, useLayer } from '../../core/overlay/useLayer';
import { handleModalRequestClose } from '../../core/overlay/layerStack';
import { OverlayHost } from '../../core/overlay/OverlayHost';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import type { DialogFactoryPayload, DialogFocusable, DialogProps } from './types';

/** Baseline the built-in Dialog timings are authored against. */
const DIALOG_BASE_DURATION = 300;
/** Safety margin so the dialog never touches the viewport edges. */
const HORIZONTAL_MARGIN = 32;
const ZERO_INSETS = { top: 0, bottom: 0, left: 0, right: 0 };

/** RN-web gesture events carry the DOM event's methods on `nativeEvent`. */
interface DomLikeEvent {
  preventDefault?: () => void;
  stopPropagation?: () => void;
}

function DialogBase(props: DialogProps, ref: Ref<View>) {
  const {
    opened = false,
    variant = 'modal',
    title,
    accessibilityLabel,
    children,
    closable = true,
    backdrop = true,
    backdropClosable = true,
    shouldClose = false,
    onClose,
    w,
    h,
    radius,
    style,
    showHeader = true,
    bottomSheetSwipeZone = 'container',
    transitionDuration,
    titleProps,
    closeButtonLabel = 'Close dialog',
    autoFocus = false,
    trapFocus = true,
    testID,
    ...spacingProps
  } = props;

  const theme = useTheme();
  const insets = useContext(SafeAreaInsetsContext) ?? ZERO_INSETS;
  const { width: screenWidth, height: screenHeight } = useViewport();
  const spacingStyles = useStyleProps(spacingProps);
  const titleId = useA11yId(undefined, 'dialog-title');

  const defaultModalMaxWidth = Math.min(w || 500, Math.max(200, screenWidth - HORIZONTAL_MARGIN));
  const modalEffectiveWidth = variant !== 'modal'
    ? undefined
    : Math.min(defaultModalMaxWidth, screenWidth - HORIZONTAL_MARGIN);
  const bottomSheetMaxWidth = Math.min(
    w ? w : (isNative ? 720 : Math.min(600, screenWidth - HORIZONTAL_MARGIN)),
    screenWidth,
  );
  const resolvedRadius = radius ?? (variant === 'bottomsheet' ? 20 : 16);
  const resolvedMaxHeight = variant === 'bottomsheet'
    ? (h ?? Math.max(200, screenHeight - insets.top - 24))
    : (variant === 'fullscreen' ? '100%' : (h || '90%'));

  // Enter/exit transition length. `0` (and reduced motion) show and dismiss the
  // dialog instantly; other explicit values scale the built-in timings, which
  // are authored against a 300ms baseline.
  const motionDuration = useTransitionDuration(transitionDuration, DIALOG_BASE_DURATION);
  const instantMotion = motionDuration === 0;
  const ms = useCallback(
    (base: number) => Math.round(base * (motionDuration / DIALOG_BASE_DURATION)),
    [motionDuration]
  );

  const closingRef = useRef(false);
  const invokeOnClose = useLatestCallback(() => {
    closingRef.current = false;
    onClose?.();
  });

  // --- layer: Escape / Android back / focus trap + restore ---------------------------
  const containerRef = useRef<View>(null);
  const contentRef = useRef<View>(null);
  const mergedContainerRef = useMergedRef<View>(ref, containerRef);
  const initialFocusRef = typeof autoFocus === 'object' && autoFocus !== null
    ? autoFocus
    : autoFocus === true ? contentRef : undefined;

  const backdropOpacity = useSharedValue(0);
  const slideAnim = useSharedValue(variant === 'bottomsheet' ? screenHeight : 0);
  const scaleAnim = useSharedValue(variant === 'modal' ? 0.8 : 1);

  const handleClose = useLatestCallback(() => {
    if (!closable || closingRef.current) return;
    closingRef.current = true;

    if (instantMotion) {
      // No exit transition — land on the closed state and report it immediately.
      backdropOpacity.value = 0;
      if (variant === 'modal') scaleAnim.value = 0.85;
      if (variant === 'bottomsheet') slideAnim.value = screenHeight;
      invokeOnClose();
      return;
    }

    backdropOpacity.value = withTiming(0, { duration: ms(250), easing: Easing.in(Easing.quad) });

    if (variant === 'modal') {
      scaleAnim.value = withTiming(0.85, { duration: ms(220), easing: Easing.in(Easing.back(0.7)) }, (finished) => {
        'worklet';
        if (finished) runOnJS(invokeOnClose)();
      });
    } else if (variant === 'bottomsheet') {
      slideAnim.value = withTiming(screenHeight, { duration: ms(220), easing: Easing.in(Easing.cubic) }, (finished) => {
        'worklet';
        if (finished) runOnJS(invokeOnClose)();
      });
    } else {
      setTimeout(invokeOnClose, ms(250));
    }
  });

  const { id: layerId } = useLayer({
    active: opened,
    modal: true,
    onDismiss: () => handleClose(),
    closeOnEscape: closable,
    containerRef,
    trapFocus,
    // Focus always moves in; `autoFocus` only picks where.
    initialFocus: autoFocus === false ? 'container' : 'first-tabbable',
    initialFocusRef: initialFocusRef as React.RefObject<unknown> | undefined,
    restoreFocus: true,
  });

  // Native has no DOM focus: once the enter transition settles, focus the given
  // field (raising its keyboard). Web focus is handled by the layer above.
  useEffect(() => {
    if (!opened || isWeb || typeof autoFocus !== 'object' || autoFocus === null) return undefined;
    const target = autoFocus;
    const timer = setTimeout(() => {
      (target.current as DialogFocusable | null)?.focus?.();
    }, motionDuration);
    return () => clearTimeout(timer);
  }, [opened, autoFocus, motionDuration]);

  // --- swipe-to-dismiss (bottom sheet) -------------------------------------------------
  const swipeEnabled = variant === 'bottomsheet' && bottomSheetSwipeZone !== 'none';
  const panResponder = useMemo(() => PanResponder.create({
    // Never capture on touch start — let events reach children (buttons) first.
    onStartShouldSetPanResponderCapture: () => false,
    // Claim in the bubble phase, after children had their chance.
    onStartShouldSetPanResponder: () => swipeEnabled,
    onMoveShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => (
      swipeEnabled && Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 2
    ),
    onPanResponderGrant: (event: GestureResponderEvent) => {
      if (!isWeb) return;
      // Prevent text selection while dragging on web.
      const domEvent = event.nativeEvent as unknown as DomLikeEvent;
      domEvent.preventDefault?.();
      domEvent.stopPropagation?.();
    },
    onPanResponderMove: (event: GestureResponderEvent, gestureState) => {
      if (!swipeEnabled) return;
      if (isWeb) (event.nativeEvent as unknown as DomLikeEvent).preventDefault?.();
      // Only downward movement dismisses; resist a little for feel.
      const dragDistance = Math.max(0, gestureState.dy);
      slideAnim.value = dragDistance * 0.8 + (dragDistance > 100 ? (dragDistance - 100) * 0.2 : 0);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!swipeEnabled) return;
      const dragDistance = gestureState.dy;
      const velocity = gestureState.vy;
      const shouldDismiss =
        dragDistance > screenHeight * 0.25 ||
        (velocity > 0.6 && dragDistance > 50) ||
        (dragDistance > 80 && velocity > 0.2);

      if (shouldDismiss && dragDistance > 0) {
        const dismissDuration = ms(Math.max(120, 220 - Math.max(0, velocity) * 60));
        closingRef.current = true;
        if (instantMotion) {
          slideAnim.value = screenHeight;
          backdropOpacity.value = 0;
          invokeOnClose();
        } else {
          slideAnim.value = withTiming(screenHeight, { duration: dismissDuration, easing: Easing.in(Easing.cubic) }, (finished) => {
            'worklet';
            if (finished) runOnJS(invokeOnClose)();
          });
          backdropOpacity.value = withTiming(0, { duration: dismissDuration, easing: Easing.in(Easing.cubic) });
        }
      } else {
        slideAnim.value = instantMotion
          ? 0
          : withSpring(0, { damping: 25, stiffness: 280, mass: 0.7, overshootClamping: true });
      }
    },
    onPanResponderTerminate: () => {
      if (!swipeEnabled) return;
      slideAnim.value = instantMotion
        ? 0
        : withSpring(0, { damping: 25, stiffness: 280, mass: 0.7, overshootClamping: true });
    },
  }), [swipeEnabled, screenHeight, slideAnim, backdropOpacity, invokeOnClose, instantMotion, ms]);

  // --- enter / reset ---------------------------------------------------------------------
  useEffect(() => {
    if (opened) {
      closingRef.current = false;
      if (instantMotion) {
        backdropOpacity.value = 1;
        scaleAnim.value = 1;
        slideAnim.value = 0;
        return;
      }
      backdropOpacity.value = withTiming(1, { duration: ms(300), easing: Easing.out(Easing.quad) });
      if (variant === 'modal') {
        scaleAnim.value = withSpring(1, { damping: 18, stiffness: 250, mass: 0.9 });
      } else if (variant === 'bottomsheet') {
        slideAnim.value = screenHeight;
        slideAnim.value = withTiming(0, { duration: ms(300), easing: Easing.out(Easing.cubic) });
      }
    } else {
      backdropOpacity.value = 0;
      if (variant === 'modal') scaleAnim.value = 0.8;
      else if (variant === 'bottomsheet') slideAnim.value = screenHeight;
    }
  }, [opened, variant, screenHeight, backdropOpacity, scaleAnim, slideAnim, instantMotion, ms]);

  useEffect(() => {
    if (shouldClose) handleClose();
  }, [shouldClose, handleClose]);

  // --- styles ------------------------------------------------------------------------------
  const hasHeader = Boolean(title);
  const styles = useThemedStyles((t) => {
    // Level 3 — takes over the screen. Except when it *is* the screen: a
    // fullscreen dialog floats above nothing, so it takes the page surface.
    const surface = resolveSurface(t, variant === 'fullscreen' ? 0 : 3);
    const table: Record<'backdrop' | 'modalContainer' | 'header' | 'content' | 'closeButton' | 'dragHandle' | 'dragHandleContainer', ViewStyle> = {
      backdrop: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: variant === 'fullscreen' ? 'transparent' : resolveScrim(t),
        justifyContent: variant === 'bottomsheet' ? 'flex-end' : 'center',
        alignItems: variant === 'bottomsheet' ? 'stretch' : 'center',
      },
      modalContainer: {
        backgroundColor: surface.background,
        borderRadius: variant === 'fullscreen' ? 0 : resolvedRadius,
        ...(variant === 'bottomsheet' ? { borderBottomStartRadius: 0, borderBottomEndRadius: 0 } : null),
        overflow: 'hidden',
        maxWidth: variant === 'fullscreen'
          ? '100%'
          : variant === 'bottomsheet' ? bottomSheetMaxWidth : defaultModalMaxWidth,
        maxHeight: resolvedMaxHeight,
        width: variant === 'fullscreen' ? '100%' : variant === 'modal' ? modalEffectiveWidth || 'auto' : '100%',
        height: variant === 'fullscreen' ? '100%' : undefined,
        ...(variant === 'fullscreen' ? { flex: 1, position: 'absolute' as const } : null),
        minWidth: variant === 'modal' ? Math.min(300, Math.max(200, screenWidth - HORIZONTAL_MARGIN)) : undefined,
        alignSelf: 'center',
        paddingTop: variant === 'fullscreen' ? insets.top : 0,
        paddingBottom: variant === 'fullscreen' ? insets.bottom : 0,
        ...(variant === 'fullscreen' ? null : resolveShadow(t, surface.shadow === 'none' ? 'xl' : surface.shadow)),
        ...(variant === 'bottomsheet' ? webStyle({ userSelect: 'none', WebkitUserSelect: 'none' }) : null),
      },
      header: {
        alignItems: 'center',
        backgroundColor: showHeader ? surface.background : 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 0,
      },
      content: {
        ...(variant === 'fullscreen' ? { flex: 1 } : null),
        alignSelf: 'stretch',
        backgroundColor: surface.background,
        padding: variant === 'fullscreen' ? 0 : 20,
        // The header already sits 20 above the title and the close button adds a
        // few px below it, so a second full 20 here reads as a gap.
        ...(variant !== 'fullscreen' && hasHeader ? { paddingTop: 8 } : null),
        width: '100%',
      },
      closeButton: {
        padding: 8,
      },
      dragHandle: {
        alignSelf: 'center',
        backgroundColor: t.text.muted,
        borderRadius: 2,
        height: 4,
        opacity: 0.8,
        width: 40,
      },
      dragHandleContainer: {
        // The handle has no margins; hitSlop gives the larger touch target.
        paddingTop: 12,
        paddingBottom: 4,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...webStyle({ cursor: 'grab', userSelect: 'none', WebkitUserSelect: 'none' }),
      },
    };
    return table;
  }, [variant, resolvedRadius, resolvedMaxHeight, bottomSheetMaxWidth, defaultModalMaxWidth,
    modalEffectiveWidth, screenWidth, insets.top, insets.bottom, showHeader, hasHeader]);

  const blurBackdrop = isWeb && variant !== 'fullscreen';
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = backdropOpacity.value;
    if (!blurBackdrop) return { opacity };
    return { opacity, backdropFilter: `blur(${interpolate(opacity, [0, 1], [0, 3])}px)` };
  });

  const modalAnimatedStyle = useAnimatedStyle(() => (
    variant === 'modal' ? { transform: [{ scale: scaleAnim.value }] } : {}
  ));

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    if (variant !== 'bottomsheet') return {};
    // Clamp at 0 so the sheet never lifts to show what's under it.
    return { transform: [{ translateY: Math.max(0, slideAnim.value) }] };
  });

  if (!opened) return null;

  const panHandlers = swipeEnabled ? panResponder.panHandlers : undefined;
  const animatedStyle = variant === 'modal'
    ? modalAnimatedStyle
    : variant === 'bottomsheet' ? bottomSheetAnimatedStyle : null;

  const dialogA11y = a11yProps({
    role: 'dialog',
    modal: true,
    labelledBy: hasHeader ? titleId : undefined,
    label: hasHeader ? undefined : accessibilityLabel,
  });

  const content = (
    <Animated.View
      ref={mergedContainerRef}
      style={[styles.modalContainer, animatedStyle] as ViewStyle[]}
      testID={testID}
      {...dialogA11y}
      {...(bottomSheetSwipeZone === 'container' ? panHandlers : null)}
    >
      {variant === 'bottomsheet' && (
        <View
          style={styles.dragHandleContainer}
          hitSlop={{ top: 8, bottom: 16, left: 0, right: 0 }}
          aria-hidden
          {...(bottomSheetSwipeZone === 'handle' ? panHandlers : null)}
        >
          <View style={styles.dragHandle} />
        </View>
      )}

      {hasHeader && (
        <View style={styles.header}>
          <Text variant="h3" c="primary" nativeID={titleId} {...titleProps}>
            {title || ''}
          </Text>
          {closable && variant !== 'bottomsheet' && (
            <Button
              variant="ghost"
              onPress={() => handleClose()}
              style={styles.closeButton}
              accessibilityLabel={closeButtonLabel}
            >
              <Icon name="x" size="md" />
            </Button>
          )}
        </View>
      )}

      <View ref={contentRef} style={[styles.content, spacingStyles, style]}>
        {children}
      </View>
    </Animated.View>
  );

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent={variant === 'fullscreen'}
      // Android back reaches the layer stack (topmost layer only); on web the
      // stack already handled Escape on keydown.
      onRequestClose={handleModalRequestClose}
    >
      {/* Nested floating content (Select, Popover, Menu, Tooltip…) opened from
          inside the dialog renders in this host, above the dialog. */}
      <OverlayHost>
        <View style={{ flex: 1 }}>
          <LayerScope id={layerId}>
            <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
              {backdrop && backdropClosable && (
                <Pressable
                  testID="dialog-backdrop"
                  style={StyleSheet.absoluteFill}
                  onPress={() => handleClose()}
                  // The close button / Escape / back are the accessible ways out;
                  // the scrim is a pointer affordance only.
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  aria-hidden
                  tabIndex={-1}
                />
              )}
              {content}
            </Animated.View>
          </LayerScope>
        </View>
      </OverlayHost>
    </Modal>
  );
}

/**
 * A modal dialog, bottom sheet or fullscreen sheet. Registers a modal layer
 * (Escape / Android back close only the topmost overlay, focus moves in, Tab is
 * trapped, focus is restored on close) and hosts nested floating content so it
 * stacks above the dialog.
 */
export const Dialog = factory<DialogFactoryPayload>(DialogBase, { displayName: 'Dialog' });
