import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Platform, PanResponder, GestureResponderHandlers } from 'react-native';

import { factory } from '../../core/factory';
import { useControllableState } from '../../hooks/useControllableState';
import { SizeValue, getIconSize } from '../../core/theme/sizes';
import { useTheme } from '../../core/theme/ThemeProvider';
import { createFocusStyles } from '../../core/interactive-states';
import { getSpacingStyles, extractSpacingProps } from '../../core/utils';
import {
  GESTURE_RESPONDER_LOCK,
  acquirePageScrollLock,
  acquireTextSelectionLock,
  getGestureSurfaceStyle,
  releasePageScrollLock,
  releaseTextSelectionLock,
} from '../../core/gestures';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { Tooltip } from '../Tooltip';
import { RatingProps, RatingFactoryPayload, RatingIcon } from './types';
import type { ExternalIconComponent } from '../Icon/types';

// Non-breaking spaces around the slash: the tooltip bubble is anchored to a
// single star, so a narrow computed width would otherwise break "2 / 5" across
// two lines at the ordinary spaces.
const VALUE_SEPARATOR = '\u00A0/\u00A0';

// The default `character`/`emptyCharacter` values are sentinels for "no custom
// glyph was passed" \u2014 they render the built-in star icon rather than the raw
// text character, which is what the component has always drawn.
const DEFAULT_CHARACTER = '\u2605';
const DEFAULT_EMPTY_CHARACTER = '\u2606';

