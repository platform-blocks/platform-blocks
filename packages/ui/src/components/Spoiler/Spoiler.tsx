import React, { useState, useEffect } from 'react';
import { View, Pressable, LayoutChangeEvent, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { extractSpacingProps, getSpacingStyles, SpacingProps, mergeSlotProps } from '../../core/utils';
import { getFontSize } from '../../core/theme/sizes';
import { SpoilerProps } from './types';
import { Collapse } from '../Collapse';
import { useControllableState } from '../../hooks/useControllableState';

/** Simple height-based spoiler (collapsible) component */
export const Spoiler = React.forwardRef<View, SpoilerProps>((allProps, ref) => {
  const { spacingProps, otherProps } = extractSpacingProps(allProps);
  const {
    children,
    maxHeight = 120,
    initiallyOpen = false,
    showLabel = 'Show more',
    hideLabel = 'Hide',
    transitionDuration = 180,
    size = 'sm',
    opened: openedProp,
    onToggle,
    disabled,
    style,
  renderControl,
  transparentFade = true,
  fadeColor,
  disableFadeAnimation = false,
  controlProps,
  } = otherProps;

  const theme = useTheme();
  const spacingStyles = getSpacingStyles(spacingProps);

  const [opened, setOpened] = useControllableState<boolean>({
    value: openedProp,
    defaultValue: initiallyOpen,
    finalValue: false,
    onChange: onToggle,
  });
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);
  // Seed from the resolved state, not `initiallyOpen` — a controlled `opened`
  // would otherwise start at the wrong end and animate on mount.
  const fadeProgress = useSharedValue<number>(opened ? 1 : 0);

  // measure after first layout
  const onContentLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setMeasuredHeight(prev => {
      if (prev === null || Math.abs(prev - h) > 0.5) {
        return h;
      }
      return prev;
    });
  };

  const toggle = () => {
    if(disabled) return;
    setOpened((previous) => !previous);
  };

  const isClamped = measuredHeight != null && measuredHeight > maxHeight && !opened;
  useEffect(() => {
    if (measuredHeight == null) return;

    // `transitionDuration={0}` means no transition — jump to the end state.
    const shouldAnimateFade = !disableFadeAnimation && transitionDuration > 0 && measuredHeight > maxHeight && transparentFade;
    const targetFade = opened ? 1 : 0;

    fadeProgress.value = shouldAnimateFade
      ? withTiming(targetFade, { duration: transitionDuration })
      : targetFade;

    if (!hasMeasured) {
      if (Platform.OS === 'android') {
        setTimeout(() => setHasMeasured(true), 16);
      } else {
        requestAnimationFrame(() => setHasMeasured(true));
      }
    }
  }, [measuredHeight, opened, maxHeight, transitionDuration, disableFadeAnimation, transparentFade, hasMeasured, fadeProgress]);

  const shouldClamp = measuredHeight != null && measuredHeight > maxHeight;
  const collapsedHeight = measuredHeight != null ? Math.min(measuredHeight, maxHeight) : maxHeight;

  // Always return the key: dropping it from the returned object leaves the last
  // applied mask on the node rather than clearing it, so the fully-open state
  // has to say `none` explicitly.
  const animatedWrapperStyle = useAnimatedStyle(() => {
    const progress = fadeProgress.value;
    if (!shouldClamp || Platform.OS !== 'web' || !transparentFade || progress >= 1) {
      return { WebkitMaskImage: 'none' } as any;
    }
    const startStop = 75 + 25 * progress;
    return {
      WebkitMaskImage: `linear-gradient(to bottom, black ${startStop}%, transparent 100%)`,
    } as any;
  }, [shouldClamp, transparentFade]);

  const animatedFadeStyle = useAnimatedStyle(() => ({
    opacity: fadeProgress.value < 1 ? 1 - fadeProgress.value : 0,
  }), []);

  const fontSize = getFontSize(size);

  return (
    <View ref={ref} style={[spacingStyles, style]}>      
      <Animated.View
        style={[
          { position: 'relative' },
          !hasMeasured && Platform.OS !== 'android' && { opacity: 0 },
          animatedWrapperStyle,
        ]}
      >
        <Collapse
          isCollapsed={shouldClamp && !opened}
          duration={transitionDuration}
          collapsedHeight={collapsedHeight}
          fadeContent={false}
          style={{ overflow: 'hidden' }}
        >
          <View
            onLayout={onContentLayout}
            style={Platform.OS === 'android' && !hasMeasured ? { opacity: 0 } : undefined}
          >
            {children}
          </View>
        </Collapse>
        {shouldClamp && !opened && Platform.OS === 'web' && !transparentFade && (
          <Animated.View
            style={[{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 48,
              justifyContent: 'flex-end',
              paddingTop: 24,
              background: `linear-gradient(rgba(0,0,0,0), ${fadeColor || theme.colors.gray[0]})`,
            } as any, !disableFadeAnimation && animatedFadeStyle]}
            pointerEvents="none"
          />
        )}
      </Animated.View>
      {shouldClamp && (
        <Pressable
          onPress={toggle}
          disabled={disabled}
          style={{ marginTop: 8, marginRight: 20, alignSelf: 'flex-end' }}
          accessibilityRole="button"
          accessibilityState={{ expanded: opened, disabled: !!disabled }}
          accessibilityLabel={opened ? hideLabel : showLabel}
        >
          {renderControl ? (
            renderControl({ opened, toggle, showLabel, hideLabel })
          ) : (
            <Text
              {...mergeSlotProps(
                {
                  variant: 'small' as const,
                  weight: '500' as const,
                  style: { color: theme.colors.primary[6], fontSize },
                },
                controlProps,
              )}
            >
              {opened ? hideLabel : showLabel}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
});

Spoiler.displayName = 'Spoiler';

export default Spoiler;
