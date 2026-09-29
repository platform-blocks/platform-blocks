import React, { useCallback, useMemo, useState } from 'react';
import { View, type PointerEvent as RNPointerEvent, type ViewStyle } from 'react-native';

import { a11yProps, type A11yProps } from '../../core/accessibility/a11yProps';
import { consumeEvent, readKey } from '../../core/accessibility/keyboard';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useAdjustable } from '../../core/accessibility/useAdjustable';
import { factory } from '../../core/factory';
import { useDragGesture } from '../../core/gestures/useDragGesture';
import { isWeb, webProps, type WebKeyboardEvent } from '../../core/platform';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveIconSize } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { getLayoutStyles } from '../../core/utils/layout';
import { warnOnce } from '../../core/utils/logger';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { ChoiceField, type ChoiceLabelPosition } from '../Checkbox/ChoiceField';
import { Icon } from '../Icon';
import type { ExternalIconComponent } from '../Icon/types';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import type { RatingFactoryPayload, RatingIcon, RatingProps } from './types';

// Non-breaking spaces around the slash: the tooltip bubble is anchored to a
// single star, so a narrow computed width would otherwise break "2 / 5" across
// two lines at the ordinary spaces.
const VALUE_SEPARATOR = ' / ';

// The default `character`/`emptyCharacter` values are sentinels for "no custom
// glyph was passed" — they render the built-in star icon rather than the raw
// text character, which is what the component has always drawn.
const DEFAULT_CHARACTER = '★';
const DEFAULT_EMPTY_CHARACTER = '☆';

const LABEL_POSITION: Record<NonNullable<RatingProps['labelPosition']>, ChoiceLabelPosition> = {
  above: 'top',
  below: 'bottom',
  left: 'left',
  right: 'right',
};

/** A DOM node's box (react-native-web host refs are DOM elements). */
interface MeasurableNode {
  getBoundingClientRect?: () => { left: number; width: number };
}

/** Pointer x relative to the row's left edge, from a web pointer event. */
const pointerOffsetX = (event: RNPointerEvent, node: MeasurableNode | null): number => {
  const native = event.nativeEvent;
  const rect = node?.getBoundingClientRect?.();
  if (rect && typeof native.clientX === 'number' && !Number.isNaN(native.clientX)) {
    return native.clientX - rect.left;
  }
  if (typeof native.offsetX === 'number' && !Number.isNaN(native.offsetX)) return native.offsetX;
  return 0;
};

const decimalsOf = (step: number) => (String(step).split('.')[1] || '').length;

/**
 * A star rating. Interactive ratings are one `role="slider"` control (native:
 * adjustable) over the row of items — arrows / PageUp / PageDown / Home / End,
 * digits for an exact value, Backspace / Delete to clear, plus increment and
 * decrement actions for VoiceOver / TalkBack. `readOnly` ratings are a
 * labelled image ("4 out of 5").
 */