function RatingBase(rawProps: RatingProps, ref: React.Ref<View>) {
  const { disclaimerProps: disclaimerData, otherProps: propsAfterDisclaimer } = extractDisclaimerProps(rawProps);
  const { spacingProps, otherProps: props } = extractSpacingProps(propsAfterDisclaimer as RatingProps);
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
    error,
    description,
    showTooltip = false,
    getTooltipLabel,
    icon,
    emptyIcon,
    character = '★',
    emptyCharacter = '☆',
    gap = 'xs',
    style,
    testID,
    accessibilityLabel,
    accessibilityHint,
    label,
    labelPosition = 'above',
    labelGap = 'xs',
  } = props as RatingProps;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyles = getSpacingStyles(spacingProps);
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);

  const fractionalEnabled = allowFraction;
  const actualPrecision = Math.max(0.01, Math.min(1, precision));
  // `readOnly` and `disabled` both lock input; only `disabled` dims the control.
  const inputLocked = readOnly || disabled;

  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const containerMetricsRef = useRef<{ width: number; left: number }>({ width: 0, left: 0 });
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  const [currentValue, setCurrentValue] = useControllableState<number>({
    value: controlledValue,
    defaultValue,
    finalValue: 0,
    onChange,
  });
  const displayValue = hoverValue ?? currentValue;

  const roundToPrecision = useCallback((value: number) => {
    const rounded = Math.round(value / actualPrecision) * actualPrecision;
    // Take the decimal count from `precision` itself: deriving it from log10
    // truncates values a step can legitimately land on (0.25 → 0.3).
    const decimalPlaces = (String(actualPrecision).split('.')[1] || '').length;
    return parseFloat(rounded.toFixed(decimalPlaces));
  }, [actualPrecision]);

  // Keyboard and assistive-technology adjustments move by the same increment the
  // pointer can produce: a whole item, or `precision` when fractions are allowed.
  const keyboardStep = fractionalEnabled ? actualPrecision : 1;

  const commitValue = useCallback((next: number) => {
    if (inputLocked) return;
    const clamped = Math.min(count, Math.max(0, next));
    setCurrentValue(roundToPrecision(clamped));
  }, [inputLocked, count, roundToPrecision, setCurrentValue]);

  const stepValue = useCallback((direction: number) => {
    commitValue(currentValue + direction * keyboardStep);
  }, [commitValue, currentValue, keyboardStep]);

  const handleKeyDown = useCallback((event: any) => {
    if (inputLocked) return;
    const key = event?.key;
    if (!key) return;

    // Arrow keys follow reading order, so they swap under RTL.
    const forwardKey = isRTL ? 'ArrowLeft' : 'ArrowRight';
    const backwardKey = isRTL ? 'ArrowRight' : 'ArrowLeft';

    if (key === forwardKey || key === 'ArrowUp') {
      stepValue(1);
    } else if (key === backwardKey || key === 'ArrowDown') {
      stepValue(-1);
    } else if (key === 'Home') {
      commitValue(0);
    } else if (key === 'End') {
      commitValue(count);
    } else if (key === 'Backspace' || key === 'Delete') {
      commitValue(0);
    } else if (/^[0-9]$/.test(key)) {
      const digit = Number(key);
      // Digits are a shortcut to an exact value; ignore ones out of range.
      if (digit > count) return;
      commitValue(digit);
    } else {
      return;
    }

    event.preventDefault?.();
  }, [inputLocked, isRTL, stepValue, commitValue, count]);

  const handleAccessibilityAction = useCallback((event: any) => {
    const actionName = event?.nativeEvent?.actionName;
    if (actionName === 'increment') stepValue(1);
    else if (actionName === 'decrement') stepValue(-1);
  }, [stepValue]);

  const filledColor = color || theme.colors.warning[5] || '#FFA500';
  const unfilledColor = emptyColor || theme.colors.gray[4] || '#D1D5DB';
  const highlightColor = hoverColor || theme.colors.warning[6] || '#FF8C00';

  const iconSize = typeof size === 'number' ? size : getIconSize(size as SizeValue);
  const gapSize = typeof gap === 'number' ? gap : getIconSize(gap as SizeValue) / 2;
  const labelGapSize = typeof labelGap === 'number' ? labelGap : getIconSize(labelGap as SizeValue) / 2;

  const labelNode = useMemo(() => {
    if (!label) return null;
    const asterisk = required ? (
      <Text variant="small" style={{ color: theme.colors.error?.[5] || '#FA5252' }}>{' *'}</Text>
    ) : null;

    if (typeof label === 'string') {
      return (
        <Text variant="small" color="secondary">
          {label}
          {asterisk}
        </Text>
      );
    }

    // A node label is rendered as-is; the asterisk trails it so custom labels
    // still show the required marker.
    return asterisk ? (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {label}
        {asterisk}
      </View>
    ) : label;
  }, [label, required, theme.colors.error]);

  const handleHoverLeave = useCallback(() => {
    if (Platform.OS !== 'web') return;
    setHoverValue(null);
    setTooltipIndex(null);
    if (!inputLocked) {
      onHover?.(currentValue);
    }
  }, [onHover, currentValue, inputLocked]);

  const tooltipDecimalPlaces = useMemo(() => {
    if (!fractionalEnabled) return 0;

    let decimals = 0;
    let precisionCandidate = actualPrecision;
    const maxIterations = 6;

    while (precisionCandidate < 1 && decimals < maxIterations) {
      precisionCandidate *= 10;
      decimals += 1;

      if (Math.abs(Math.round(precisionCandidate) - precisionCandidate) < 1e-6) {
        break;
      }
    }

    return decimals;
  }, [fractionalEnabled, actualPrecision]);

  const tooltipNumberFormatter = useMemo(() => {
    if (!showTooltip || !fractionalEnabled) {
      return null;
    }

    const decimals = Math.min(tooltipDecimalPlaces, 6);

    try {
      return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } catch (_error) {
      return null;
    }
  }, [showTooltip, fractionalEnabled, tooltipDecimalPlaces]);

  const tooltipValue = useMemo(() => {
    if (!showTooltip) return null;
    if (hoverValue !== null) return hoverValue;
    if (tooltipIndex !== null) return currentValue;
    return null;
  }, [showTooltip, hoverValue, tooltipIndex, currentValue]);

  const tooltipLabel = useMemo(() => {
    if (!showTooltip || tooltipValue === null) {
      return '';
    }

    const clampedValue = Math.max(0, Math.min(tooltipValue, count));
    if (!fractionalEnabled) {
      const integerValue = Math.round(clampedValue);
      return getTooltipLabel
        ? getTooltipLabel(integerValue, count)
        : `${integerValue}${VALUE_SEPARATOR}${count}`;
    }

    const normalizedValue = roundToPrecision(clampedValue);
    if (getTooltipLabel) {
      return getTooltipLabel(normalizedValue, count);
    }

    const decimals = Math.min(tooltipDecimalPlaces, 6);
    const formattedValue = tooltipNumberFormatter
      ? tooltipNumberFormatter.format(normalizedValue)
      : normalizedValue.toFixed(decimals);

    return `${formattedValue}${VALUE_SEPARATOR}${count}`;
  }, [showTooltip, tooltipValue, fractionalEnabled, tooltipDecimalPlaces, tooltipNumberFormatter, count, roundToPrecision, getTooltipLabel]);

  // What a single item draws for a given fill state. `icon`/`emptyIcon` win over
  // `character`/`emptyCharacter`, and `emptyIcon` falls back to `icon` so one
  // custom icon covers both states (drawn in `emptyColor` when empty).
  const resolveGlyphSource = useCallback((filled: boolean): { isIcon: boolean; value: RatingIcon | React.ReactNode } => {
    if (filled) {
      if (icon != null) return { isIcon: true, value: icon };
      return { isIcon: false, value: character };
    }

    const emptySource = emptyIcon ?? icon;
    if (emptySource != null) return { isIcon: true, value: emptySource };
    return { isIcon: false, value: emptyCharacter };
  }, [icon, emptyIcon, character, emptyCharacter]);

  const renderGlyph = useCallback((filled: boolean, glyphColor: string) => {
    const { isIcon, value } = resolveGlyphSource(filled);

    // Elements are cloned rather than wrapped so icon libraries pick up the
    // resolved size and the current fill color.
    if (React.isValidElement(value)) {
      return React.cloneElement(value as React.ReactElement<any>, {
        size: iconSize,
        color: glyphColor,
      });
    }

    if (typeof value === 'string') {
      // Strings from `icon`/`emptyIcon` are registry names; the default star
      // characters keep rendering the built-in icon, and any other character
      // renders as literal text.
      if (isIcon) {
        return <Icon name={value} size={iconSize} color={glyphColor} variant="filled" />;
      }

      if (value === DEFAULT_CHARACTER || value === DEFAULT_EMPTY_CHARACTER) {
        return <Icon name="star" size={iconSize} color={glyphColor} variant="filled" />;
      }

      return (
        <Text
          style={{
            fontSize: iconSize,
            lineHeight: iconSize * 1.15,
            color: glyphColor,
            textAlign: 'center',
          }}
        >
          {value}
        </Text>
      );
    }

    if (typeof value === 'function') {
      return <Icon icon={value as ExternalIconComponent} size={iconSize} color={glyphColor} />;
    }

    // Any remaining node (fragments, arbitrary children) renders untouched.
    if (value != null && typeof value !== 'boolean') {
      return <>{value}</>;
    }

    return <Icon name="star" size={iconSize} color={glyphColor} variant="filled" />;
  }, [resolveGlyphSource, iconSize]);

  const renderStar = useCallback((starIndex: number) => {
    const starValue = starIndex + 1;
    const fractionalPart = displayValue - starIndex;
    const isFilled = displayValue >= starValue;
    // Partial fill follows the value itself: `allowFraction` governs what a user
    // can set, not what a read-only `value={4.5}` is allowed to display.
    const isPartiallyFilled = fractionalPart > 0 && fractionalPart < 1;
    const isHovered = hoverValue !== null && hoverValue >= starIndex + actualPrecision;

    const activeFillColor = hoverValue !== null ? highlightColor : filledColor;
    const starColor = isHovered ? activeFillColor : (isFilled || isPartiallyFilled ? activeFillColor : unfilledColor);

    // Partial fill stacks a clipped filled glyph over the empty one, so it works
    // the same for stars, custom icons and text characters. The clip is anchored
    // to the edge the value grows from, which flips under RTL.
    const baseStar = isPartiallyFilled ? (
      <View style={{ position: 'relative' }}>
        {renderGlyph(false, unfilledColor)}
        <View
          style={{
            position: 'absolute',
            [isRTL ? 'right' : 'left']: 0,
            top: 0,
            width: iconSize * fractionalPart,
            height: iconSize,
            overflow: 'hidden',
            alignItems: isRTL ? 'flex-end' : 'flex-start',
          }}
        >
          {renderGlyph(true, activeFillColor)}
        </View>
      </View>
    ) : renderGlyph(isFilled || isHovered, starColor);

    const starWithTooltip = showTooltip ? (
      <Tooltip
        label={tooltipLabel}
        position="top"
        opened={tooltipIndex === starIndex && tooltipLabel.length > 0}
        events={{ hover: false, focus: false, touch: false }}
      >
        {baseStar}
      </Tooltip>
    ) : baseStar;

    return (
      // `marginEnd` rather than `marginRight` so the trailing item stays flush
      // with the end of the row in both directions.
      <View key={starIndex} style={{ marginEnd: starIndex < count - 1 ? gapSize : 0 }}>
        {starWithTooltip}
      </View>
    );
  }, [
    displayValue,
    hoverValue,
    actualPrecision,
    highlightColor,
    filledColor,
    unfilledColor,
    renderGlyph,
    isRTL,
    iconSize,
    gapSize,
    count,
    showTooltip,
    tooltipIndex,
    tooltipLabel,
  ]);

  const stars = useMemo(() => Array.from({ length: count }, (_, index) => renderStar(index)), [count, renderStar]);

  const accessibilityProps = {
    accessibilityRole: (inputLocked ? 'text' : 'adjustable') as any,
    accessibilityLabel: accessibilityLabel || `Rating: ${currentValue} out of ${count} stars`,
    accessibilityHint: accessibilityHint || (inputLocked ? undefined : 'Swipe up or down to adjust rating'),
    accessibilityState: { disabled },
    accessibilityValue: {
      min: 0,
      max: count,
      now: currentValue,
    },
    // Lets VoiceOver/TalkBack adjust the value without a pointer.
    ...(inputLocked ? {} : {
      accessibilityActions: [
        { name: 'increment', label: 'Increase rating' },
        { name: 'decrement', label: 'Decrease rating' },
      ],
      onAccessibilityAction: handleAccessibilityAction,
    }),
    ...(Platform.OS === 'web' && {
      'aria-required': required || undefined,
      'aria-invalid': error ? true : undefined,
    }),
  };

  // Keyboard support is web-only; native uses the accessibility actions above.
  const keyboardProps: Record<string, unknown> = Platform.OS === 'web' && !inputLocked
    ? {
      tabIndex: 0,
      onKeyDown: handleKeyDown,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    }
    : {};

  const isVertical = labelPosition === 'above' || labelPosition === 'below';

  const totalWidth = useMemo(() => count * iconSize + (count - 1) * gapSize, [count, iconSize, gapSize]);

  const containerRef = useRef<any>(null);

  // `getBoundingClientRect` forces a synchronous layout flush, and mousemove can
  // fire several times per frame on a high-polling pointer — so the rect is read
  // at most once per frame and shared by every handler. One frame of staleness
  // is imperceptible, and the cache self-corrects if the page scrolls.
  const webRectRef = useRef<{ left: number; width: number } | null>(null);
  const webRectFrameRef = useRef<number | null>(null);

  const readWebRect = useCallback(() => {
    if (webRectRef.current) return webRectRef.current;

    const rect = containerRef.current?.getBoundingClientRect?.();
    if (!rect) return null;

    webRectRef.current = { left: rect.left, width: rect.width };

    if (typeof requestAnimationFrame === 'function' && webRectFrameRef.current == null) {
      webRectFrameRef.current = requestAnimationFrame(() => {
        webRectFrameRef.current = null;
        webRectRef.current = null;
      });
    }

    return webRectRef.current;
  }, []);

  useEffect(() => () => {
    if (webRectFrameRef.current != null && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(webRectFrameRef.current);
    }
  }, []);

  const getOffsetXFromEventWeb = useCallback((e: any) => {
    const nativeEvent = e?.nativeEvent ?? e;
    const rect = readWebRect();

    const clientXCandidate = e?.clientX
      ?? nativeEvent?.clientX
      ?? nativeEvent?.pageX
      ?? nativeEvent?.changedTouches?.[0]?.clientX
      ?? nativeEvent?.touches?.[0]?.clientX;

    if (rect && typeof clientXCandidate === 'number' && !Number.isNaN(clientXCandidate)) {
      return clientXCandidate - rect.left;
    }

    const offsetX = nativeEvent?.offsetX;
    if (typeof offsetX === 'number' && !Number.isNaN(offsetX)) {
      return offsetX;
    }

    const locationX = nativeEvent?.locationX;
    if (typeof locationX === 'number' && !Number.isNaN(locationX)) {
      return locationX;
    }

    return 0;
  }, [readWebRect]);

  const resolveValueDetails = useCallback((x: number, widthOverride?: number) => {
    const width = widthOverride && widthOverride > 0 ? widthOverride : totalWidth;
    const clampedX = Math.max(0, Math.min(width, x));
    // Pointer offsets are always measured from the physical left edge, while an
    // RTL row renders the first item on the right — mirror before mapping to
    // item indexes.
    const distanceFromStart = isRTL ? width - clampedX : clampedX;
    const rawUnits = width > 0 ? (distanceFromStart / width) * count : 0;

    const ratingValue = fractionalEnabled
      ? roundToPrecision(rawUnits)
      : Math.min(count, Math.max(1, Math.ceil(rawUnits)));

    return { ratingValue, rawUnits };
  }, [totalWidth, count, fractionalEnabled, roundToPrecision, isRTL]);

  const resolveTooltipIndexFromRaw = useCallback((rawUnits: number | null | undefined) => {
    if (!showTooltip || rawUnits == null || Number.isNaN(rawUnits)) {
      return null;
    }

    const approxIndex = Math.round(rawUnits - 0.5);
    return Math.max(0, Math.min(count - 1, approxIndex));
  }, [showTooltip, count]);

  const handlePointerMove = useCallback((x: number, widthOverride?: number) => {
    const { ratingValue, rawUnits } = resolveValueDetails(x, widthOverride);
    // Anchor the tooltip even when read-only — it reports the current value and
    // is a display affordance, not input.
    setTooltipIndex(resolveTooltipIndexFromRaw(rawUnits));
    if (inputLocked) return;
    // hoverValue drives displayValue and the highlight color, so setting it on a
    // read-only rating repaints the stars to follow the cursor.
    setHoverValue(ratingValue);
    onHover?.(ratingValue);
  }, [resolveValueDetails, resolveTooltipIndexFromRaw, onHover, inputLocked]);

  const commitAtOffsetX = useCallback((x: number, widthOverride?: number) => {
    if (inputLocked) return;
    const { ratingValue, rawUnits } = resolveValueDetails(x, widthOverride);
    // Selecting the value that is already set clears the rating when `clearable`.
    setCurrentValue(clearable && ratingValue === currentValue ? 0 : ratingValue);
    setTooltipIndex(resolveTooltipIndexFromRaw(rawUnits));
  }, [inputLocked, resolveValueDetails, resolveTooltipIndexFromRaw, setCurrentValue, clearable, currentValue]);

  const resolveRelativePosition = useCallback((evt: any) => {
    if (Platform.OS === 'web') {
      const measuredWidth = readWebRect()?.width;
      const width = (typeof measuredWidth === 'number' && measuredWidth > 0)
        ? measuredWidth
        : (containerWidth ?? containerMetricsRef.current.width ?? totalWidth);
      const x = getOffsetXFromEventWeb(evt);
      return { x, width };
    }

    const { pageX, locationX } = evt?.nativeEvent ?? {};
    const { left, width } = containerMetricsRef.current;

    if (typeof pageX === 'number' && width > 0) {
      return { x: pageX - left, width };
    }

    const fallbackWidth = width || containerWidth || totalWidth;
    const relativeX = typeof locationX === 'number' ? locationX : 0;
    return {
      x: relativeX,
      width: fallbackWidth,
    };
  }, [containerWidth, getOffsetXFromEventWeb, totalWidth, readWebRect]);

  // Locks are held for the duration of a drag; a component torn down mid-drag
  // must still hand them back or the page stays unscrollable.
  const locksHeldRef = useRef(false);

  const acquireDragLocks = useCallback(() => {
    if (locksHeldRef.current) return;
    locksHeldRef.current = true;
    acquirePageScrollLock();
    acquireTextSelectionLock();
  }, []);

  const releaseDragLocks = useCallback(() => {
    if (!locksHeldRef.current) return;
    locksHeldRef.current = false;
    releasePageScrollLock();
    releaseTextSelectionLock();
  }, []);

  useEffect(() => () => releaseDragLocks(), [releaseDragLocks]);

  useEffect(() => {
    if (!showTooltip) {
      setTooltipIndex(null);
    }
  }, [showTooltip]);

  const panHandlers: GestureResponderHandlers = useMemo(() => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => !inputLocked,
      onMoveShouldSetPanResponder: () => !inputLocked,
      onPanResponderGrant: (evt) => {
        if (inputLocked) return;
        acquireDragLocks();
        const { x, width } = resolveRelativePosition(evt);
        handlePointerMove(x, width);
      },
      onPanResponderMove: (evt) => {
        if (inputLocked) return;
        const { x, width } = resolveRelativePosition(evt);
        handlePointerMove(x, width);
      },
      onPanResponderRelease: (evt) => {
        releaseDragLocks();
        if (inputLocked) return;
        const { x, width } = resolveRelativePosition(evt);
        commitAtOffsetX(x, width);
        setHoverValue(null);
        setTooltipIndex(null);
      },
      onPanResponderTerminate: () => {
        releaseDragLocks();
        setHoverValue(null);
        setTooltipIndex(null);
      },
      // Keeps an enclosing ScrollView from stealing the drag once the finger
      // drifts off the star row. See core/gestures/gestureSurface.
      ...GESTURE_RESPONDER_LOCK,
    });

    return responder.panHandlers;
  }, [inputLocked, resolveRelativePosition, handlePointerMove, commitAtOffsetX, acquireDragLocks, releaseDragLocks]);

  const ratingContent = (
    <View
      ref={containerRef}
      style={[
        { flexDirection: 'row', position: 'relative', borderRadius: 4 },
        // `touch-action: none` so a drag across the stars is never handed back
        // to the page when the finger strays above or below the row.
        getGestureSurfaceStyle({ enabled: !inputLocked, cursor: inputLocked ? undefined : 'pointer' }),
        // Keyboard focus needs a visible target since the stars themselves are
        // not individually focusable.
        createFocusStyles(theme, isFocused),
      ]}
      onLayout={(event) => {
        const layoutWidth = event.nativeEvent.layout?.width;
        if (typeof layoutWidth === 'number' && layoutWidth > 0) {
          setContainerWidth(layoutWidth);
        }

        if (Platform.OS === 'web') {
          const rect = containerRef.current?.getBoundingClientRect?.();
          if (rect) {
            containerMetricsRef.current = {
              width: rect.width,
              left: rect.left,
            };
            if (rect.width > 0) {
              setContainerWidth(rect.width);
            }
          }
          return;
        }

        if ((containerRef.current as any)?.measure) {
          (containerRef.current as any).measure((
            _x: number,
            _y: number,
            width: number,
            _height: number,
            pageX: number,
            _pageY: number,
          ) => {
            if (typeof width === 'number' && width > 0) {
              setContainerWidth(width);
              containerMetricsRef.current = {
                width,
                left: typeof pageX === 'number' ? pageX : containerMetricsRef.current.left,
              };
            }
          });
        }
      }}
      {...panHandlers}
      {...(Platform.OS === 'web' && {
        onMouseMove: (e: any) => handlePointerMove(getOffsetXFromEventWeb(e), readWebRect()?.width),
        onMouseDown: (e: any) => handlePointerMove(getOffsetXFromEventWeb(e), readWebRect()?.width),
        onMouseUp: (e: any) => {
          const x = getOffsetXFromEventWeb(e);
          commitAtOffsetX(x, readWebRect()?.width);
          setHoverValue(null);
          setTooltipIndex(null);
        },
        onMouseLeave: () => handleHoverLeave(),
      })}
    >
      {stars}
    </View>
  );

  const disclaimerNode = renderDisclaimer();

  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'flex-start' : 'center',
          flexWrap: 'wrap',
          opacity: disabled ? 0.5 : 1,
        },
        spacingStyles,
        style,
      ]}
      testID={testID}
      {...accessibilityProps}
      {...keyboardProps}
    >
      {labelNode && (labelPosition === 'left' || labelPosition === 'above') && (
        <View style={{ marginEnd: !isVertical && labelPosition === 'left' ? labelGapSize : 0, marginBottom: isVertical && labelPosition === 'above' ? labelGapSize : 0 }}>
          {labelNode}
        </View>
      )}
      {ratingContent}
      {labelNode && (labelPosition === 'right' || labelPosition === 'below') && (
        <View style={{ marginStart: !isVertical && labelPosition === 'right' ? labelGapSize : 0, marginTop: isVertical && labelPosition === 'below' ? labelGapSize : 0 }}>
          {labelNode}
        </View>
      )}
      {description && !error ? (
        <View style={{ width: '100%', marginTop: 4 }}>
          <Text variant="small" color="muted">{description}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={{ width: '100%', marginTop: 4 }}>
          <Text variant="small" style={{ color: theme.colors.error?.[6] || '#E03131' }}>{error}</Text>
        </View>
      ) : null}
      {disclaimerNode ? (
        <View style={{ width: '100%' }}>
          {disclaimerNode}
        </View>
      ) : null}
    </View>
  );
}

export const Rating = factory<RatingFactoryPayload>(RatingBase);

Rating.displayName = 'Rating';
