import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, View, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { consumeEvent, focusNode, readKey, type KeyboardEventLike } from '../../core/accessibility/keyboard';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { factory } from '../../core/factory';
import { createThemedStyles, useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isWeb, webProps, type WebKeyboardEvent } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { composite } from '../../core/theme/colorUtils';
import { literalBackgrounds, literalText } from '../../core/theme/cssVariableTheme';
import { resolveColorProp } from '../../core/theme/resolveColors';
import { getControlSize, onColor, resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeValue } from '../../core/theme/types';
import { getLayoutStyles } from '../../core/utils/layout';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { warnOnce } from '../../core/utils/logger';
import { useControllableState } from '../../hooks/useControllableState';
import { ChoiceField, useIsChoiceIndicator } from '../Checkbox/ChoiceField';
import { Disclaimer } from '../_internal/Disclaimer/Disclaimer';
import { Field } from '../_internal/Field/Field';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { useGroupFocus } from '../Checkbox/useGroupFocus';
import type { RadioGroupOption, RadioGroupProps, RadioGroupVariant, RadioProps } from './types';

/** Length of the default select animation; the deselect phase scales against it. */
const RADIO_BASE_DURATION = 160;
/**
 * Ring thickness of an unselected radio. Hairline — an off radio should read as
 * an outline, not as a donut competing with the selected state.
 */
const RING_WIDTH = 1;
const LABEL_GAP = 8;
const MIN_TARGET_WEB = 24;
const MIN_TARGET_NATIVE = 44;
/** The accent sits one step past the fill base so the ring reads against the dot. */
const RADIO_SHADES = [6, 5] as const;
/** How strongly a selected card is washed with the accent. */
const CARD_TINT_ALPHA = 0.14;

/** Diameter of the radio: a fixed ratio of the control-size icon, so it follows the theme. */
export const getRadioSize = (theme: PlocksTheme, size: SizeValue | undefined): number =>
  Math.round(getControlSize(theme, size).iconSize * 1.5);

export interface RadioPalette {
  /** Track color while unselected — only its rim shows, so this is the ring. */
  ringColor: string;
  /** Track color once selected, when the whole disc shows. */
  fillColor: string;
  /** Hole color while unselected — matches the surface so the center reads as empty. */
  holeColor: string;
  /** Hole color once selected, when all that is left of it is the dot. */
  dotColor: string;
}

/**
 * The radio's four colors. All literal — they are endpoints of a color
 * interpolation, and on web the semantic tokens are `var()` references with no
 * channels to interpolate.
 */
export function getRadioPalette(
  theme: PlocksTheme,
  { disabled, error, color }: { disabled: boolean; error: boolean; color?: string }
): RadioPalette {
  const text = literalText(theme);
  const backgrounds = literalBackgrounds(theme);
  const accent = resolveColorProp(theme, color, { shades: RADIO_SHADES }) ?? theme.colors.primary[6];
  const line = backgrounds.borderStrong ?? backgrounds.border;
  const errorColor = theme.colors.error[5];
  const fillColor = disabled ? line : error ? errorColor : accent;
  const holeColor = backgrounds.surface;
  return {
    // A control boundary needs 3:1 against the surface: `text.muted` has it.
    ringColor: disabled ? line : error ? errorColor : text.muted,
    fillColor,
    holeColor,
    // Light on the accent while it stays legible; dark themes take their accent
    // from the light end of the palette, where a light dot would vanish.
    dotColor: disabled ? holeColor : onColor(theme, fillColor, 3),
  };
}

interface RadioIndicatorProps {
  checked: boolean;
  disabled: boolean;
  error: boolean;
  size: SizeValue;
  color?: string;
  transitionDuration?: number;
}

/**
 * The radio circle: an opaque `track` disc filling the footprint with a `hole`
 * disc punched over it. Unselected, the hole covers all but a hairline rim, so
 * the control reads as a ring; selecting shrinks the hole to the dot and
 * recolors the track — one continuous motion on the UI thread (reanimated),
 * shared by `Radio` and the `card` variant of `RadioGroup`.
 */
