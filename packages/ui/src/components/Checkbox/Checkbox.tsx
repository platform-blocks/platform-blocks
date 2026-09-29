import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { getControlSize, onColor, resolveRadius } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { getLayoutStyles } from '../../core/utils/layout';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { warnOnce } from '../../core/utils/logger';
import { useControllableState } from '../../hooks/useControllableState';
import { Icon } from '../Icon';
import { ChoiceField, useIsChoiceIndicator } from './ChoiceField';
import type { CheckboxProps } from './types';

/** Length of the default check-on animation; other phases scale against it. */
const CHECKBOX_BASE_DURATION = 160;
/** Border drawn around the box. */
const BORDER_WIDTH = 2;
/** Space between the box and its label. */
const LABEL_GAP = 8;
/** Tighter spacing when the label sits above / below. */
const STACKED_GAP = 4;
/** Minimum pointer target: WCAG 2.2 on web, the platform guideline on native. */
const MIN_TARGET_WEB = 24;
const MIN_TARGET_NATIVE = 44;
/**
 * RN `Animated.spring({ friction: 5, tension: 200 })`, converted to the
 * stiffness/damping model reanimated uses — the same bouncy "pop" as before.
 */
const MARK_SPRING = { stiffness: 809, damping: 16, mass: 1 };

/** Box edge length: a fixed ratio of the control-size icon, so it scales with the theme. */
export const getCheckboxBoxSize = (theme: PlatformBlocksTheme, size: SizeValue | undefined): number =>
  Math.round(getControlSize(theme, size).iconSize * 1.5);

type Glyph = 'check' | 'minus';

interface CheckboxBoxProps {
  active: boolean;
  glyph: Glyph;
  boxSize: number;
  radius: number;
  borderColor: string;
  backgroundColor: string;
  fillColor: string;
  glyphColor: string;
  disabled: boolean;
  size: SizeValue;
  icon?: React.ReactNode;
  indeterminateIcon?: React.ReactNode;
  transitionDuration?: number;
}

/**
 * The drawn box: a colored fill that rises from the bottom, then the mark
 * growing in from the center; reversed on uncheck. Runs on reanimated, so the
 * two phases never wait on the JS thread.
 */
const CheckboxBox = ({
  active,
  glyph,
  boxSize,
  radius,
  borderColor,
  backgroundColor,
  fillColor,
  glyphColor,
  disabled,
  size,
  icon,
  indeterminateIcon,
  transitionDuration,
}: CheckboxBoxProps) => {
  const interior = boxSize - BORDER_WIDTH * 2;
  const fill = useSharedValue(active ? 1 : 0);
  const mark = useSharedValue(active ? 1 : 0);
  // Keep the last-shown glyph mounted while it animates out, so "off" reverses
  // the "on" motion instead of the mark just disappearing.
  const [shownGlyph, setShownGlyph] = useState<Glyph | null>(active ? glyph : null);
  const motionDuration = useTransitionDuration(transitionDuration, CHECKBOX_BASE_DURATION);
  // A spring can't honor an explicit duration, so an explicit one opts into timing.
  const springMark = transitionDuration == null;

  const hideGlyph = useCallback(() => setShownGlyph(null), []);

  useEffect(() => {
    cancelAnimation(fill);
    cancelAnimation(mark);
    // `transitionDuration={0}` (and reduced motion) land on the end state at once.
    if (motionDuration === 0) {
      fill.value = active ? 1 : 0;
      mark.value = active ? 1 : 0;
      setShownGlyph(active ? glyph : null);
      return;
    }
    const scale = motionDuration / CHECKBOX_BASE_DURATION;
    const ms = (base: number) => Math.round(base * scale);
    if (active) {
      setShownGlyph(glyph);
      // The fill rises; the mark starts growing just before it lands so the two
      // phases overlap slightly instead of running strictly back-to-back.
      fill.value = withTiming(1, { duration: ms(160) });
      mark.value = withDelay(
        ms(110),
        springMark ? withSpring(1, MARK_SPRING) : withTiming(1, { duration: ms(160) })
      );
    } else {
      // The mark shrinks; the fill starts sliding down before it's fully gone.
      mark.value = withTiming(0, { duration: ms(100) });
      fill.value = withDelay(
        ms(60),
        withTiming(0, { duration: ms(150) }, (finished) => {
          if (finished) runOnJS(hideGlyph)();
        })
      );
    }
  }, [active, glyph, motionDuration, springMark, fill, mark, hideGlyph]);

  const fillStyle = useAnimatedStyle(() => ({ height: fill.value * interior }), [interior]);
  const markStyle = useAnimatedStyle(
    () => ({ opacity: mark.value, transform: [{ scale: 0.9 + 0.25 * mark.value }] }),
    []
  );

  const styles = useThemedStyles(
    () => ({
      box: {
        width: boxSize,
        height: boxSize,
        borderRadius: radius,
        borderWidth: BORDER_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // The Pressable around it takes the presses.
        pointerEvents: 'none',
      } as ViewStyle,
      fill: { position: 'absolute', left: 0, right: 0, bottom: 0 } as ViewStyle,
    }),
    [boxSize, radius]
  );

  const custom = shownGlyph === 'minus' ? indeterminateIcon : icon;

  return (
    <View style={[styles.box, { borderColor, backgroundColor, opacity: disabled ? 0.6 : 1 }]}>
      <Animated.View style={[styles.fill, { backgroundColor: fillColor }, fillStyle]} />
      {shownGlyph ? (
        <Animated.View style={markStyle}>
          {custom ?? <Icon name={shownGlyph} size={size} stroke={5} color={glyphColor} decorative />}
        </Animated.View>
      ) : null}
    </View>
  );
};

