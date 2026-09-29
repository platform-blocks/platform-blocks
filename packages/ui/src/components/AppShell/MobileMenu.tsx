import React, { useContext, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { handleModalRequestClose } from '../../core/overlay/layerStack';
import { useLayer } from '../../core/overlay/useLayer';
import { isWeb } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveRadius, resolveScrim, resolveShadow } from '../../core/theme/tokens';
import { getZIndex } from '../../core/theme/zIndices';
import { warnOnce } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { FILL, selectViewportHeight, spacingPx, useViewportSelector } from './shellUtils';
import type { MobileMenuProps } from './types';

/**
 * How far the theme scrim (`backgrounds.scrim`) fades in behind the menu: a
 * lighter wash than a dialog / drawer backdrop.
 */
const MENU_SCRIM_OPACITY = 0.6;
const FLEX_1: ViewStyle = { flex: 1 };

/**
 * A modal navigation menu for phones: full screen by default, or a floating
 * sheet (`config.type: 'modal' | 'drawer'`). It is a modal layer — Escape
 * (web) and Android back close it, focus moves into it and stays there, and
 * returns to the opener when it closes. Stays mounted through its exit
 * animation.
 */
export const MobileMenu = factory<{ props: MobileMenuProps; ref: View }>(
  function MobileMenu(props, ref) {
    const {
      opened: openedProp,
      visible,
      onClose,
      children,
      config,
      accessibilityLabel = 'Menu',
      style,
      testID,
    } = props;

    if (visible !== undefined) {
      warnOnce('MobileMenu.visible', '[platform-blocks] MobileMenu: `visible` is deprecated; use `opened`.');
    }
    const opened = openedProp ?? visible ?? false;

    const theme = useTheme();
    const spacingStyles = useStyleProps(props);
    const insets = useContext(SafeAreaInsetsContext);
    const viewportHeight = useViewportSelector(selectViewportHeight);
    const reducedMotion = useReducedMotion();

    const {
      type = 'fullscreen',
      animationType = 'slide',
      showBackdrop = true,
      closeOnOutsidePress = true,
      transitionDuration = 300,
    } = config ?? {};
    const duration = reducedMotion || animationType === 'none' ? 0 : transitionDuration;

    const handleClose = useLatestCallback(onClose);
    const containerRef = useRef<View>(null);
    const mergedRef = useMergedRef<View>(containerRef, ref);

    // Stay mounted until the exit animation has finished.
    const [mounted, setMounted] = useState(opened);
    if (opened && !mounted) setMounted(true);

    const progress = useSharedValue(0);
    useEffect(() => {
      if (opened) {
        progress.value = duration > 0 ? withTiming(1, { duration }) : 1;
        return;
      }
      if (duration > 0) {
        progress.value = withTiming(0, { duration }, (finished) => {
          if (finished) runOnJS(setMounted)(false);
        });
      } else {
        progress.value = 0;
        setMounted(false);
      }
    }, [opened, duration, progress]);

    useLayer({ active: opened, modal: true, onDismiss: handleClose, containerRef });

    const backdropStyle = useAnimatedStyle(
      () => ({ opacity: interpolate(progress.value, [0, 1], [0, MENU_SCRIM_OPACITY]) }),
      [progress]
    );

    const containerStyle = useAnimatedStyle(() => {
      if (animationType === 'slide') {
        return { transform: [{ translateY: interpolate(progress.value, [0, 1], [viewportHeight, 0]) }] };
      }
      if (animationType === 'fade') {
        return { opacity: progress.value, transform: [{ scale: interpolate(progress.value, [0, 1], [0.95, 1]) }] };
      }
      return { opacity: progress.value };
    }, [animationType, viewportHeight, progress]);

    if (!mounted) {
      return null;
    }

    const dialogProps = a11yProps({ role: 'dialog', modal: true, label: accessibilityLabel });
    const sheet = type !== 'fullscreen';

    if (isWeb) {
      // Web: a fixed full-viewport layer above the page.
      return (
        <View style={[FILL, webStyle({ position: 'fixed', zIndex: getZIndex(theme, 'modal') })]}>
          {showBackdrop && (
            <Animated.View aria-hidden style={[FILL, { backgroundColor: resolveScrim(theme) }, backdropStyle]} />
          )}
          <Animated.View
            ref={mergedRef}
            testID={testID}
            {...dialogProps}
            style={[
              FLEX_1,
              { backgroundColor: theme.backgrounds.base, padding: spacingPx(theme, 'lg') },
              containerStyle,
              spacingStyles,
              style,
            ]}
          >
            <SafeAreaView style={FLEX_1}>{children}</SafeAreaView>
          </Animated.View>
        </View>
      );
    }

    // Native Modal implementation
    return (
      <Modal
        visible={mounted}
        animationType="none" // We handle animation ourselves
        transparent={sheet}
        statusBarTranslucent={!sheet}
        presentationStyle={sheet ? 'overFullScreen' : 'fullScreen'}
        onRequestClose={handleModalRequestClose}
      >
        <View style={FLEX_1}>
          {showBackdrop && sheet && (
            <Animated.View aria-hidden style={[FILL, { backgroundColor: resolveScrim(theme) }, backdropStyle]} />
          )}

          {closeOnOutsidePress && sheet && (
            // Pointer affordance only: Android back / the menu's own controls close it for AT users.
            <Pressable
              style={FILL}
              onPress={handleClose}
              aria-hidden
              importantForAccessibility="no-hide-descendants"
            />
          )}

          <Animated.View
            ref={mergedRef}
            testID={testID}
            {...dialogProps}
            style={[
              FLEX_1,
              { backgroundColor: theme.backgrounds.base },
              sheet
                ? [
                    {
                      marginTop: (insets?.top ?? 0) + spacingPx(theme, 'xl'),
                      marginHorizontal: spacingPx(theme, 'lg'),
                      borderRadius: resolveRadius(theme, 'xl'),
                    },
                    resolveShadow(theme, 'lg'),
                  ]
                : null,
              containerStyle,
              spacingStyles,
              style,
            ]}
          >
            <SafeAreaView style={FLEX_1} edges={sheet ? [] : ['top', 'bottom']}>
              {children}
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    );
  },
  { displayName: 'MobileMenu' }
);