const RadioIndicator = ({ checked, disabled, error, size, color, transitionDuration }: RadioIndicatorProps) => {
  const theme = useTheme();
  const radioSize = getRadioSize(theme, size);
  // The dot sits at ~40% of the control — the ratio most design systems land on.
  const dotSize = Math.max(Math.round(radioSize * 0.4), 4);
  const holeSize = radioSize - RING_WIDTH * 2;
  const dotScale = dotSize / holeSize;

  const { ringColor, fillColor, holeColor, dotColor } = getRadioPalette(theme, { disabled, error, color });

  const progress = useSharedValue(checked ? 1 : 0);
  const duration = useTransitionDuration(transitionDuration, RADIO_BASE_DURATION);

  useEffect(() => {
    const target = checked ? 1 : 0;
    cancelAnimation(progress);
    // `transitionDuration={0}` (and reduced motion) land on the end state at once.
    if (duration === 0) {
      progress.value = target;
      return;
    }
    // Deselecting is quicker than selecting — it is the incidental half of a
    // group change; the newly selected radio is what should draw the eye.
    progress.value = withTiming(target, {
      duration: Math.round(duration * (checked ? 1 : 0.7)),
      easing: Easing.out(Easing.cubic),
    });
  }, [checked, duration, progress]);

  const trackStyle = useAnimatedStyle(
    () => ({ backgroundColor: interpolateColor(progress.value, [0, 1], [ringColor, fillColor]) }),
    [ringColor, fillColor]
  );
  const holeStyle = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(progress.value, [0, 1], [holeColor, dotColor]),
      transform: [{ scale: 1 + (dotScale - 1) * progress.value }],
    }),
    [holeColor, dotColor, dotScale]
  );

  const styles = useThemedStyles(
    () => ({
      radio: {
        width: radioSize,
        height: radioSize,
        borderRadius: radioSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: 'none',
      } as ViewStyle,
      track: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: radioSize / 2 } as ViewStyle,
      hole: { width: holeSize, height: holeSize, borderRadius: holeSize / 2 } as ViewStyle,
    }),
    [radioSize, holeSize, disabled]
  );

  return (
    <View style={styles.radio}>
      <Animated.View style={[styles.track, trackStyle]} />
      <Animated.View style={[styles.hole, holeStyle]} />
    </View>
  );
};

const isSpaceKey = (event: KeyboardEventLike) => {
  const { key } = readKey(event);
  return key === ' ' || key === 'Spacebar';
};

/** An icon prop: registry name → `<Icon>`, element → as is. */
const renderOptionIcon = (icon: React.ReactNode | string | undefined, size: number, color: string | undefined) => {
  if (icon == null || icon === false) return null;
  if (typeof icon === 'string') return <Icon name={icon} size={size} color={color} decorative />;
  return React.isValidElement(icon) ? icon : null;
};

/**
 * One option of a set. `role="radio"` with `aria-checked`; the label beside it
 * picks it too (one tab stop). Space picks it on web. Usually rendered by
 * `RadioGroup`, which manages selection and arrow-key navigation.
 */
