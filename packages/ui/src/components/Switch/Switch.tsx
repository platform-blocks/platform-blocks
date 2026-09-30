import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { consumeEvent, focusNode, readKey, type KeyboardEventLike } from '../../core/accessibility/keyboard';
import { factory } from '../../core/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isWeb, webProps } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { literalBackgrounds, literalText } from '../../core/theme/cssVariableTheme';
import { getControlSize, resolveShadow } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import { getLayoutStyles } from '../../core/utils/layout';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { warnOnce } from '../../core/utils/logger';
import { useControllableState } from '../../hooks/useControllableState';
import { ChoiceField, useIsChoiceIndicator } from '../Checkbox/ChoiceField';
import { getSwitchActiveColor } from './styles';
import type { SwitchProps, SwitchVariant } from './types';

/** Default on/off transition when no `transitionDuration` is given (the timing fallback). */
const BASE_DURATION = 200;
/** The spring the toggle has always used: damping 20, stiffness 150, mass 0.5. */
const TOGGLE_SPRING = { damping: 20, stiffness: 150, mass: 0.5 };
const TRACK_BORDER = 2;
const LABEL_GAP = 8;
/** Tighter spacing when the label sits above / below. */
const STACKED_GAP = 4;
const MIN_TARGET_WEB = 24;
const MIN_TARGET_NATIVE = 44;
/** Proportions of the `md` switch (40 × 22 track, 18 thumb). */
const WIDTH_RATIO = 40 / 22;
const THUMB_RATIO = 18 / 22;

/**
 * Track height: a fixed ratio of the control-size icon so it follows the theme
 * (md 22). A numeric `size` is the track height itself.
 */
export const getSwitchTrackHeight = (theme: PlocksTheme, size: SizeValue | undefined): number =>
  typeof size === 'number' ? size : Math.round(getControlSize(theme, size).iconSize * 1.375);

interface SwitchGeometry {
  width: number;
  height: number;
  offThumb: number;
  onThumb: number;
  offX: number;
  onX: number;
  offTop: number;
  onTop: number;
}

/** Per-variant thumb geometry, in the track's padding box (inside the border). */
const getGeometry = (variant: SwitchVariant, height: number): SwitchGeometry => {
  const width = Math.round(height * WIDTH_RATIO);
  const innerWidth = width - TRACK_BORDER * 2;
  const inner = height - TRACK_BORDER * 2;
  // Resting (off) and active (on) diameters: `ios` has a large thumb that fills
  // the track and only slides; `android` a small dot that grows as it turns on.
  const thumb = Math.round(height * THUMB_RATIO);
  const offThumb = variant === 'ios' ? inner : variant === 'android' ? Math.round(height * 0.42) : thumb;
  const onThumb = variant === 'ios' ? inner : variant === 'android' ? Math.round(height * 0.72) : thumb;
  // Each end keeps the same inset from its edge as from the top/bottom, so the
  // thumb sits centered at both ends.
  const offInset = (inner - offThumb) / 2;
  const onInset = (inner - onThumb) / 2;
  return {
    width,
    height,
    offThumb,
    onThumb,
    offX: offInset,
    onX: innerWidth - onThumb - onInset,
    offTop: offInset,
    onTop: onInset,
  };
};

/**
 * An on/off toggle: `role="switch"` with `aria-checked`, linked to its label
 * like an HTML `<label>` (pressing the label toggles it; one tab stop). Space
 * toggles it on web.
 */
