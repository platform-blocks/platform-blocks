import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useA11yId } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isAndroid, isWeb, webStyle } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize } from '../../core/theme/tokens';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Collapse } from '../Collapse';
import { Text } from '../Text';
import type { SpoilerProps } from './types';

/** Web-only CSS mask, built inside the animated-style worklet. */
function maskImage(value: string): ViewStyle {
  'worklet';
  return { WebkitMaskImage: value } as unknown as ViewStyle;
}

const HIDDEN: ViewStyle = { opacity: 0 };
const WRAPPER: ViewStyle = { position: 'relative' };
const CONTROL: ViewStyle = { marginTop: 8, marginEnd: 20, alignSelf: 'flex-end' };

/**
 * Clamps content to `mah` with a "Show more" / "Hide" toggle. The toggle
 * is a button with `aria-expanded` / `aria-controls` pointing at the content.
 */
export const Spoiler = factory<{ props: SpoilerProps; ref: View }>((allProps, ref) => {
  // `mah` clamps the content, so it is taken out before the root's style props.
  const { mah: maxHeight = 120, ...propsWithoutMah } = allProps;
  const { styleProps, otherProps } = extractStyleProps(propsWithoutMah);
  const {
    children,
    expanded: expandedProp,
    defaultExpanded,
    onExpandedChange,
    showLabel = 'Show more',
    hideLabel = 'Hide',
    transitionDuration: transitionDurationProp,
    size = 'sm',
    disabled,
    style,
    testID,
    renderControl,
    transparentFade = true,
    fadeColor,
    disableFadeAnimation = false,
    controlProps,
  } = otherProps;

  const theme = useTheme();
  const spacingStyles = useStyleProps(styleProps);
  const contentId = useA11yId(undefined, 'plocks-spoiler');
  // Reduced motion (or `transitionDuration={0}`) → 0: jump to the end state.
  const transitionDuration = useTransitionDuration(transitionDurationProp, 180);

  const [expanded, setExpanded] = useControllableState<boolean>({
    value: expandedProp,
    defaultValue: defaultExpanded,
    finalValue: false,
    onChange: onExpandedChange,
  });
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const [hasMeasured, setHasMeasured] = useState(false);
  // Seed from the resolved state, not the default — a controlled `expanded`
  // would otherwise start at the wrong end and animate on mount.
  const fadeProgress = useSharedValue<number>(expanded ? 1 : 0);

  // measure after first layout
  const onContentLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setMeasuredHeight((prev) => (prev === null || Math.abs(prev - h) > 0.5 ? h : prev));
  }, []);

  const toggle = useCallback(() => {
    if (disabled) return;
    setExpanded((previous) => !previous);
  }, [disabled, setExpanded]);

  useEffect(() => {
    if (measuredHeight == null) return;

    const shouldAnimateFade = !disableFadeAnimation && transitionDuration > 0 && measuredHeight > maxHeight && transparentFade;
    const targetFade = expanded ? 1 : 0;

    fadeProgress.value = shouldAnimateFade ? withTiming(targetFade, { duration: transitionDuration }) : targetFade;
  }, [measuredHeight, expanded, maxHeight, transitionDuration, disableFadeAnimation, transparentFade, fadeProgress]);

  // Reveal the content one frame after the first measurement, so the initial
  // clamp is never seen mid-layout.
  useEffect(() => {
    if (measuredHeight == null || hasMeasured) return;
    if (isAndroid) {
      const timer = setTimeout(() => setHasMeasured(true), 16);
      return () => clearTimeout(timer);
    }
    const frame = requestAnimationFrame(() => setHasMeasured(true));
    return () => cancelAnimationFrame(frame);
  }, [measuredHeight, hasMeasured]);

  const shouldClamp = measuredHeight != null && measuredHeight > maxHeight;
  const collapsedHeight = measuredHeight != null ? Math.min(measuredHeight, maxHeight) : maxHeight;
  const useMask = isWeb && transparentFade;

  // Always return the key on web: dropping it from the returned object leaves
  // the last applied mask on the node rather than clearing it, so the fully-open
  // state has to say `none` explicitly.
  const animatedWrapperStyle = useAnimatedStyle(() => {
    if (!useMask) return {};
    const progress = fadeProgress.value;
    if (!shouldClamp || progress >= 1) {
      return maskImage('none');
    }
    const startStop = 75 + 25 * progress;
    return maskImage(`linear-gradient(to bottom, black ${startStop}%, transparent 100%)`);
  }, [shouldClamp, useMask]);

  const animatedFadeStyle = useAnimatedStyle(
    () => ({
      opacity: fadeProgress.value < 1 ? 1 - fadeProgress.value : 0,
    }),
    []
  );

  const fontSize = resolveFontSize(theme, size);
  const controlLabel = expanded ? hideLabel : showLabel;

  return (
    <View ref={ref} testID={testID} style={[spacingStyles, style]}>
      <Animated.View style={[WRAPPER, !hasMeasured && !isAndroid && HIDDEN, animatedWrapperStyle]}>
        <Collapse
          isCollapsed={shouldClamp && !expanded}
          transitionDuration={transitionDuration}
          collapsedHeight={collapsedHeight}
          fadeContent={false}
        >
          <View
            {...a11yProps({ id: contentId })}
            onLayout={onContentLayout}
            style={isAndroid && !hasMeasured ? HIDDEN : undefined}
          >
            {children}
          </View>
        </Collapse>
        {shouldClamp && !expanded && isWeb && !transparentFade && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                start: 0,
                end: 0,
                bottom: 0,
                height: 48,
                justifyContent: 'flex-end',
                paddingTop: 24,
              },
              webStyle({
                backgroundImage: `linear-gradient(rgba(0,0,0,0), ${fadeColor || theme.backgrounds.base})`,
              }),
              !disableFadeAnimation && animatedFadeStyle,
            ]}
            pointerEvents="none"
          />
        )}
      </Animated.View>
      {shouldClamp && (
        <Pressable
          onPress={toggle}
          disabled={disabled}
          style={CONTROL}
          {...a11yProps({
            role: 'button',
            label: controlLabel,
            expanded,
            controls: contentId,
            disabled: !!disabled,
          })}
        >
          {renderControl ? (
            renderControl({ expanded, toggle, showLabel, hideLabel })
          ) : (
            <Text
              {...mergeSlotProps(
                {
                  variant: 'small' as const,
                  fw: '500' as const,
                  style: { color: theme.colors.primary[6], fontSize },
                },
                controlProps
              )}
            >
              {controlLabel}
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}, { displayName: 'Spoiler' });

export default Spoiler;