export const Radio = factory<{ props: RadioProps; ref: View }>((props, ref) => {
  const {
    value,
    checked = false,
    onChange,
    size = 'md',
    color = 'primary',
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
    icon,
    onKeyDown,
    tabIndex,
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

  const locked = disabled || readOnly;
  const select = useCallback(() => {
    if (locked) return;
    onChange?.(value);
  }, [locked, onChange, value]);

  const handleKeyDown = useCallback(
    (event: WebKeyboardEvent) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !isSpaceKey(event)) return;
      // Space picks the focused radio; react-native-web's Pressable only presses
      // on Enter for non-button roles.
      consumeEvent(event);
      select();
    },
    [onKeyDown, select]
  );

  const handleLabelPress = useCallback(() => {
    select();
    if (isWeb) focusNode(controlRef.current);
  }, [select]);

  const indicator = (
    <RadioIndicator
      checked={checked}
      disabled={disabled}
      error={!!error}
      size={size}
      color={color}
      transitionDuration={transitionDuration}
    />
  );

  if (!decorative && !accessibilityLabel && !getNodeText(children ?? label)) {
    warnOnce(
      'Radio.accessibilityLabel',
      '[Radio] A radio without a visible label needs `accessibilityLabel` so it has an accessible name.'
    );
  }

  // Inside a ControlField row the row is the control; this is only its picture.
  if (decorative) return indicator;

  const radioSize = getRadioSize(theme, size);
  const iconSize = getControlSize(theme, size).iconSize;
  const adornment = renderOptionIcon(icon, iconSize, disabled ? theme.text.disabled : theme.text.primary);
  const webPad = isWeb ? Math.max(0, Math.ceil((MIN_TARGET_WEB - radioSize) / 2)) : 0;
  const hitSlop = isWeb ? undefined : Math.max(0, Math.ceil((MIN_TARGET_NATIVE - radioSize) / 2));

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
      labelAdornment={adornment}
      gap={LABEL_GAP}
      footerInset={radioSize + webPad * 2 + LABEL_GAP}
      disclaimer={disclaimer}
      disclaimerProps={disclaimerProps}
      style={[spacingStyles, layoutStyles, style]}
    >
      {({ controlProps }) => (
        <Pressable
          ref={mergedRef}
          {...controlProps}
          {...a11yProps({ role: 'radio', checked })}
          {...webProps({ onKeyDown: handleKeyDown, tabIndex })}
          onPress={select}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          hitSlop={hitSlop}
          testID={testID}
          style={webPad ? { padding: webPad } : undefined}
        >
          {indicator}
        </Pressable>
      )}
    </ChoiceField>
  );
}, { displayName: 'Radio' });

Radio.displayName = 'Radio';

interface VariantStyles {
  option: ViewStyle;
  first: ViewStyle;
  last: ViewStyle;
  disabled: ViewStyle;
  iconCard: ViewStyle;
  body: ViewStyle;
  description: TextStyle;
}

/** Static layout of the button-like variants, cached per theme / variant / orientation. */
const getVariantStyles = createThemedStyles(
  (theme: PlocksTheme, variant: RadioGroupVariant, horizontal: boolean): VariantStyles => ({
    option:
      variant === 'card'
        ? {
            flex: horizontal ? 1 : undefined,
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10,
          }
        : variant === 'segmented'
          ? {
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderEndWidth: 1,
              borderStartWidth: 0,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 6,
            }
          : {
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            },
    // Segmented: logical corners so the joined bar follows the reading direction.
    first: { borderStartWidth: 1, borderTopStartRadius: 8, borderBottomStartRadius: 8 },
    last: { borderTopEndRadius: 8, borderBottomEndRadius: 8 },
    disabled: { opacity: 0.5 },
    iconCard: { marginTop: 2 },
    body: variant === 'card' ? { flex: 1 } : {},
    description: { color: theme.text.secondary, marginTop: 2 },
  })
);

/** Colors of the button-like variants for one accent, cached per theme / color. */
const getVariantColors = createThemedStyles((theme: PlocksTheme, color: string) => {
  const accent = resolveColorProp(theme, color, { shades: RADIO_SHADES }) ?? theme.colors.primary[6];
  // The wash mixes two colors; on web `backgrounds.surface` is a `var()` reference
  // with no measurable channels, so the math reads the literal.
  const literalSurface = literalBackgrounds(theme).surface;
  return {
    accent,
    // Washing the accent over the actual surface rather than reaching for an end
    // of the palette: dark palettes run dark→light, so "the subtlest shade" would
    // land on a near-white and turn a selected card into a bright block.
    tint: composite(accent, literalSurface, CARD_TINT_ALPHA),
    onAccent: onColor(theme, accent),
    surface: theme.backgrounds.surface,
    border: theme.backgrounds.border,
  };
});

