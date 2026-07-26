import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, ViewStyle, Platform, Dimensions } from 'react-native';
import { Text } from '../Text';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { resolveOptionalModule } from '../../utils/optionalModule';

// Optional gesture handler support with graceful fallback
const gestureHandler = resolveOptionalModule<any>('react-native-gesture-handler', {
  devWarning: 'react-native-gesture-handler not found. Swipe gestures will be disabled for Toast component.',
});

const GestureDetector = gestureHandler?.GestureDetector;
const Gesture = gestureHandler?.Gesture;
const GestureHandlerRootView = gestureHandler?.GestureHandlerRootView;

import { factory } from '../../core/factory';
import { createRadiusStyles } from '../../core/theme/radius';
import {
  resolveComponentSize,
  type ComponentSize,
  type ComponentSizeValue,
} from '../../core/theme/componentSize';
import { useTheme } from '../../core/theme/ThemeProvider';
import { readableTextOn } from '../../core/theme/colorUtils';
import { resolveSurface } from '../../core/theme/surfaces';
import { getShadowValue, COMPONENT_SHADOW_DEFAULTS } from '../../core/theme/shadow';
import { getSpacingStyles, extractSpacingProps, mergeSlotProps } from '../../core/utils';
import { ToastProps, ToastColor, ToastSeverity, ToastAction, ToastAnimationConfig, ToastSwipeConfig, ToastSizeMetrics } from './types';
import { useHaptics } from '../../hooks/useHaptics';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';

interface ToastFactoryPayload {
  props: ToastProps;
  ref: View;
}

const TOAST_ALLOWED_SIZES: ComponentSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

// Full seven-token scale. `md` reproduces the historical toast metrics exactly,
// so adding the prop is a no-op for existing usage.
const TOAST_SIZE_SCALE: Record<ComponentSize, ToastSizeMetrics> = {
  xs: {
    padding: 6, gap: 4, titleSize: 12, titleGap: 2, bodySize: 11, bodyLineHeight: 15,
    iconSize: 14, minHeight: 36, actionFontSize: 10,
    actionPaddingHorizontal: 6, actionPaddingVertical: 2, closeButtonSize: 24,
  },
  sm: {
    padding: 9, gap: 6, titleSize: 14, titleGap: 3, bodySize: 12, bodyLineHeight: 17,
    iconSize: 16, minHeight: 48, actionFontSize: 11,
    actionPaddingHorizontal: 6, actionPaddingVertical: 3, closeButtonSize: 28,
  },
  md: {
    padding: 12, gap: 8, titleSize: 16, titleGap: 4, bodySize: 14, bodyLineHeight: 20,
    iconSize: 20, minHeight: 60, actionFontSize: 12,
    actionPaddingHorizontal: 8, actionPaddingVertical: 4, closeButtonSize: 32,
  },
  lg: {
    padding: 14, gap: 10, titleSize: 18, titleGap: 5, bodySize: 16, bodyLineHeight: 23,
    iconSize: 24, minHeight: 68, actionFontSize: 14,
    actionPaddingHorizontal: 10, actionPaddingVertical: 5, closeButtonSize: 36,
  },
  xl: {
    padding: 16, gap: 12, titleSize: 20, titleGap: 6, bodySize: 18, bodyLineHeight: 26,
    iconSize: 28, minHeight: 76, actionFontSize: 15,
    actionPaddingHorizontal: 12, actionPaddingVertical: 6, closeButtonSize: 40,
  },
  '2xl': {
    padding: 20, gap: 14, titleSize: 24, titleGap: 7, bodySize: 20, bodyLineHeight: 29,
    iconSize: 32, minHeight: 88, actionFontSize: 16,
    actionPaddingHorizontal: 14, actionPaddingVertical: 7, closeButtonSize: 44,
  },
  '3xl': {
    padding: 24, gap: 16, titleSize: 28, titleGap: 8, bodySize: 22, bodyLineHeight: 32,
    iconSize: 40, minHeight: 100, actionFontSize: 18,
    actionPaddingHorizontal: 16, actionPaddingVertical: 8, closeButtonSize: 52,
  },
};

const BASE_TOAST_METRICS = TOAST_SIZE_SCALE.md;