/**
 * A two-state (or mixed) choice. The box is the one focusable control —
 * `role="checkbox"` with `aria-checked` (`"mixed"` when indeterminate) — and
 * the label beside it is a press target for the same control, linked to it
 * through `aria-labelledby`, like an HTML `<label>`. Space toggles it on web.
 */
export const Checkbox = factory<{ props: CheckboxProps; ref: View }>((props, ref) => {
  const {
    checked,
    defaultChecked = false,
    onChange,
    indeterminate = false,
    color,
    size = 'md',
    radius,
    label,
    children,
    description,
    error,
    helperText,
    disabled = false,
    readOnly = false,
    required = false,
    withAsterisk,
    icon,
    indeterminateIcon,
    labelPosition = 'right',
    labelProps,
    descriptionProps,
    transitionDuration,
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
    setChecked((previous) => (indeterminate ? true : !previous));
  }, [locked, indeterminate, setChecked]);

  // Space is the checkbox key; react-native-web's Pressable only presses on Enter
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

  // Like an HTML <label>: a press on the label toggles the box and moves focus to it.
  const handleLabelPress = useCallback(() => {
    toggle();
    if (isWeb) focusNode(controlRef.current);
  }, [toggle]);

  const active = isChecked || indeterminate;
  const invalid = !!error;
  const boxSize = getCheckboxBoxSize(theme, size);
  const boxRadius = radius !== undefined ? resolveRadius(theme, radius) : Math.round(boxSize / 6);
  const accent = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
  const fillColor = disabled ? theme.text.disabled : accent;
  const glyphColor = disabled ? theme.backgrounds.surface : onColor(theme, accent, 3);
  const borderColor = disabled
    ? theme.backgrounds.borderStrong
    : invalid
      ? theme.colors.error[5]
      : active
        ? accent
        : // A control boundary needs 3:1 against the surface; `text.muted` has it, `border` doesn't.
          theme.text.muted;
  const backgroundColor = disabled ? theme.backgrounds.disabled : theme.backgrounds.surface;

  const box = (
    <CheckboxBox
      active={active}
      glyph={indeterminate ? 'minus' : 'check'}
      boxSize={boxSize}
      radius={boxRadius}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      fillColor={fillColor}
      glyphColor={glyphColor}
      disabled={disabled}
      size={size}
      icon={icon}
      indeterminateIcon={indeterminateIcon}
      transitionDuration={transitionDuration}
    />
  );

  if (!decorative && !accessibilityLabel && !getNodeText(children ?? label)) {
    warnOnce(
      'Checkbox.accessibilityLabel',
      '[Checkbox] A checkbox without a visible label needs `accessibilityLabel` so it has an accessible name.'
    );
  }

  // Inside a ControlField row the row is the control; this is only its picture.
  if (decorative) return box;

  // Small boxes get padding up to the minimum web target; native uses hitSlop.
  const webPad = isWeb ? Math.max(0, Math.ceil((MIN_TARGET_WEB - boxSize) / 2)) : 0;
  const hitSlop = isWeb ? undefined : Math.max(0, Math.ceil((MIN_TARGET_NATIVE - boxSize) / 2));

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
      footerInset={boxSize + webPad * 2 + LABEL_GAP}
      disclaimer={disclaimer}
      disclaimerProps={disclaimerProps}
      style={[spacingStyles, layoutStyles, style]}
    >
      {({ controlProps }) => (
        <Pressable
          ref={mergedRef}
          {...controlProps}
          {...a11yProps({ role: 'checkbox', checked: indeterminate ? 'mixed' : isChecked })}
          {...webProps({ onKeyDown: locked ? undefined : handleKeyDown })}
          onPress={toggle}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          hitSlop={hitSlop}
          testID={testID}
          style={webPad ? { padding: webPad } : undefined}
        >
          {box}
        </Pressable>
      )}
    </ChoiceField>
  );
}, { displayName: 'Checkbox' });

Checkbox.displayName = 'Checkbox';