export const Switch = factory<{ props: SwitchProps; ref: View }>((props, ref) => {
  const {
    checked,
    defaultChecked = false,
    onChange,
    size = 'md',
    variant = 'filled',
    color = 'primary',
    transitionDuration,
    label,
    children,
    description,
    error,
    helperText,
    disabled = false,
    readOnly = false,
    required = false,
    withAsterisk,
    labelPosition = 'right',
    labelProps,
    descriptionProps,
    onIcon,
    offIcon,
    onLabel = 'On',
    offLabel = 'Off',
    controls,
    accessibilityLabel,
    accessibilityHint,
    onFocus,
    onBlur,
    id,
    testID,
    style,
    disclaimer,
    disclaimerProps,
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const decorative = useIsChoiceIndicator();
  const spacingStyles = useStyleProps(props);
  const layoutStyles = getLayoutStyles(props);
  const controlRef = useRef<View>(null);
  const mergedRef = useMergedRef(controlRef, ref);

  const [isChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange,
  });

  const locked = disabled || readOnly;
  const toggle = useCallback(() => {
    if (locked) return;
    setChecked((previous) => !previous);
  }, [locked, setChecked]);

  // Space toggles a switch; react-native-web's Pressable only presses on Enter
  // for non-button roles.
  const handleKeyDown = useCallback(
    (event: KeyboardEventLike) => {
      const { key } = readKey(event);
      if (key !== ' ' && key !== 'Spacebar') return;
      consumeEvent(event);
      toggle();
    },
    [toggle]
  );

  const handleLabelPress = useCallback(() => {
    toggle();
    if (isWeb) focusNode(controlRef.current);
  }, [toggle]);

  const invalid = !!error;
  const isOutline = variant === 'outline';
  const isIOSVariant = variant === 'ios';
  const isAndroidVariant = variant === 'android';
  const restsGray = isOutline || isAndroidVariant;

  const geometry = getGeometry(variant, getSwitchTrackHeight(theme, size));
  const { width, height, offThumb, onThumb, offX, onX, offTop, onTop } = geometry;
  // The thumb is anchored at the track's start edge, so under RTL it travels
  // toward the (left) end — transforms are physical, hence the sign flip.
  const direction = isRTL ? -1 : 1;

  // Interpolated colors must be literal (on web the semantic tokens are `var()` references).
  const text = literalText(theme);
  const backgrounds = literalBackgrounds(theme);
  const activeColor = getSwitchActiveColor(theme, color);
  const restTrack = backgrounds.borderStrong ?? backgrounds.border;
  const restLine = text.muted;
  const thumbLight = text.onPrimary ?? backgrounds.surface;
  const errorColor = theme.colors.error[5];

  // 0 = off, 1 = on. Springs ignore duration, so an explicit `transitionDuration`
  // switches the toggle to a timing curve — and 0 (or reduced motion) snaps.
  const progress = useSharedValue(isChecked ? 1 : 0);
  const resolvedDuration = useTransitionDuration(transitionDuration, BASE_DURATION);
  const useSpringToggle = transitionDuration == null && resolvedDuration > 0;

  useEffect(() => {
    const target = isChecked ? 1 : 0;
    if (resolvedDuration === 0) {
      progress.value = target;
    } else if (useSpringToggle) {
      progress.value = withSpring(target, TOGGLE_SPRING);
    } else {
      progress.value = withTiming(target, { duration: resolvedDuration });
    }
  }, [isChecked, progress, resolvedDuration, useSpringToggle]);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    const translateX = direction * interpolate(progress.value, [0, 1], [offX, onX]);
    if (isAndroidVariant) {
      // The dot grows and lightens as the switch turns on.
      const diameter = interpolate(progress.value, [0, 1], [offThumb, onThumb]);
      return {
        transform: [{ translateX }],
        width: diameter,
        height: diameter,
        borderRadius: diameter / 2,
        top: interpolate(progress.value, [0, 1], [offTop, onTop]),
        backgroundColor: disabled ? text.disabled : interpolateColor(progress.value, [0, 1], [restLine, thumbLight]),
      };
    }
    if (isOutline && !disabled) {
      // The thumb is the colored element, tinting from the resting gray.
      return {
        transform: [{ translateX }],
        backgroundColor: interpolateColor(progress.value, [0, 1], [restLine, activeColor]),
      };
    }
    return { transform: [{ translateX }] };
  }, [direction, offX, onX, offThumb, onThumb, offTop, onTop, isAndroidVariant, isOutline, disabled, restLine, thumbLight, activeColor, text.disabled]);

  const trackAnimatedStyle = useAnimatedStyle(() => {
    if (isOutline) {
      // Transparent track whose border tints toward the active color.
      return error || disabled
        ? { backgroundColor: 'transparent' }
        : { backgroundColor: 'transparent', borderColor: interpolateColor(progress.value, [0, 1], [restLine, activeColor]) };
    }
    const backgroundColor = disabled
      ? backgrounds.disabled
      : interpolateColor(progress.value, [0, 1], [restTrack, activeColor]);
    if (isAndroidVariant && !invalid && !disabled) {
      return { backgroundColor, borderColor: interpolateColor(progress.value, [0, 1], [restLine, activeColor]) };
    }
    return { backgroundColor };
  }, [isOutline, isAndroidVariant, invalid, disabled, restTrack, restLine, activeColor, backgrounds.disabled]);

  const styles = useThemedStyles(
    (t) => ({
      track: {
        width,
        height,
        borderRadius: height / 2,
        borderWidth: TRACK_BORDER,
        borderColor: disabled
          ? t.text.disabled
          : invalid
            ? errorColor
            : restsGray
              ? t.text.muted
              : 'transparent',
        opacity: disabled ? 0.5 : 1,
      } as ViewStyle,
      thumb: {
        position: 'absolute',
        start: 0,
        top: offTop,
        width: offThumb,
        height: offThumb,
        borderRadius: offThumb / 2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // Outline/android thumbs rest gray (tinted by the animation when on), so
        // there's no flash of the wrong color before the first frame.
        backgroundColor: disabled ? t.text.disabled : restsGray ? t.text.muted : t.text.onPrimary,
        ...(isIOSVariant ? { width: onThumb, height: onThumb, borderRadius: onThumb / 2, top: onTop } : null),
        ...resolveShadow(t, 'sm'),
      } as ViewStyle,
    }),
    [width, height, disabled, invalid, restsGray, isIOSVariant, offTop, onTop, offThumb, onThumb, errorColor]
  );

  const visual = (
    <Animated.View style={[styles.track, trackAnimatedStyle]}>
      <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
        {isChecked ? onIcon ?? null : offIcon ?? null}
      </Animated.View>
    </Animated.View>
  );

  if (!decorative && !accessibilityLabel && !getNodeText(children ?? label)) {
    warnOnce(
      'Switch.accessibilityLabel',
      '[Switch] A switch without a visible label needs `accessibilityLabel` so it has an accessible name.'
    );
  }

  // Inside a ControlField row the row is the control; this is only its picture.
  if (decorative) return <View style={{ pointerEvents: 'none' }}>{visual}</View>;

  const webPad = isWeb ? Math.max(0, Math.ceil((MIN_TARGET_WEB - height) / 2)) : 0;
  const hitSlop = isWeb ? undefined : Math.max(0, Math.ceil((MIN_TARGET_NATIVE - height) / 2));

  return (
    <ChoiceField
      id={id}
      label={children ?? label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      labelPosition={labelPosition}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      onLabelPress={handleLabelPress}
      gap={labelPosition === 'top' || labelPosition === 'bottom' ? STACKED_GAP : LABEL_GAP}
      footerInset={width + webPad * 2 + LABEL_GAP}
      disclaimer={disclaimer}
      disclaimerProps={disclaimerProps}
      style={[spacingStyles, layoutStyles, style]}
    >
      {({ controlProps }) => (
        <Pressable
          ref={mergedRef}
          {...controlProps}
          {...a11yProps({
            role: 'switch',
            checked: isChecked,
            controls,
            // Custom state words are spoken on native; the web reads aria-checked.
            value: isWeb ? undefined : { text: isChecked ? onLabel : offLabel },
          })}
          {...webProps({ onKeyDown: locked ? undefined : handleKeyDown })}
          onPress={toggle}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          hitSlop={hitSlop}
          testID={testID}
          style={webPad ? { padding: webPad } : undefined}
        >
          {visual}
        </Pressable>
      )}
    </ChoiceField>
  );
}, { displayName: 'Switch' });

Switch.displayName = 'Switch';
