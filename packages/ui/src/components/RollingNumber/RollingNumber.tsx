import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useTransitionDuration } from '../../core/motion/useTransitionDuration';
import { isNative, isWeb } from '../../core/platform/flags';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveTextColor } from '../../core/theme/resolveColors';
import { resolveFontSize, resolveLineHeight } from '../../core/theme/tokens';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { formatRollingValue, toRollingCells } from './formatValue';
import type { RollingNumberProps, RollingNumberTimingFunction } from './types';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const DEFAULT_DURATION = 600;

type EasingFn = (value: number) => number;

const EASING_BY_NAME: Record<RollingNumberTimingFunction, EasingFn> = {
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  column: { overflow: 'hidden' },
  // Web only: a transparent copy of the value laid over the digits (see below).
  selectionCopy: {
    position: 'absolute',
    top: 0,
    start: 0,
    color: 'transparent',
  },
  // Web only: invisible but still read by screen readers (the "sr-only" recipe).
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    opacity: 0,
  },
});

const selectableText = webStyle({ userSelect: 'text' });
const unselectableText = webStyle({ userSelect: 'none' });

interface RollingDigitProps {
  digit: number;
  height: number;
  duration: number;
  delay: number;
  easing: EasingFn;
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
const RollingDigit = React.memo(function RollingDigit({
  digit,
  height,
  duration,
  delay,
  easing,
  animateOnMount,
  textStyle,
}: RollingDigitProps) {
  const position = useSharedValue(animateOnMount && duration > 0 ? 0 : digit);
  const mountedRef = useRef(false);

  useEffect(() => {
    const isMount = !mountedRef.current;
    mountedRef.current = true;

    // `duration` is 0 under reduced motion: jump straight to the digit.
    if (duration <= 0 || (isMount && !animateOnMount)) {
      cancelAnimation(position);
      position.value = digit;
      return;
    }

    // Assigning a new animation retargets from wherever the column is now, so a
    // value that changes faster than the roll never snaps.
    const roll = withTiming(digit, { duration, easing });
    position.value = delay > 0 ? withDelay(delay, roll) : roll;
  }, [digit, duration, delay, easing, animateOnMount, position]);

  useEffect(() => () => cancelAnimation(position), [position]);

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -position.value * height }],
  }));

  const windowStyle = useMemo(() => [styles.column, { height }], [height]);
  const glyphStyle = useMemo(() => [textStyle, { height, lineHeight: height }], [textStyle, height]);

  return (
    <View style={windowStyle}>
      <Animated.View style={stripStyle}>
        {DIGITS.map((value) => (
          <RNText key={value} style={glyphStyle} allowFontScaling={false}>
            {value}
          </RNText>
        ))}
      </Animated.View>
    </View>
  );
});

/**
 * Displays a number and animates every digit that changes, rolling it to its new
 * position. Useful for counters, live totals and metric readouts where the change
 * itself carries meaning.
 *
 * Assistive technology only ever gets the final value: the rolling columns are
 * hidden (each holds all ten digits), the accessible text changes once per value
 * change — never per animation frame — so a surrounding live region announces the
 * new value once.
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
    c: color,
    fw: weight,
    ff: fontFamily,
    tabularNums = true,
    style,
    textStyle,
    digitStyle,
    accessibilityLabel,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const spacingStyles = useStyleProps(extractStyleProps(rest).styleProps);

  const duration = useTransitionDuration(
    transitionDuration ?? animationDuration,
    DEFAULT_DURATION
  );
  const easing = EASING_BY_NAME[timingFunction] ?? EASING_BY_NAME.ease;

  const fontSize = resolveFontSize(theme, size);
  // Rounded because it doubles as the column height and the strip offset: a
  // fractional line height compounds across ten entries and drifts the glyph.
  const lineHeight = Math.round(resolveLineHeight(theme, size));

  const resolvedColor = resolveTextColor(theme, color) ?? theme.text.primary;

  const glyphStyle = useMemo<TextStyle>(() => ({
    fontSize,
    lineHeight,
    color: resolvedColor,
    fontWeight: typeof weight === 'number'
      ? (String(weight) as TextStyle['fontWeight'])
      : (FONT_WEIGHTS[weight as string] ?? (weight as TextStyle['fontWeight'])),
    fontFamily: fontFamily ?? theme.fontFamily,
    ...(tabularNums ? { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] } : null),
  }), [fontSize, lineHeight, resolvedColor, weight, fontFamily, theme.fontFamily, tabularNums]);

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
  const spokenText = accessibilityLabel ?? fullText;

  const flatTextStyle = useMemo(() => [glyphStyle, unselectableText, textStyle], [glyphStyle, textStyle]);
  const flatDigitStyle = useMemo(
    () => [glyphStyle, unselectableText, textStyle, digitStyle],
    [glyphStyle, textStyle, digitStyle]
  );

  return (
    <View
      ref={ref}
      testID={testID}
      style={[styles.row, spacingStyles, style]}
      // Native: one node whose label is the final value. (`text` has no ARIA
      // counterpart, so it stays an accessibilityRole; web reads the DOM text below.)
      {...(isNative
        ? { ...a11yProps({ accessible: true, label: spokenText }), accessibilityRole: 'text' as const }
        : null)}
    >
      {/*
        The animated columns are decoration as far as assistive tech and the
        clipboard are concerned: each one holds all ten digits, so reading or
        copying them would produce "0123456789" per position. They are hidden
        from the accessibility tree.
      */}
      <View style={styles.row} {...a11yProps({ hidden: true })}>
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

      {isWeb ? (
        <>
          {/*
            A transparent copy of the real text laid over the row, so a selection
            yields the displayed value — and screen readers read it, once, as the
            final value. With a custom label the copy stays for selection only and
            the label is read instead.
          */}
          <RNText
            style={[glyphStyle, textStyle, styles.selectionCopy, selectableText]}
            allowFontScaling={false}
            {...(accessibilityLabel ? a11yProps({ hidden: true }) : null)}
          >
            {fullText}
          </RNText>
          {accessibilityLabel ? <RNText style={styles.srOnly}>{accessibilityLabel}</RNText> : null}
        </>
      ) : null}
    </View>
  );
}, { displayName: 'RollingNumber' });

RollingNumber.displayName = 'RollingNumber';
