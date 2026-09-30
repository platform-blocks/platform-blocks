import React, { createContext, useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory, withStatics } from '../../core/factory';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { ViewportPortal } from '../../core/overlay/ViewportPortal';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getZIndex } from '../../core/theme/zIndices';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { IconButton } from '../IconButton';
import { Surface } from '../Surface';
import type { ActionBarCloseButtonProps, ActionBarDividerProps, ActionBarProps } from './types';

const CloseContext = createContext<(() => void) | undefined>(undefined);
export const ActionBarDivider = factory<{ props: ActionBarDividerProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const theme = useTheme();
  return <View ref={ref} testID={testID} {...a11yProps({ role: 'separator', orientation: 'vertical' })} style={[{ width: 1, alignSelf: 'stretch', backgroundColor: theme.backgrounds.border, marginHorizontal: 4 }, spacing, style]} />;
}, { displayName: 'ActionBar.Divider' });
export const ActionBarCloseButton = factory<{ props: ActionBarCloseButtonProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { accessibilityLabel = 'Close', style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const close = useContext(CloseContext);
  return <IconButton ref={ref} icon="close" variant="ghost" size="sm" accessibilityLabel={accessibilityLabel} onPress={close} testID={testID} style={[spacing, style]} />;
}, { displayName: 'ActionBar.CloseButton' });
const Root = factory<{ props: ActionBarProps; ref: View }>((all, ref) => {
  const { styleProps, otherProps: { children, opened, onClose, closeOnEscape = false, keepMounted = false, withinPortal = true, position = { bottom: 24 }, radius = 'md', shadow = 'md', withBorder = true, zIndex, transition = 'pop', transitionDuration: transitionDurationProp, 'aria-label': label = 'Actions', style, testID } } = extractStyleProps(all);
  const spacing = useStyleProps(styleProps);
  const theme = useTheme();
  const duration = useTransitionDuration(transitionDurationProp, 200);
  const progress = useSharedValue(opened ? 1 : 0);
  const [mounted, setMounted] = useState(opened);
  useEffect(() => {
    if (opened) setMounted(true);
    progress.value = duration ? withTiming(opened ? 1 : 0, { duration }) : opened ? 1 : 0;
    if (opened || keepMounted) return;
    const timer = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(timer);
  }, [opened, keepMounted, duration, progress]);
  const animated = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ translateY: transition === 'slide-up' ? (1 - progress.value) * 24 : 0 }, { scale: transition === 'pop' ? 0.9 + progress.value * 0.1 : 1 }] }), [transition]);
  if (!mounted && !keepMounted) return null;
  return <ViewportPortal withinPortal={withinPortal} zIndex={zIndex ?? getZIndex(theme, 'sticky')} closeOnEscape={closeOnEscape && opened} onDismiss={onClose}>
    <CloseContext.Provider value={onClose}>
      <Animated.View style={[{ position: 'absolute', top: position.top, bottom: position.bottom, start: position.start ?? (position.end == null ? 24 : undefined), end: position.end ?? (position.start == null ? 24 : undefined), alignItems: position.start == null && position.end == null ? 'center' : position.end != null ? 'flex-end' : 'flex-start' }, animated]} pointerEvents={opened ? 'auto' : 'none'}>
        <Surface ref={ref} raised radius={radius} shadow={shadow} withBorder={withBorder} testID={testID} {...a11yProps({ role: 'group', label })} style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8 }, spacing, style]}>{children}</Surface>
      </Animated.View>
    </CloseContext.Provider>
  </ViewportPortal>;
}, { displayName: 'ActionBar' });
export const ActionBar = withStatics(Root, { Divider: ActionBarDivider, CloseButton: ActionBarCloseButton });
