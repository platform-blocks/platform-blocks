import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, Text as RNText, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getFontSize, getLineHeight } from '../../core/theme/sizes';
import { resolveTextColor } from '../../core/theme/resolveColors';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { extractSpacingProps, getSpacingStyles } from '../../core/utils';
import { formatRollingValue, toRollingCells } from './formatValue';
import type { RollingNumberProps, RollingNumberTimingFunction } from './types';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const DEFAULT_DURATION = 600;

const EASING_BY_NAME: Record<RollingNumberTimingFunction, (value: number) => number> = {
  linear: Easing.linear,
  ease: Easing.inOut(Easing.ease),
  'ease-in': Easing.in(Easing.ease),
  'ease-out': Easing.out(Easing.ease),
  'ease-in-out': Easing.inOut(Easing.ease),
};

const FONT_WEIGHTS: Record<string, TextStyle['fontWeight']> = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// react-native-web has no native animated module, so asking for the native
// driver there only produces a warning and falls back to JS anyway.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface RollingDigitProps {
  digit: number;
  height: number;
  duration: number;
  delay: number;
  easing: (value: number) => number;
  animateOnMount: boolean;
  textStyle: StyleProp<TextStyle>;
}

/**
 * One digit column: a 0–9 strip inside a one-line-tall window, translated so the
 * active digit sits in view.
 *
 * The strip is fixed at ten entries rather than being rebuilt per transition, so
 * a change of any size is a single interruptible `translateY` animation. That
 * also means a 9 → 0 carry rolls back through the strip instead of forward past
 * a repeated zero, which is the same trade every fixed-strip implementation makes
 * and keeps an interrupted animation from ever landing between digits.
 */
const RollingDigit: React.FC<RollingDigitProps> = ({
  digit,
  height,
  duration,
  delay,
  easing,
  animateOnMount,
  textStyle,
}) => {
  const position = useRef(new Animated.Value(animateOnMount ? 0 : digit)).current;
  const mountedRef = useRef(false);

  useEffect(() => {
    const isMount = !mountedRef.current;
    mountedRef.current = true;

    if (duration <= 0 || (isMount && !animateOnMount)) {
      position.setValue(digit);
      return undefined;
    }

    const animation = Animated.timing(position, {
      toValue: digit,
      duration,
      delay,
      easing,
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    animation.start();
    // Stopping on cleanup leaves the column wherever it is, so a value that
    // changes faster than the roll retargets smoothly instead of snapping.
    return () => animation.stop();
  }, [digit, duration, delay, easing, animateOnMount, position]);

  const translateY = useMemo(() => Animated.multiply(position, -height), [position, height]);

  return (
    <View style={{ height, overflow: 'hidden' }}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {DIGITS.map((value) => (
          <RNText
            key={value}
            style={[textStyle, { height, lineHeight: height }]}
            allowFontScaling={false}
          >
            {value}
          </RNText>
        ))}
      </Animated.View>
    </View>
  );
};

/**
 * Displays a number and animates every digit that changes, rolling it to its new
 * position. Useful for counters, live totals and metric readouts where the change
 * itself carries meaning.
 */
export const RollingNumber = factory<{
  props: RollingNumberProps;
  ref: View;
}>((props, ref) => {
  const {
    value,
    prefix,
    suffix,
    thousandSeparator = false,
    decimalSeparator = '.',
    decimalScale,
    fixedDecimalScale = false,
    transitionDuration,
    animationDuration,
    timingFunction = 'ease',
    stagger = 0,
    animateOnMount = false,
    size = 'md',
    color,
    c,
    weight,
    fontFamily,
    ff,
    tabularNums = true,
    style,
    textStyle,
    digitStyle,
    accessibilityLabel,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { spacingProps } = extractSpacingProps(rest as any);
  const spacingStyles = getSpacingStyles(spacingProps);

  const duration = useTransitionDuration(
    transitionDuration ?? animationDuration,
    DEFAULT_DURATION
  );
  const easing = EASING_BY_NAME[timingFunction] ?? EASING_BY_NAME.ease;

  const fontSize = getFontSize(size);
  // Rounded because it doubles as the column height and the strip offset: a
  // fractional line height compounds across ten entries and drifts the glyph.
  const lineHeight = Math.round(fontSize * getLineHeight(size));

  const resolvedColor = resolveTextColor(theme, color ?? c) ?? theme.text.primary;

  const glyphStyle = useMemo<TextStyle>(() => ({
    fontSize,
    lineHeight,
    color: resolvedColor,
    fontWeight: typeof weight === 'number'
      ? (String(weight) as TextStyle['fontWeight'])
      : (FONT_WEIGHTS[weight as string] ?? (weight as TextStyle['fontWeight'])),
    fontFamily: fontFamily ?? ff ?? theme.fontFamily,
    ...(tabularNums ? { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] } : null),
    ...(Platform.OS === 'web' ? { userSelect: 'none' } as TextStyle : null),
  }), [fontSize, lineHeight, resolvedColor, weight, fontFamily, ff, theme.fontFamily, tabularNums]);

  const formatted = useMemo(() => formatRollingValue(value, {
    decimalScale,
    fixedDecimalScale,
    thousandSeparator,
    decimalSeparator,
  }), [value, decimalScale, fixedDecimalScale, thousandSeparator, decimalSeparator]);

  const cells = useMemo(
    () => toRollingCells(formatted, decimalSeparator),
    [formatted, decimalSeparator]
  );

  const fullText = `${prefix ?? ''}${formatted}${suffix ?? ''}`;

  const flatTextStyle = [glyphStyle, textStyle];
  const flatDigitStyle = [glyphStyle, textStyle, digitStyle];

  return (
    <View
      ref={ref}
      testID={testID}
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? fullText}
      style={[{ flexDirection: 'row', alignItems: 'center' }, spacingStyles, style]}
    >
      {/*
        The animated columns are decoration as far as assistive tech and the
        clipboard are concerned: each one holds all ten digits, so reading or
        copying them would produce "0123456789" per position. They are hidden
        from the accessibility tree, and on web a transparent copy of the real
        text is laid over the row so a selection yields the displayed value.
      */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center' }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        {...(Platform.OS === 'web' ? ({ 'aria-hidden': true } as any) : null)}
      >
        {prefix ? (
          <RNText style={flatTextStyle} allowFontScaling={false}>{prefix}</RNText>
        ) : null}

        {cells.map((cell) => (
          cell.isDigit ? (
            <RollingDigit
              key={cell.key}
              digit={Number(cell.char)}
              height={lineHeight}
              duration={duration}
              // Right-to-left stagger: the ones column leads and the carries
              // follow, which reads the way an odometer does.
              delay={stagger > 0 ? Math.max(0, cell.place) * stagger : 0}
              easing={easing}
              animateOnMount={animateOnMount}
              textStyle={flatDigitStyle}
            />
          ) : (
            <RNText key={cell.key} style={flatTextStyle} allowFontScaling={false}>
              {cell.char}
            </RNText>
          )
        ))}

        {suffix ? (
          <RNText style={flatTextStyle} allowFontScaling={false}>{suffix}</RNText>
        ) : null}
      </View>

      {Platform.OS === 'web' ? (
        <RNText
          style={[
            flatTextStyle,
            {
              position: 'absolute',
              top: 0,
              left: 0,
              color: 'transparent',
              userSelect: 'text',
            } as TextStyle,
          ]}
          allowFontScaling={false}
        >
          {fullText}
        </RNText>
      ) : null}
    </View>
  );
});

RollingNumber.displayName = 'RollingNumber';