const resolveToastMetrics = (value: ComponentSizeValue | undefined): ToastSizeMetrics => {
  // A numeric size is read as the title font size; everything else scales with it
  // so a custom value stays proportional instead of snapping to the nearest token.
  if (typeof value === 'number') {
    const ratio = value / BASE_TOAST_METRICS.titleSize;
    return {
      padding: Math.max(4, Math.round(BASE_TOAST_METRICS.padding * ratio)),
      gap: Math.max(2, Math.round(BASE_TOAST_METRICS.gap * ratio)),
      titleSize: value,
      titleGap: Math.max(1, Math.round(BASE_TOAST_METRICS.titleGap * ratio)),
      bodySize: Math.max(9, Math.round(BASE_TOAST_METRICS.bodySize * ratio)),
      bodyLineHeight: Math.max(12, Math.round(BASE_TOAST_METRICS.bodyLineHeight * ratio)),
      iconSize: Math.max(10, Math.round(BASE_TOAST_METRICS.iconSize * ratio)),
      minHeight: Math.max(28, Math.round(BASE_TOAST_METRICS.minHeight * ratio)),
      actionFontSize: Math.max(9, Math.round(BASE_TOAST_METRICS.actionFontSize * ratio)),
      actionPaddingHorizontal: Math.max(4, Math.round(BASE_TOAST_METRICS.actionPaddingHorizontal * ratio)),
      actionPaddingVertical: Math.max(2, Math.round(BASE_TOAST_METRICS.actionPaddingVertical * ratio)),
      closeButtonSize: Math.max(16, Math.round(BASE_TOAST_METRICS.closeButtonSize * ratio)),
    };
  }

  const resolved = resolveComponentSize(value, TOAST_SIZE_SCALE, {
    allowedSizes: TOAST_ALLOWED_SIZES,
    fallback: 'md',
  });

  return typeof resolved === 'number' ? resolveToastMetrics(resolved) : resolved;
};

// Helper function to map severity to theme colors
const getSeverityColor = (severity: ToastSeverity): ToastColor => {
  switch (severity) {
    case 'info':
      return 'primary';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'primary';
  }
};