/**
 * A set of mutually exclusive options: `role="radiogroup"` rendered through the
 * shared `Field` frame (label, description, error and helper text linked to the
 * group). Arrow keys move focus *and* selection between the options (following
 * the reading direction), with one tab stop for the whole group — the selected
 * option, or the first one while nothing is selected.
 */
export const RadioGroup = factory<{ props: RadioGroupProps; ref: View }>((props, ref) => {
  const {
    options,
    value,
    defaultValue,
    onChange,
    orientation = 'vertical',
    variant = 'default',
    size = 'md',
    color = 'primary',
    label,
    description,
    error,
    helperText,
    disabled = false,
    readOnly = false,
    required = false,
    withAsterisk,
    gap = 8,
    labelPosition,
    transitionDuration,
    accessibilityLabel,
    accessibilityHint,
    labelProps,
    descriptionProps,
    id,
    testID,
    style,
    disclaimer,
    disclaimerProps,
    onFocus,
    onBlur,
  } = props;

  const theme = useTheme();
  const spacingStyles = useStyleProps(props);
  const layoutStyles = getLayoutStyles(props);
  const groupFocus = useGroupFocus(onFocus, onBlur);

  const [selected, setSelected] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    finalValue: null,
    onChange: (next) => {
      if (next != null) onChange?.(next);
    },
  });

  // Picking an option can arrive twice for one gesture (focus, then press), so
  // compare against the latest value rather than the render-time one.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const commit = useCallback(
    (next: string) => {
      if (disabled || readOnly || next === selectedRef.current) return;
      selectedRef.current = next;
      setSelected(next);
    },
    [disabled, readOnly, setSelected]
  );

  const isOptionDisabled = useCallback((index: number) => disabled || !!options[index]?.disabled, [disabled, options]);
  const selectedIndex = options.findIndex((option) => option.value === selected);

  const roving = useRovingFocus({
    count: options.length,
    // Radio groups answer to all four arrows; horizontal ones follow the reading direction.
    orientation: 'both',
    loop: true,
    activeIndex: selectedIndex >= 0 ? selectedIndex : undefined,
    onActiveChange: (index) => {
      const option = options[index];
      if (option) commit(option.value);
    },
    isDisabled: isOptionDisabled,
  });

  // `segmented` is always horizontal (joined buttons); `chip` wraps.
  const horizontal = variant === 'segmented' || (variant !== 'chip' && orientation === 'horizontal');
  const gapValue = typeof gap === 'number' ? gap : (resolveSpacing(theme, gap) as number);
  const groupStyle = useMemo<ViewStyle>(
    () =>
      variant === 'chip'
        ? { flexDirection: 'row', flexWrap: 'wrap', gap: gapValue }
        : variant === 'segmented'
          ? { flexDirection: 'row' }
          : { flexDirection: horizontal ? 'row' : 'column', gap: gapValue },
    [variant, horizontal, gapValue]
  );

  const iconSize = getControlSize(theme, size).iconSize;
  const variantStyles = variant === 'default' ? null : getVariantStyles(theme, variant, horizontal);
  const variantColors = variant === 'default' ? null : getVariantColors(theme, String(color));
  const optionId = (index: number) => (id ? `${id}-option-${index}` : undefined);
  const optionTestID = (index: number) => (testID ? `${testID}-option-${index}` : undefined);

  const renderOptionButton = (option: RadioGroupOption, index: number) => {
    // Only reached for the non-default variants.
    if (!variantStyles || !variantColors) return null;
    const isSelected = selectedIndex === index;
    const optionDisabled = isOptionDisabled(index);
    const { accent, tint, onAccent, surface, border } = variantColors;
    const filled = variant === 'chip' || variant === 'segmented';
    // `chip` and `segmented` fill with the accent, so their label sits on it;
    // `card` only tints, and keeps the accent itself as the label color.
    const textColor = isSelected
      ? filled
        ? onAccent
        : accent
      : optionDisabled
        ? theme.text.disabled
        : theme.text.primary;
    const item = roving.getItemProps(index);

    return (
      <Pressable
        key={option.value}
        ref={item.ref}
        onPress={() => commit(option.value)}
        onFocus={() => {
          item.onFocus();
          groupFocus.onPartFocus();
        }}
        onBlur={groupFocus.onPartBlur}
        disabled={optionDisabled}
        {...a11yProps({
          role: 'radio',
          checked: isSelected,
          label: typeof option.label === 'string' ? option.label : undefined,
          id: optionId(index),
        })}
        {...webProps({
          tabIndex: item.tabIndex,
          onKeyDown: (event) => {
            item.onKeyDown(event);
            if (event.defaultPrevented || !isSpaceKey(event)) return;
            consumeEvent(event);
            commit(option.value);
          },
        })}
        testID={optionTestID(index)}
        style={[
          variantStyles.option,
          {
            borderColor: isSelected ? accent : border,
            backgroundColor: isSelected ? (filled ? accent : tint) : variant === 'card' ? surface : 'transparent',
          },
          variant === 'segmented' && index === 0 && variantStyles.first,
          variant === 'segmented' && index === options.length - 1 && variantStyles.last,
          optionDisabled && variantStyles.disabled,
        ]}
      >
        {option.icon ? (
          <View style={variant === 'card' ? variantStyles.iconCard : undefined}>
            {renderOptionIcon(option.icon, iconSize, textColor)}
          </View>
        ) : null}

        <View style={variantStyles.body}>
          <Text
            size={size}
            style={{ color: textColor, fontWeight: isSelected && variant !== 'card' ? '600' : '400' }}
            selectable={false}
          >
            {option.label}
          </Text>
          {variant === 'card' && option.description ? (
            <Text size="sm" style={variantStyles.description} selectable={false}>
              {option.description}
            </Text>
          ) : null}
        </View>

        {variant === 'card' ? (
          // The same circle the `default` variant uses, so selection reads the
          // same across variants; always rendered so the card doesn't reflow.
          <View style={variantStyles.iconCard}>
            <RadioIndicator
              checked={isSelected}
              disabled={optionDisabled}
              // A group-level error doesn't recolor the controls — the message carries it.
              error={false}
              size={size}
              color={color}
              transitionDuration={transitionDuration}
            />
          </View>
        ) : null}
      </Pressable>
    );
  };

  return (
    <Field
      id={id}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      size={size}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      style={[spacingStyles, layoutStyles, style]}
      testID={testID}
    >
      {({ controlProps }) => (
        <>
          <View
            ref={ref}
            {...controlProps}
            {...a11yProps({ role: 'radiogroup', orientation: horizontal ? 'horizontal' : 'vertical' })}
            style={groupStyle}
          >
            {variant === 'default'
              ? options.map((option, index) => {
                  const item = roving.getItemProps(index);
                  return (
                    <Radio
                      key={option.value}
                      ref={item.ref}
                      id={optionId(index)}
                      value={option.value}
                      checked={selectedIndex === index}
                      onChange={commit}
                      tabIndex={item.tabIndex}
                      onKeyDown={item.onKeyDown}
                      onFocus={() => {
                        item.onFocus();
                        groupFocus.onPartFocus();
                      }}
                      onBlur={groupFocus.onPartBlur}
                      size={size}
                      color={color}
                      label={option.label}
                      description={option.description}
                      icon={option.icon}
                      disabled={isOptionDisabled(index)}
                      readOnly={readOnly}
                      labelPosition={labelPosition}
                      transitionDuration={transitionDuration}
                      testID={optionTestID(index)}
                    />
                  );
                })
              : options.map(renderOptionButton)}
          </View>
          {disclaimer ? <Disclaimer {...disclaimerProps}>{disclaimer}</Disclaimer> : null}
        </>
      )}
    </Field>
  );
}, { displayName: 'RadioGroup' });

RadioGroup.displayName = 'RadioGroup';
