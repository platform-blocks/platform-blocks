import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  PanResponder,
  Platform,
  BackHandler,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../Text/Text';
import { Button } from '../Button/Button';
import { Icon } from '../Icon';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSurface } from '../../core/theme/surfaces';
import { useDirection } from '../../core/providers/DirectionProvider';
import { DialogProps } from './types';
import { useEscapeKey } from '../../hooks/useHotkeys';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { FOCUSABLE_SELECTOR, resolveDomNode, useFocusTrap } from '../../core/accessibility/advancedHooks';

// Safe wrapper for useSafeAreaInsets that handles cases where SafeAreaProvider is not available
const useSafeSafeAreaInsets = () => {
  try {
    return useSafeAreaInsets();
  } catch (error) {
    // Return default insets if SafeAreaProvider is not available
    return { top: 0, bottom: 0, left: 0, right: 0 };
  }
};

/** Baseline the built-in Dialog timings are authored against. */
const DIALOG_BASE_DURATION = 300;

export function Dialog({
  visible,
  variant = 'modal',
  title,
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
  autoFocus = false,
  trapFocus = true,
}: DialogProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const insets = useSafeSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const horizontalMargin = 32; // safety margin so dialog never touches edges
  const isNativePlatform = Platform.OS === 'ios' || Platform.OS === 'android';
  const defaultModalMaxWidth = Math.min((w || 500), Math.max(200, screenWidth - horizontalMargin));
  const modalEffectiveWidth = variant !== 'modal'
    ? undefined
    : Math.min(defaultModalMaxWidth, screenWidth - horizontalMargin);
  const bottomSheetMaxWidth = Math.min(
    w ? w : (isNativePlatform ? 720 : Math.min(600, screenWidth - horizontalMargin)),
    screenWidth,
  );
  const resolvedRadius = radius ?? (variant === 'bottomsheet' ? 20 : 16);
  const resolvedMaxHeight = variant === 'bottomsheet'
    ? (h ?? Math.max(200, screenHeight - insets.top - 24))
    : (variant === 'fullscreen' ? '100%' : (h || '90%'));

  const invokeOnClose = useCallback(() => {
    onClose?.();
  }, [onClose]);
  
  // Enter/exit transition length. `0` (and reduced motion) show and dismiss the
  // dialog instantly; other explicit values scale the built-in timings, which
  // are authored against a 300ms baseline.
  const motionDuration = useTransitionDuration(transitionDuration, DIALOG_BASE_DURATION);
  const instantMotion = motionDuration === 0;
  const ms = useCallback(
    (base: number) => Math.round(base * (motionDuration / DIALOG_BASE_DURATION)),
    [motionDuration]
  );

  // Web-only focus containment: Tab cycles inside the dialog while it is open,
  // and focus returns to whatever was focused before it opened.
  const { containerRef: focusTrapRef } = useFocusTrap(visible && trapFocus);
  // Scoped to the dialog body so `autoFocus` lands on the first field rather
  // than the header's close button.
  const contentRef = useRef<any>(null);

  // Move focus into the dialog once its enter transition has settled — before
  // that the element is still animating in, and on native the modal may not be
  // presented yet.
  useEffect(() => {
    if (!visible || !autoFocus) return;

    const timer = setTimeout(() => {
      if (typeof autoFocus === 'object') {
        autoFocus.current?.focus?.();
        return;
      }
      const container = resolveDomNode(contentRef.current);
      const first = container?.querySelectorAll(FOCUSABLE_SELECTOR)?.[0];
      first?.focus?.();
    }, motionDuration);

    return () => clearTimeout(timer);
  }, [visible, autoFocus, motionDuration]);

  // Reanimated shared values
  const backdropOpacity = useSharedValue(0);
  const slideAnim = useSharedValue(variant === 'bottomsheet' ? screenHeight : 0);
  const scaleAnim = useSharedValue(variant === 'modal' ? 0.8 : 1);
  
  // Use the new hotkey system for escape key
  useEscapeKey(() => {
    if (visible && closable) {
      handleClose();
    }
  }, visible && closable);

  // Pan responder for bottomsheet swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => {
        // Never capture on touch start — let events reach children (buttons) first
        return false;
      },
      onStartShouldSetPanResponder: () => {
        // Claim in bubble phase (after children had their chance to claim).
        // If a Button/Pressable already claimed the touch, this won't fire.
        // If nothing claimed (e.g. drag handle, empty space), we take over for swipe tracking.
        return variant === 'bottomsheet' && bottomSheetSwipeZone !== 'none';
      },
      onMoveShouldSetPanResponderCapture: () => {
        // Never capture moves — let children handle their own gestures
        return false;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Claim the gesture when there's a clear vertical swipe movement
        return variant === 'bottomsheet' && bottomSheetSwipeZone !== 'none' && (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && 
          Math.abs(gestureState.dy) > 2
        );
      },
      onPanResponderGrant: (evt) => {
        // Prevent default browser behavior (text selection, etc.) on web
        if (Platform.OS === 'web') {
          const event = evt.nativeEvent as any;
          if (event.preventDefault) {
            event.preventDefault();
          }
          if (event.stopPropagation) {
            event.stopPropagation();
          }
        }
        
        // Optional: Add haptic feedback on iOS
        if (Platform.OS === 'ios') {
          // Could add HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light) if available
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (variant === 'bottomsheet' && bottomSheetSwipeZone !== 'none') {
          // Prevent text selection during fast movements on web
          if (Platform.OS === 'web') {
            const event = evt.nativeEvent as any;
            if (event.preventDefault) {
              event.preventDefault();
            }
          }

          // Only allow downward movement (dismiss gesture)
          const dragDistance = Math.max(0, gestureState.dy);
          
          // Downward movement - apply subtle resistance for better feel
          const resistance = 0.8;
          const resistedDistance = dragDistance * resistance + (dragDistance > 100 ? (dragDistance - 100) * 0.2 : 0);
          slideAnim.value = resistedDistance;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (variant === 'bottomsheet' && bottomSheetSwipeZone !== 'none') {
          const dragDistance = gestureState.dy;
          const velocity = gestureState.vy;
          
          // Enhanced dismiss logic:
          // - If dragged more than 1/4 of screen height downward, dismiss
          // - If velocity is high enough downward (fast swipe), dismiss
          // - If dragged upward or not far enough, snap back
          const shouldDismiss = 
            dragDistance > screenHeight * 0.25 || 
            (velocity > 0.6 && dragDistance > 50) || 
            (dragDistance > 80 && velocity > 0.2);

          if (shouldDismiss && dragDistance > 0) {
            // Enhanced dismiss animation with velocity-based timing
            const dismissDuration = Math.max(200, 400 - velocity * 150);
            slideAnim.value = withTiming(screenHeight, {
              duration: dismissDuration,
              easing: Easing.out(Easing.quad),
            }, (finished) => {
              'worklet';
              if (finished) {
                runOnJS(invokeOnClose)();
              }
            });
            
            // Fade backdrop during dismiss
            backdropOpacity.value = withTiming(0, {
              duration: dismissDuration,
              easing: Easing.out(Easing.quad),
            });
          } else {
            // Enhanced snap back with overshoot
            slideAnim.value = withSpring(0, {
              damping: 25,
              stiffness: 280,
              mass: 0.7,
              overshootClamping: true, // Prevent overshoot on snap back
            });
          }
        }
      },
      onPanResponderTerminate: () => {
        // If gesture is interrupted, snap back with enhanced spring
        if (variant === 'bottomsheet' && bottomSheetSwipeZone !== 'none') {
          slideAnim.value = withSpring(0, {
            damping: 25,
            stiffness: 280,
            mass: 0.7,
            overshootClamping: true, // Prevent overshoot on interrupt recovery
          });
        }
      },
    })
  ).current;

  const handleClose = () => {
    if (!closable) return;

    if (instantMotion) {
      // No exit transition — land on the closed state and report it immediately.
      backdropOpacity.value = 0;
      if (variant === 'modal') scaleAnim.value = 0.85;
      if (variant === 'bottomsheet') slideAnim.value = screenHeight;
      invokeOnClose();
      return;
    }

    // Enhanced exit animations
    backdropOpacity.value = withTiming(0, {
      duration: ms(250),
      easing: Easing.in(Easing.quad),
    });

    if (variant === 'modal') {
      // Modal scale out with slight acceleration
      scaleAnim.value = withTiming(0.85, {
        duration: ms(220),
        easing: Easing.in(Easing.back(0.7)),
      }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(invokeOnClose)();
        }
      });
    } else if (variant === 'bottomsheet') {
      // Bottom sheet slide down with spring
      slideAnim.value = withSpring(screenHeight, {
        damping: 25,
        stiffness: 400,
        mass: 0.8,
      }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(invokeOnClose)();
        }
      });
    } else {
      // For fullscreen, just call onClose after backdrop animation
      setTimeout(invokeOnClose, ms(250));
    }
  };

  const handleBackdropPress = () => {
    if (backdropClosable) {
      handleClose();
    }
  };

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (closable) {
          handleClose();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [visible, closable]);

  // Animate in
  useEffect(() => {
    if (visible) {
      if (instantMotion) {
        // No enter transition — present the dialog already in place.
        backdropOpacity.value = 1;
        scaleAnim.value = 1;
        slideAnim.value = 0;
        return;
      }
      // Backdrop fade in with subtle easing
      backdropOpacity.value = withTiming(1, {
        duration: ms(300),
        easing: Easing.out(Easing.quad),
      });

      if (variant === 'modal') {
        // Modal scale animation with enhanced spring and slight overshoot
        scaleAnim.value = withSpring(1, {
          damping: 18,
          stiffness: 250,
          mass: 0.9,
        });
      } else if (variant === 'bottomsheet') {
        // Bottom sheet slide up with critically damped spring (no overshoot)
        slideAnim.value = screenHeight;
        slideAnim.value = withSpring(0, {
          damping: 30, // High damping to prevent overshoot
          stiffness: 200, // Lower stiffness for smoother motion
          mass: 1.2, // Higher mass for more controlled movement
          overshootClamping: true, // Prevent overshoot completely
        });
      }
    } else {
      // Reset values when not visible
      backdropOpacity.value = 0;
      if (variant === 'modal') {
        scaleAnim.value = 0.8;
      } else if (variant === 'bottomsheet') {
        slideAnim.value = screenHeight;
      }
    }
  }, [visible, variant, screenHeight, backdropOpacity, scaleAnim, slideAnim, instantMotion, ms]);

  // Handle shouldClose prop
  useEffect(() => {
    if (shouldClose) {
      handleClose();
    }
  }, [shouldClose]);

  const isDark = theme.colorScheme === 'dark';
  // Level 3 — takes over the screen. Previously this hard-coded `#FFFFFF` and
  // `#E1E3E6` in light mode, so a themed app got an unthemed dialog.
  const dialogSurface = resolveSurface(theme, 3);
  const surfaceColor = dialogSurface.background;
  const borderColor = dialogSurface.border;
  const headerBg = surfaceColor;
  const contentBg = surfaceColor;
  // Mirrors the render condition below — the header only exists when there is a
  // title to show and the dialog is closable.
  const hasHeader = Boolean(title) && closable;

  const dynamicStyles = useMemo(() => StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: variant === 'fullscreen' ? 'transparent' : 'rgba(0, 0, 0, 0.5)',
      justifyContent: variant === 'bottomsheet' ? 'flex-end' : 'center',
      alignItems: variant === 'bottomsheet' ? 'stretch' : 'center',
    } as any, // Allow backdropFilter on web
    modalContainer: {
      backgroundColor: contentBg,
      borderRadius: variant === 'fullscreen' ? 0 : resolvedRadius,
      ...(variant === 'bottomsheet' ? {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      } : {}),
      overflow: 'hidden', // Clip content to border radius
      // Clamp width to viewport (minus margins) while respecting provided width
      maxWidth: variant === 'fullscreen'
        ? '100%'
        : variant === 'bottomsheet'
          ? bottomSheetMaxWidth
          : defaultModalMaxWidth,
      maxHeight: resolvedMaxHeight,
      width: variant === 'fullscreen'
        ? '100%'
        : variant === 'modal'
          ? modalEffectiveWidth || 'auto'
          : '100%',
      // Fullscreen uses 100% height, others auto-size to content
      height: variant === 'fullscreen' ? '100%' : undefined,
      // Only fullscreen should stretch to fill
      ...(variant === 'fullscreen' ? { flex: 1 } : {}),
      // Ensure minWidth never exceeds viewport clamp
      minWidth: variant === 'modal' ? Math.min(300, Math.max(200, screenWidth - horizontalMargin)) : undefined,
      alignSelf: variant === 'bottomsheet' ? 'center' : 'center',
      paddingTop: variant === 'fullscreen' ? insets.top : 0,
      paddingBottom: variant === 'fullscreen' ? insets.bottom : 0,
      // Prevent text selection during drag on web
      ...(Platform.OS === 'web' && variant === 'bottomsheet' && {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      }),
      // Enhanced shadows for modal
      ...(Platform.OS === 'web' && variant === 'modal'
        ? { 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        : Platform.OS === 'ios' && variant !== 'fullscreen'
        ? {
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          }
        : Platform.OS === 'android' && variant !== 'fullscreen'
        ? { elevation: 16, }
        : variant === 'fullscreen'
        ? {
            boxShadow: 'none',
            height: '100%',
            position: 'absolute',
        }
        : { boxShadow: 'none' }),
    } as any, // Allow boxShadow on web
    header: {
      alignItems: 'center',
      backgroundColor: showHeader ? headerBg : 'transparent',
      // borderBottomColor: showHeader ? borderColor : 'transparent',
      // borderBottomWidth: showHeader && variant !== 'fullscreen' ? 1 : 0,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      padding: 20,
      paddingBottom: 0,
    },
    content: {
      // Only fullscreen content should stretch
      ...(variant === 'fullscreen' ? { flex: 1 } : {}),
      alignSelf: 'stretch',
      backgroundColor: contentBg,
      padding: variant === 'fullscreen' ? 0 : 20,
      // The header already sits 20 above the title and the close button adds a
      // few px below it, so a second full 20 here reads as a gap.
      ...(variant !== 'fullscreen' && hasHeader ? { paddingTop: 8 } : {}),
      width: '100%',
    },
    closeButton: {
      padding: 8,
    },
    dragHandle: {
      alignSelf: 'center',
      backgroundColor: isDark ? theme.colors.gray[5] : theme.colors.gray[4],
      borderRadius: 2,
      height: 4,
      opacity: 0.8,
      width: 40,
    },
    dragHandleContainer: {
      // Spacing lives here only — the handle itself has no margins, and the
      // content below supplies its own padding. hitSlop (not minHeight) gives
      // the larger touch target so it costs no vertical space.
      paddingTop: 12,
      paddingBottom: 4,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      // Web-specific drag prevention and cursor
      ...(Platform.OS === 'web' && {
        cursor: 'grab' as any,
        userSelect: 'none' as any,
        WebkitUserSelect: 'none' as any,
        MozUserSelect: 'none' as any,
        msUserSelect: 'none' as any,
      }),
    } as any,
  }), [variant, contentBg, resolvedRadius, resolvedMaxHeight, bottomSheetMaxWidth, defaultModalMaxWidth,
    modalEffectiveWidth, screenWidth, horizontalMargin, insets.top, insets.bottom,
    headerBg, borderColor, isRTL, isDark, theme.colors.gray, hasHeader]);

  // Animated styles using reanimated
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = backdropOpacity.value;
    
    return {
      opacity,
      // Enhanced backdrop effect with interpolated blur on web
      ...(Platform.OS === 'web' && variant !== 'fullscreen' && {
        backdropFilter: `blur(${interpolate(opacity, [0, 1], [0, 3])}px)`,
      }),
    };
  });

  const modalAnimatedStyle = useAnimatedStyle(() => {
    if (variant === 'modal') {
      return {
        transform: [{ scale: scaleAnim.value }],
      };
    }
    return {};
  });

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    if (variant === 'bottomsheet') {
      // Clamp to 0 minimum to prevent seeing "under" the sheet
      const clampedY = Math.max(0, slideAnim.value);
      return {
        transform: [{ translateY: clampedY }],
      };
    }
    return {};
  });

  if (!visible) return null;

  const renderContent = () => {
    let animatedStyle: any = {};
    
    const panHandlers = bottomSheetSwipeZone !== 'none' ? panResponder.panHandlers : undefined;

    if (variant === 'modal') {
      animatedStyle = modalAnimatedStyle;
    } else if (variant === 'bottomsheet') {
      animatedStyle = bottomSheetAnimatedStyle;
    }

    return (
      <Animated.View
        ref={focusTrapRef}
        style={[dynamicStyles.modalContainer, animatedStyle]}
        {...(variant === 'bottomsheet' && bottomSheetSwipeZone === 'container' && panHandlers ? panHandlers : {})}
      >
        {variant === 'bottomsheet' && (
          <View
            style={dynamicStyles.dragHandleContainer}
            hitSlop={{ top: 8, bottom: 16, left: 0, right: 0 }}
            {...(bottomSheetSwipeZone === 'handle' && panHandlers ? panHandlers : {})}
          >
            <View style={dynamicStyles.dragHandle} />
          </View>
        )}

     
        {hasHeader && (
          <View style={dynamicStyles.header}>
            <Text variant="h3" color="text" {...titleProps}>
              {title || ''}
            </Text>
            {closable && variant !== 'bottomsheet' && (
              <Button
                variant="ghost"
                onPress={handleClose}
                style={dynamicStyles.closeButton}
              >
                <Icon name="x" size="md" />
              </Button>
            )}
          </View>
        )}
        
        <View ref={contentRef} style={[dynamicStyles.content,style]}>
          {children}
        </View>
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={variant === 'fullscreen'}
      // Android hardware back / gesture dismissal. Modal swallows the event
      // unless it is handled here, so the BackHandler above is not enough.
      onRequestClose={closable ? handleClose : undefined}
    >
      <Animated.View
        style={[
          dynamicStyles.backdrop,
          backdropAnimatedStyle,
        ]}
      >
        {backdrop && backdropClosable && (
          <Pressable
            testID="dialog-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
          />
        )}
        {renderContent()}
      </Animated.View>
    </Modal>
  );
}