function RatingBase(props: RatingProps, ref: React.Ref<View>) {
  const {
    value: controlledValue,
    defaultValue = 0,
    count = 5,
    readOnly = false,
    disabled = false,
    allowFraction = false,
    precision = allowFraction ? 0.1 : 1,
    size = 'md',
    color,
    emptyColor,
    hoverColor,
    onChange,
    onHover,
    clearable = false,
    required = false,
    withAsterisk,
    error,
    description,
    helperText,
    showTooltip = false,
    getTooltipLabel,
    icon,
    emptyIcon,
    character = DEFAULT_CHARACTER,
    emptyCharacter = DEFAULT_EMPTY_CHARACTER,
    gap = 'xs',
    style,
    testID,
    accessibilityLabel,
    accessibilityHint,
    label,
    labelPosition = 'above',
    labelGap = 'xs',
    labelProps,
    descriptionProps,
    onFocus,
    onBlur,
    id,
    disclaimer,
    disclaimerProps,
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyles = useStyleProps(props);
  const layoutStyles = getLayoutStyles(props);

  const actualPrecision = Math.max(0.01, Math.min(1, precision));
  // `readOnly` and `disabled` both lock input; only `disabled` dims the control.
  const inputLocked = readOnly || disabled;

  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  const [currentValue, setCurrentValue] = useControllableState<number>({
    value: controlledValue,
    defaultValue,
    finalValue: 0,
    onChange,
  });
  const displayValue = hoverValue ?? currentValue;

  const roundToPrecision = useCallback(
    (next: number) => {
      const rounded = Math.round(next / actualPrecision) * actualPrecision;
      // Take the decimal count from `precision` itself: deriving it from log10
      // truncates values a step can legitimately land on (0.25 → 0.3).
      return parseFloat(rounded.toFixed(decimalsOf(actualPrecision)));
    },
    [actualPrecision]
  );

  const commitValue = useCallback(
    (next: number) => {
      if (inputLocked) return;
      setCurrentValue(roundToPrecision(Math.min(count, Math.max(0, next))));
    },
    [inputLocked, count, roundToPrecision, setCurrentValue]
  );

  // Keyboard and assistive-technology adjustments move by the same increment the
  // pointer can produce: a whole item, or `precision` when fractions are allowed.
  const keyboardStep = allowFraction ? actualPrecision : 1;
  const formatValue = useCallback(
    (next: number) => (allowFraction ? String(roundToPrecision(next)) : String(Math.round(next))),
    [allowFraction, roundToPrecision]
  );

  const labelText = typeof label === 'string' ? label : getNodeText(label);
  if (!readOnly && !labelText && !accessibilityLabel) {
    warnOnce(
      'Rating.accessibilityLabel',
      '[Rating] An interactive rating needs an accessible name: pass `label` or `accessibilityLabel`.'
    );
  }

  const { adjustableProps, handleKeyDown } = useAdjustable({
    value: currentValue,
    min: 0,
    max: count,
    step: keyboardStep,
    largeStep: allowFraction ? 1 : Math.max(1, Math.round(count / 5)),
    onChange: commitValue,
    valueText: (next) => `${formatValue(next)} out of ${count}`,
    disabled,
    readOnly,
    rtl: isRTL,
  });

  const onKeyDown = useCallback(
    (event: WebKeyboardEvent) => {
      if (inputLocked) return;
      const { key } = readKey(event);
      if (key === 'Backspace' || key === 'Delete') {
        consumeEvent(event);
        commitValue(0);
        return;
      }
      if (/^[0-9]$/.test(key)) {
        // Digits are a shortcut to an exact value; ones out of range are ignored.
        const digit = Number(key);
        if (digit > count) return;
        consumeEvent(event);
        commitValue(digit);
        return;
      }
      handleKeyDown(event);
    },
    [inputLocked, commitValue, count, handleKeyDown]
  );

  const filledColor = color || theme.colors.warning[5];
  const unfilledColor = emptyColor || theme.text.muted;
  const highlightColor = hoverColor || theme.colors.warning[6];

  const iconSize = resolveIconSize(theme, size);
  const gapSize = typeof gap === 'number' ? gap : resolveIconSize(theme, gap) / 2;
  const labelGapSize = typeof labelGap === 'number' ? labelGap : resolveIconSize(theme, labelGap) / 2;
  const totalWidth = count * iconSize + (count - 1) * gapSize;

  const tooltipDecimalPlaces = useMemo(() => {
    if (!allowFraction) return 0;
    let decimals = 0;
    let candidate = actualPrecision;
    while (candidate < 1 && decimals < 6) {
      candidate *= 10;
      decimals += 1;
      if (Math.abs(Math.round(candidate) - candidate) < 1e-6) break;
    }
    return decimals;
  }, [allowFraction, actualPrecision]);

  const tooltipNumberFormatter = useMemo(() => {
    if (!showTooltip || !allowFraction) return null;
    const decimals = Math.min(tooltipDecimalPlaces, 6);
    try {
      return new Intl.NumberFormat(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    } catch {
      return null;
    }
  }, [showTooltip, allowFraction, tooltipDecimalPlaces]);

  const tooltipValue = !showTooltip ? null : hoverValue !== null ? hoverValue : tooltipIndex !== null ? currentValue : null;

  const tooltipLabel = useMemo(() => {
    if (tooltipValue === null) return '';
    const clampedValue = Math.max(0, Math.min(tooltipValue, count));
    if (!allowFraction) {
      const integerValue = Math.round(clampedValue);
      return getTooltipLabel ? getTooltipLabel(integerValue, count) : `${integerValue}${VALUE_SEPARATOR}${count}`;
    }
    const normalizedValue = roundToPrecision(clampedValue);
    if (getTooltipLabel) return getTooltipLabel(normalizedValue, count);
    const formatted = tooltipNumberFormatter
      ? tooltipNumberFormatter.format(normalizedValue)
      : normalizedValue.toFixed(Math.min(tooltipDecimalPlaces, 6));
    return `${formatted}${VALUE_SEPARATOR}${count}`;
  }, [tooltipValue, count, allowFraction, roundToPrecision, getTooltipLabel, tooltipNumberFormatter, tooltipDecimalPlaces]);

  // What a single item draws for a given fill state. `icon`/`emptyIcon` win over
  // `character`/`emptyCharacter`, and `emptyIcon` falls back to `icon` so one
  // custom icon covers both states (drawn in `emptyColor` when empty).
  const renderGlyph = useCallback(
    (filled: boolean, glyphColor: string) => {
      const iconSource: RatingIcon | undefined = filled ? icon : emptyIcon ?? icon;
      const value: RatingIcon | React.ReactNode = iconSource ?? (filled ? character : emptyCharacter);
      const isIcon = iconSource != null;

      // Elements are cloned rather than wrapped so icon libraries pick up the
      // resolved size and the current fill color.
      if (React.isValidElement<{ size?: number; color?: string }>(value)) {
        return React.cloneElement(value, { size: iconSize, color: glyphColor });
      }
      if (typeof value === 'string') {
        // Strings from `icon`/`emptyIcon` are registry names; the default star
        // characters keep rendering the built-in icon, and any other character
        // renders as literal text.
        if (isIcon) return <Icon name={value} size={iconSize} color={glyphColor} variant="filled" />;
        if (value === DEFAULT_CHARACTER || value === DEFAULT_EMPTY_CHARACTER) {
          return <Icon name="star" size={iconSize} color={glyphColor} variant="filled" />;
        }
        return (
          <Text style={{ fontSize: iconSize, lineHeight: iconSize * 1.15, color: glyphColor, textAlign: 'center' }}>
            {value}
          </Text>
        );
      }
      if (typeof value === 'function') {
        return <Icon icon={value as ExternalIconComponent} size={iconSize} color={glyphColor} />;
      }
      // Any remaining node (fragments, arbitrary children) renders untouched.
      if (value != null && typeof value !== 'boolean') return <>{value}</>;
      return <Icon name="star" size={iconSize} color={glyphColor} variant="filled" />;
    },
    [icon, emptyIcon, character, emptyCharacter, iconSize]
  );

  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, starIndex) => {
        const starValue = starIndex + 1;
        const fractionalPart = displayValue - starIndex;
        const isFilled = displayValue >= starValue;
        // Partial fill follows the value itself: `allowFraction` governs what a
        // user can set, not what a read-only `value={4.5}` may display.
        const isPartiallyFilled = fractionalPart > 0 && fractionalPart < 1;
        const isHovered = hoverValue !== null && hoverValue >= starIndex + actualPrecision;
        const activeFillColor = hoverValue !== null ? highlightColor : filledColor;
        const starColor = isHovered || isFilled || isPartiallyFilled ? activeFillColor : unfilledColor;

        // Partial fill stacks a clipped filled glyph over the empty one, so it
        // works the same for stars, custom icons and text characters. The clip is
        // anchored to the start edge the value grows from — logical, so it
        // follows the row under RTL.
        const baseStar = isPartiallyFilled ? (
          <View style={{ position: 'relative' }}>
            {renderGlyph(false, unfilledColor)}
            <View
              style={{
                position: 'absolute',
                start: 0,
                top: 0,
                width: iconSize * fractionalPart,
                height: iconSize,
                overflow: 'hidden',
                alignItems: 'flex-start',
              }}
            >
              {renderGlyph(true, activeFillColor)}
            </View>
          </View>
        ) : (
          renderGlyph(isFilled || isHovered, starColor)
        );

        return (
          // `marginEnd` so the trailing item stays flush with the row end in both directions.
          <View key={starIndex} style={{ marginEnd: starIndex < count - 1 ? gapSize : 0 }}>
            {showTooltip ? (
              <Tooltip
                label={tooltipLabel}
                position="top"
                opened={tooltipIndex === starIndex && tooltipLabel.length > 0}
                events={{ hover: false, focus: false, touch: false }}
              >
                {baseStar}
              </Tooltip>
            ) : (
              baseStar
            )}
          </View>
        );
      }),
    [
      count,
      displayValue,
      hoverValue,
      actualPrecision,
      highlightColor,
      filledColor,
      unfilledColor,
      renderGlyph,
      iconSize,
      gapSize,
      showTooltip,
      tooltipIndex,
      tooltipLabel,
    ]
  );

  const resolveValueDetails = useCallback(
    (x: number, widthOverride?: number) => {
      const width = widthOverride && widthOverride > 0 ? widthOverride : totalWidth;
      const clampedX = Math.max(0, Math.min(width, x));
      // Pointer offsets are measured from the physical left edge, while an RTL
      // row renders the first item on the right — mirror before mapping.
      const distanceFromStart = isRTL ? width - clampedX : clampedX;
      const rawUnits = width > 0 ? (distanceFromStart / width) * count : 0;
      const ratingValue = allowFraction
        ? roundToPrecision(rawUnits)
        : Math.min(count, Math.max(1, Math.ceil(rawUnits)));
      return { ratingValue, rawUnits };
    },
    [totalWidth, count, allowFraction, roundToPrecision, isRTL]
  );

  const resolveTooltipIndex = useCallback(
    (rawUnits: number) => {
      if (!showTooltip || Number.isNaN(rawUnits)) return null;
      return Math.max(0, Math.min(count - 1, Math.round(rawUnits - 0.5)));
    },
    [showTooltip, count]
  );

  const previewAt = useCallback(
    (x: number, width?: number) => {
      const { ratingValue, rawUnits } = resolveValueDetails(x, width);
      // Anchor the tooltip even when read-only — it reports the current value
      // and is a display affordance, not input.
      setTooltipIndex(resolveTooltipIndex(rawUnits));
      if (inputLocked) return;
      setHoverValue(ratingValue);
      onHover?.(ratingValue);
    },
    [resolveValueDetails, resolveTooltipIndex, inputLocked, onHover]
  );

  const commitAt = useCallback(
    (x: number, width?: number) => {
      if (inputLocked) return;
      const { ratingValue } = resolveValueDetails(x, width);
      // Selecting the value that is already set clears the rating when `clearable`.
      setCurrentValue(clearable && ratingValue === currentValue ? 0 : ratingValue);
    },
    [inputLocked, resolveValueDetails, setCurrentValue, clearable, currentValue]
  );

  const endPreview = useCallback(() => {
    setHoverValue(null);
    setTooltipIndex(null);
  }, []);

  // The shared drag surface: a press previews, a drag scrubs, the release commits.
  const drag = useDragGesture({
    enabled: !inputLocked,
    axis: 'both',
    cursor: inputLocked ? undefined : 'pointer',
    onStart: (point) => previewAt(point.x, point.width),
    onMove: (point) => previewAt(point.x, point.width),
    onEnd: (point) => {
      commitAt(point.x, point.width);
      endPreview();
    },
    onCancel: endPreview,
  });
  const rowRef = useMergedRef(drag.ref, ref);

  // Web hover preview (no press): follows the pointer across the row.
  const hoverProps = isWeb
    ? {
        onPointerMove: (event: RNPointerEvent) => {
          if (drag.isDragging) return;
          const node = drag.ref.current as unknown as MeasurableNode | null;
          previewAt(pointerOffsetX(event, node), node?.getBoundingClientRect?.().width);
        },
        onPointerLeave: () => {
          if (drag.isDragging) return;
          endPreview();
          if (!inputLocked) onHover?.(currentValue);
        },
      }
    : null;

  const controlA11y = (controlProps: A11yProps) =>
    readOnly
      ? {
          ...controlProps,
          // A display-only rating is a picture of its value.
          ...a11yProps({
            role: 'img',
            label: accessibilityLabel ?? [labelText, `${formatValue(currentValue)} out of ${count}`].filter(Boolean).join(': '),
          }),
          'aria-labelledby': undefined,
        }
      : {
          ...controlProps,
          ...adjustableProps,
          ...webProps({ onKeyDown }),
        };

  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: 4,
    opacity: disabled ? 0.5 : 1,
    alignSelf: 'flex-start',
  };

  return (
    <ChoiceField
      // Rating's label names the whole field, like any other field label.
      choice={false}
      id={id}
      label={label}
      description={description}
      error={error}
      helperText={helperText}
      required={required}
      withAsterisk={withAsterisk}
      disabled={disabled}
      readOnly={readOnly}
      // The label and footer stay compact whatever the size of the stars.
      size="sm"
      labelPosition={LABEL_POSITION[labelPosition]}
      stackedAlign="flex-start"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      labelProps={labelProps}
      descriptionProps={descriptionProps}
      gap={labelGapSize}
      disclaimer={disclaimer}
      disclaimerProps={disclaimerProps}
      style={[spacingStyles, layoutStyles, style]}
    >
      {({ controlProps }) => (
        <View
          ref={rowRef}
          testID={testID}
          {...controlA11y(controlProps)}
          onFocus={onFocus}
          onBlur={onBlur}
          onLayout={drag.onLayout}
          // `touch-action: none` so a drag across the stars is never handed back
          // to the page when the finger strays above or below the row.
          style={[rowStyle, drag.surfaceStyle]}
          {...hoverProps}
          {...drag.panHandlers}
        >
          {stars}
        </View>
      )}
    </ChoiceField>
  );
}

export const Rating = factory<RatingFactoryPayload>(RatingBase, { displayName: 'Rating' });
// The memo wrapper the factory returns doesn't carry the name itself.
Rating.displayName = 'Rating';