function ToastBase(props: ToastProps, ref: React.Ref<View>) {
  const {
    variant = 'light',
    size = 'md',
    color = 'gray',
    sev,
    title,
    children,
    icon,
    withCloseButton = true,
    loading = false,
    closeButtonLabel = 'Close notification',
    onClose,
    visible = false,
    animationDuration = 300,
    transitionDuration,
    autoHide = 4000,
    position = 'top',
    style,
    testID,
    radius,
    actions,
    dismissOnTap = false,
    maxWidth,
    persistent = false,
    animationConfig,
    swipeConfig,
    onSwipeDismiss,
    keepMounted = true,
    selectable = false,
    titleProps,
    bodyProps,
    ...rest
  } = props;

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);

  const theme = useTheme();

  // Handle radius prop with 'md' as default for toasts
  const radiusStyles = createRadiusStyles(radius || 'md');
  const metrics = React.useMemo(() => resolveToastMetrics(size), [size]);
  const padding = metrics.padding;

  // Helper function to get hidden position based on toast position
  const getHiddenPosition = React.useCallback((pos: string): number => {
    'worklet';
    switch (pos) {
      case 'top':
        return -100; // Slide from top
      case 'bottom':
        return 100; // Slide from bottom
      case 'left':
        return -100; // Slide from left
      case 'right':
        return 100; // Slide from right
      default:
        return -100;
    }
  }, []);

  // Animation values - always start from hidden position
  const slideAnimation = useSharedValue(getHiddenPosition(position));
  const fadeAnimation = useSharedValue(0);
  const swipeX = useSharedValue(0);
  const swipeY = useSharedValue(0);
  const autoHideTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Get screen dimensions for swipe calculations
  const screenWidth = Dimensions.get('window').width;
  
  // `transitionDuration` is the cross-component spelling and wins over the
  // Toast-specific `animationDuration`; 0 shows/hides with no transition.
  const resolvedDuration = Math.max(transitionDuration ?? animationDuration, 0);

  // Default configurations
  const defaultAnimationConfig: ToastAnimationConfig = {
    type: 'slide',
    duration: resolvedDuration,
    easing: Easing.out(Easing.ease),
    springConfig: {
      damping: 15,
      stiffness: 100,
      mass: 1,
    }
  };

  const defaultSwipeConfig: ToastSwipeConfig = {
    enabled: true,
    threshold: screenWidth * 0.4,
    direction: 'horizontal',
    velocityThreshold: 500,
  };

  const finalAnimationConfig = { ...defaultAnimationConfig, ...animationConfig };
  // Effective show/hide length; 0 means "no transition" and is applied directly.
  const toastDuration = Math.max(finalAnimationConfig.duration ?? resolvedDuration, 0);
  const finalSwipeConfig = { ...defaultSwipeConfig, ...swipeConfig };

  // Memoize expensive calculations
  const memoizedColors = React.useMemo(() => {
    // Determine final color - severity overrides color prop
    const finalColor = sev ? getSeverityColor(sev) : color;
    
    // Check if finalColor is a theme color or custom color string
    const isThemeColor = typeof finalColor === 'string' &&
      ['primary', 'secondary', 'success', 'warning', 'error', 'gray'].includes(finalColor);

    const colorConfig = isThemeColor
      ? theme.colors[finalColor as keyof typeof theme.colors]
      : null;

    return { finalColor, isThemeColor, colorConfig };
  }, [sev, color, theme.colors]);

  const { finalColor, isThemeColor, colorConfig } = memoizedColors;

  const shouldUnmountOnHide = !keepMounted;

  const [shouldRender, setShouldRender] = React.useState(shouldUnmountOnHide ? visible : true);

  useEffect(() => {
    if (!shouldUnmountOnHide) {
      setShouldRender(true);
    }
  }, [shouldUnmountOnHide]);
  const transformProperty = React.useMemo(
    () => (position === 'left' || position === 'right' ? 'translateX' : 'translateY'),
    [position]
  );

  // Animation styles
  const animatedStyle = useAnimatedStyle(() => {
    const baseTransform = transformProperty === 'translateX'
      ? [{ translateX: slideAnimation.value }]
      : [{ translateY: slideAnimation.value }];

    // Add swipe transforms
    const swipeTransform = [
      { translateX: swipeX.value },
      { translateY: swipeY.value }
    ];

    // Add rotation based on swipe for natural feel
    const rotation = interpolate(
      swipeX.value,
      [-screenWidth * 0.5, 0, screenWidth * 0.5],
      [-10, 0, 10],
      'clamp'
    );

    // Scale effect during swipe
    const scale = interpolate(
      Math.abs(swipeX.value) + Math.abs(swipeY.value),
      [0, finalSwipeConfig.threshold! * 0.5],
      [1, 0.95],
      'clamp'
    );

    // Combine all transforms
    const allTransforms: any[] = [...baseTransform, ...swipeTransform];

    if (finalSwipeConfig.enabled && finalSwipeConfig.direction !== 'vertical') {
      allTransforms.push({ rotate: `${rotation}deg` });
    }

    if (finalAnimationConfig.type === 'scale' || finalSwipeConfig.enabled) {
      allTransforms.push({ scale });
    }

    return {
      transform: allTransforms,
      opacity: fadeAnimation.value,
    };
  }, [transformProperty, screenWidth, finalSwipeConfig, finalAnimationConfig]);

  const haptics = useHaptics();
  const notifySuccess = haptics.notifySuccess ?? (() => {});
  const notifyWarning = haptics.notifyWarning ?? (() => {});
  const notifyError = haptics.notifyError ?? (() => {});

  // Improved haptic feedback with error handling
  const triggerHapticFeedback = React.useCallback((severity?: ToastSeverity) => {
    try {
      switch (severity) {
        case 'success':
          notifySuccess();
          break;
        case 'warning':
          notifyWarning();
          break;
        case 'error':
          notifyError();
          break;
        default:
          notifySuccess(); // gentle default
      }
    } catch (error) {
      // Silently fail if haptics are not available
      if (__DEV__) {
        console.warn('Haptic feedback failed:', error);
      }
    }
  }, [notifySuccess, notifyWarning, notifyError]);

  // Swipe gesture handler
  const panGesture = React.useMemo(() => {
    if (!finalSwipeConfig.enabled || !Gesture) return null;
    
    return Gesture.Pan()
      .onUpdate((event: any) => {
        'worklet';
        if (finalSwipeConfig.direction === 'horizontal' || finalSwipeConfig.direction === 'both') {
          swipeX.value = event.translationX;
        }
        if (finalSwipeConfig.direction === 'vertical' || finalSwipeConfig.direction === 'both') {
          swipeY.value = event.translationY;
        }
      })
      .onEnd((event: any) => {
        'worklet';
        const shouldDismiss = 
          (finalSwipeConfig.direction === 'horizontal' && 
           (Math.abs(event.translationX) > finalSwipeConfig.threshold! || 
            Math.abs(event.velocityX) > finalSwipeConfig.velocityThreshold!)) ||
          (finalSwipeConfig.direction === 'vertical' && 
           (Math.abs(event.translationY) > finalSwipeConfig.threshold! || 
            Math.abs(event.velocityY) > finalSwipeConfig.velocityThreshold!)) ||
          (finalSwipeConfig.direction === 'both' && 
           (Math.abs(event.translationX) > finalSwipeConfig.threshold! || 
            Math.abs(event.translationY) > finalSwipeConfig.threshold! ||
            Math.abs(event.velocityX) > finalSwipeConfig.velocityThreshold! ||
            Math.abs(event.velocityY) > finalSwipeConfig.velocityThreshold!));

        if (shouldDismiss) {
          // Animate out in the swipe direction
          const dismissDirection = Math.abs(event.translationX) > Math.abs(event.translationY) ? 'horizontal' : 'vertical';
          
          if (dismissDirection === 'horizontal') {
            swipeX.value = withSpring(event.translationX > 0 ? screenWidth : -screenWidth);
          } else {
            swipeY.value = withSpring(event.translationY > 0 ? 300 : -300);
          }
          
          fadeAnimation.value = withTiming(0, { duration: 200 }, (finished) => {
            'worklet';
            if (finished) {
              // Use runOnJS to call callbacks from worklet context
              if (onSwipeDismiss) {
                runOnJS(onSwipeDismiss)();
              }
              if (onClose) {
                runOnJS(onClose)();
              }
            }
          });
        } else {
          // Spring back to original position
          swipeX.value = withSpring(0);
          swipeY.value = withSpring(0);
        }
      });
  }, [finalSwipeConfig, swipeX, swipeY, fadeAnimation, screenWidth, onSwipeDismiss, onClose]);

  // Create a callback that can be called from worklets
  const handleShouldRenderUpdate = React.useCallback((shouldRender: boolean) => {
    setShouldRender(shouldRender);
  }, []);

  useEffect(() => {
    if (visible) {
      if (shouldUnmountOnHide) {
        setShouldRender(true);
      }
      
      // Reset swipe positions
      swipeX.value = 0;
      swipeY.value = 0;

      if (toastDuration === 0) {
        // No transition — present the toast already in place.
        slideAnimation.value = 0;
        fadeAnimation.value = 1;
        triggerHapticFeedback(sev);
        if (autoHide > 0 && !persistent) {
          autoHideTimeoutRef.current = setTimeout(() => {
            onClose?.();
          }, autoHide);
        }
        return () => {
          if (autoHideTimeoutRef.current) {
            clearTimeout(autoHideTimeoutRef.current);
          }
        };
      }

      // Animate in based on animation type
      switch (finalAnimationConfig.type) {
        case 'bounce':
          slideAnimation.value = withSpring(0, finalAnimationConfig.springConfig);
          break;
        case 'scale':
          slideAnimation.value = withTiming(0, { 
            duration: toastDuration,
            easing: finalAnimationConfig.easing
          });
          break;
        case 'fade':
          slideAnimation.value = 0;
          break;
        case 'slide':
        default:
          slideAnimation.value = withTiming(0, { 
            duration: toastDuration,
            easing: finalAnimationConfig.easing || Easing.out(Easing.back(1.1))
          });
      }
      
      fadeAnimation.value = withTiming(1, { 
        duration: toastDuration * 0.8,
        easing: Easing.out(Easing.ease)
      });

      // Haptic feedback on show based on severity
      triggerHapticFeedback(sev);

      // Auto hide
      if (autoHide > 0 && !persistent) {
        autoHideTimeoutRef.current = setTimeout(() => {
          onClose?.();
        }, autoHide);
      }
    } else if (toastDuration === 0) {
      // No transition — drop straight to the hidden state.
      slideAnimation.value = getHiddenPosition(position);
      fadeAnimation.value = 0;
      if (shouldUnmountOnHide) handleShouldRenderUpdate(false);
    } else {
      // Slide out and fade out
      slideAnimation.value = withTiming(getHiddenPosition(position), { 
        duration: toastDuration,
        easing: Easing.in(Easing.back(1.1))
      }, (finished) => {
        'worklet';
        if (finished && shouldUnmountOnHide) {
          runOnJS(handleShouldRenderUpdate)(false);
        }
      });
      fadeAnimation.value = withTiming(0, { 
        duration: toastDuration * 0.6,
        easing: Easing.in(Easing.ease)
      });
    }

    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [visible, finalAnimationConfig, autoHide, onClose, slideAnimation, fadeAnimation, swipeX, swipeY, position, persistent, triggerHapticFeedback, sev, getHiddenPosition, handleShouldRenderUpdate, shouldUnmountOnHide]);

  // A toast floats above everything, so it sits at the top of the elevation
  // ladder alongside Dialog. Previously this used `colors.gray[0]`, which is
  // the *page base* in the dark theme (#0E0E11) — the toast fill matched the
  // background exactly and the message read as floating text with no container.
  const surface = resolveSurface(theme, 3);

  const getToastStyles = () => {
    const baseStyles: ViewStyle = {
      ...radiusStyles,
      padding,
      flexDirection: 'row',
      alignItems: 'center',
      ...Platform.select({
        android: {
          minHeight: metrics.minHeight - 4,
          maxHeight: metrics.minHeight * 2,
          width: '100%',
          alignSelf: 'stretch',
          marginHorizontal: 0, // Ensure no horizontal margins
        },
        default: {
          minHeight: metrics.minHeight,
          width: maxWidth ? Math.min(maxWidth, 400) : '100%',
          maxWidth: maxWidth || 400,
        }
      }),
      // Theme-driven so the dark scale's heavier shadows apply; a fixed 25%
      // black shadow is invisible against a near-black page.
      boxShadow: getShadowValue(COMPONENT_SHADOW_DEFAULTS.toast, theme),
      elevation: 5,
      // Press-and-hold on a toast should swipe/dismiss it, never start a text
      // selection or raise the iOS callout menu. Text slots opt out too, but the
      // container covers the padding and non-text chrome as well.
      ...(Platform.OS === 'web' && !selectable
        ? {
          userSelect: 'none' as any,
          WebkitUserSelect: 'none' as any,
          WebkitTouchCallout: 'none' as any,
        }
        : {}),
    };

    if (colorConfig) {
      // Use theme colors
      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: colorConfig[5]
          };
        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            borderWidth: 1,
            borderColor: colorConfig[5]
          };
        case 'light':
        default:
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            // Hairline on the three non-accent sides: dark mode reads elevation
            // through the border, since the shadow barely registers there.
            borderWidth: 1,
            borderColor: surface.border,
            borderLeftWidth: 4,
            borderLeftColor: colorConfig[5]
          };
      }
    } else {
      // Use custom color
      const customColor = finalColor as string;
      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: customColor
          };
        case 'outline':
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            borderWidth: 1,
            borderColor: customColor
          };
        case 'light':
        default:
          return {
            ...baseStyles,
            backgroundColor: surface.background,
            borderWidth: 1,
            borderColor: surface.border,
            borderLeftWidth: 4,
            borderLeftColor: customColor
          };
      }
    }
  };

  // Background fill for the 'filled' variant, used to pick legible foreground
  // colors. Bright fills (e.g. success green, warning yellow) fail with white
  // text, so readableTextOn flips to near-black when white is unreadable.
  const filledFill = colorConfig ? colorConfig[5] : (finalColor as string);

  const getTextColor = () => {
    switch (variant) {
      case 'filled':
        return readableTextOn(filledFill);
      case 'outline':
      case 'light':
      default:
        return theme.text.primary;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'filled':
        return readableTextOn(filledFill);
      case 'outline':
      case 'light':
      default:
        return colorConfig ? colorConfig[5] : (finalColor as string);
    }
  };

  const toastStyles = getToastStyles();
  const textColor = getTextColor();
  const iconColor = getIconColor();
  // The close affordance follows the toast's text, not its status color: on a
  // filled toast that means the readable foreground, otherwise muted chrome.
  const closeIconColor = variant === 'filled' ? readableTextOn(filledFill) : theme.text.muted;
  // The loading ring sits inside the icon slot, slightly inset so it reads as
  // the same optical weight as a severity glyph at every size.
  const spinnerSize = Math.max(10, Math.round(metrics.iconSize * 0.8));

  if (shouldUnmountOnHide && !shouldRender) {
    return null;
  }

  // Check if swipe is enabled and gesture handler is available
  const needsGestureHandler = finalSwipeConfig.enabled && panGesture && GestureDetector && GestureHandlerRootView;

  const toastContent = (
    <TouchableOpacity
      activeOpacity={dismissOnTap ? 0.8 : 1}
      onPress={dismissOnTap ? onClose : undefined}
      disabled={!dismissOnTap}
      style={{ width: '100%' }}
    >
      <Animated.View
        ref={ref}
        style={[
          toastStyles,
          spacingStyles,
          style,
          animatedStyle
        ]}
        testID={testID}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityLabel={title ? `${title}. ${children || ''}` : String(children || '')}
        {...otherProps}
      >
      {/* Icon or Loading */}
      {(icon || loading) && (
        <View style={{
          marginRight: metrics.gap,
          // Inherit the row's alignItems:'center' on every platform. (Android
          // previously forced alignSelf:'flex-start', which pinned the icon to
          // the top instead of centering it like web.)
          marginTop: 2,
        }}>
          {loading ? (
            <View style={{ width: metrics.iconSize, height: metrics.iconSize, justifyContent: 'center', alignItems: 'center' }}>
              {/* Improved loading indicator */}
              <Animated.View
                style={{
                  width: spinnerSize,
                  height: spinnerSize,
                  borderRadius: spinnerSize / 2,
                  borderWidth: Math.max(1, Math.round(spinnerSize / 8)),
                  borderColor: iconColor,
                  borderTopColor: 'transparent',
                }}
              />
            </View>
          ) : icon ? (
            React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, {
                color: iconColor,
                size: metrics.iconSize
              })
              : icon
          ) : null}
        </View>
      )}

      {/* Content */}
      <View style={{ 
        flex: 1, 
        ...Platform.select({
          android: {
            paddingVertical: 4, // Add padding for Android text rendering
          }
        })
      }}>
        {title && (
          <Text
            {...mergeSlotProps(
              {
                size: metrics.titleSize,
                weight: '600',
                numberOfLines: 2,
                selectable,
                style: {
                  color: textColor,
                  marginBottom: children ? metrics.titleGap : 0,
                  ...Platform.select({
                    android: { lineHeight: Math.round(metrics.titleSize * 1.25) },
                  }),
                },
              },
              titleProps
            )}
          >
            {title}
          </Text>
        )}

        {children && (
          <Text
            {...mergeSlotProps(
              {
                size: metrics.bodySize,
                lineHeight: metrics.bodyLineHeight,
                numberOfLines: 3,
                selectable,
                style: {
                  color: textColor,
                  ...Platform.select({
                    android: { includeFontPadding: false },
                  }),
                },
              },
              bodyProps
            )}
          >
            {children}
          </Text>
        )}
      </View>

      {/* Action buttons */}
      {actions && actions.length > 0 && (
        <View style={{
          flexDirection: 'row',
          marginLeft: metrics.gap,
          gap: Math.max(2, Math.round(metrics.gap / 2))
        }}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={{
                paddingHorizontal: metrics.actionPaddingHorizontal,
                paddingVertical: metrics.actionPaddingVertical,
                borderRadius: 4,
                backgroundColor: action.color || (variant === 'filled' ? 'rgba(255,255,255,0.2)' : iconColor + '20'),
              }}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <Text
                selectable={selectable}
                style={{
                  fontSize: metrics.actionFontSize,
                  fontWeight: '600',
                  color: action.color || textColor,
                }}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Close Button — dismissal is chrome, not part of the message, so it
          stays neutral instead of picking up the severity color the leading
          icon uses. */}
      {withCloseButton && (
        <IconButton
          icon="close"
          onPress={onClose}
          variant="ghost"
          size={metrics.closeButtonSize}
          iconSize={Math.round(metrics.closeButtonSize / 2)}
          iconColor={closeIconColor}
          accessibilityLabel={closeButtonLabel || 'Close notification'}
          style={{
            marginLeft: metrics.gap,
            marginTop: -Math.round(metrics.gap / 2),
            marginRight: -Math.round(metrics.gap / 2),
          }}
        />
      )}
      </Animated.View>
    </TouchableOpacity>
  );

  // Conditionally wrap with gesture handling
  if (needsGestureHandler) {
    return (
      <GestureHandlerRootView style={{ width: '100%' }}>
        <GestureDetector gesture={panGesture}>
          {toastContent}
        </GestureDetector>
      </GestureHandlerRootView>
    );
  }

  return toastContent;
}

export const Toast = factory<ToastFactoryPayload>(ToastBase);

Toast.displayName = 'Toast';
