import React, { useMemo } from 'react';
import { StyleSheet, type Text as RNText, type TextStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { isWeb } from '../../core/platform/flags';
import { contrastRatio, normalizeHex } from '../../core/theme/colorUtils';
import { DEFAULT_THEME } from '../../core/theme/defaultTheme';
import { resolveColorProp, resolveTextColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor } from '../../core/theme/tokens';
import type { PlocksTheme } from '../../core/theme/types';
import { Text } from '../Text';
import type { TextProps } from '../Text/Text';
import type { HighlightProps, HighlightValue } from './types';

/** Joins highlight values into one memo key; a control character can't appear in a search term by accident. */
const KEY_SEPARATOR = '\u0000';

/**
 * Shade used for a palette-name `highlightColor`. Both built-in schemes order
 * their scales from "closest to the page" to "most contrast" as the index
 * climbs, so a low index is a soft marker under `text.primary` in either one.
 */
const PALETTE_MARK_SHADE = 2;

/** WCAG AA for body text: the marked fragment must stay at least this readable. */
const MIN_TEXT_CONTRAST = 4.5;

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toHighlightArray = (value: HighlightProps['highlight'], trim: boolean): string[] => {
  if (value === undefined || value === null) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : [value];

  return rawValues
    .filter((item): item is HighlightValue => item !== undefined && item !== null)
    .map((item) => String(item))
    .map((item) => (trim ? item.trim() : item))
    .filter((item) => item.length > 0);
};

interface Matcher {
  regex: RegExp;
  /** The values as they compare against a split segment (lower-cased unless case-sensitive). */
  values: ReadonlySet<string>;
}

/** Builds the split regex once per (values, case) — longest first, so overlapping terms prefer the longer match. */
const buildMatcher = (key: string, caseSensitive: boolean): Matcher | null => {
  if (!key) return null;
  const values = key.split(KEY_SEPARATOR);
  const escaped = values.map(escapeRegExp).sort((a, b) => b.length - a.length);
  return {
    regex: new RegExp(`(${escaped.join('|')})`, caseSensitive ? 'g' : 'gi'),
    values: new Set(caseSensitive ? values : values.map((value) => value.toLowerCase())),
  };
};

interface Segment {
  text: string;
  marked: boolean;
}

/** The text cut into plain and marked runs, or `null` when nothing matches. */
const splitSegments = (text: string, matcher: Matcher, caseSensitive: boolean): Segment[] | null => {
  const parts = text.split(matcher.regex);
  if (parts.length <= 1) return null;
  const segments: Segment[] = [];
  for (const part of parts) {
    if (!part) continue;
    segments.push({
      text: part,
      marked: matcher.values.has(caseSensitive ? part : part.toLowerCase()),
    });
  }
  return segments;
};

/**
 * The marker fill. Default: the theme's `backgrounds.mark` (readable under
 * `text.primary` in both schemes). A palette name uses its soft shade; shade
 * syntax (`'teal.3'`), a background role (`'selected'`) or a CSS color is used
 * as given.
 */
const resolveMarkBackground = (theme: PlocksTheme, highlightColor: string | undefined): string => {
  if (highlightColor) {
    return (
      resolveColorProp(theme, highlightColor, { scopes: ['backgrounds'], shades: [PALETTE_MARK_SHADE, 0] }) ??
      highlightColor
    );
  }
  return theme.backgrounds?.mark ?? theme.states?.highlightBackground ?? DEFAULT_THEME.backgrounds.mark;
};

/** Keeps the surrounding text color on the marker when it is readable there, else picks one that is. */
const readableTextOn = (theme: PlocksTheme, background: string, preferred: string): string => {
  const backgroundHex = normalizeHex(background);
  if (backgroundHex && normalizeHex(preferred) && contrastRatio(preferred, backgroundHex) >= MIN_TEXT_CONTRAST) {
    return preferred;
  }
  return onColor(theme, background, MIN_TEXT_CONTRAST);
};

const colorFromStyle = (style: TextProps['style']): string | undefined => {
  const color = StyleSheet.flatten(style)?.color;
  return typeof color === 'string' ? color : undefined;
};

export const Highlight = factory<{ props: HighlightProps; ref: RNText }>(
  (props, ref) => {
    const {
      children,
      highlight,
      highlightStyles,
      highlightColor,
      caseSensitive = false,
      trim = true,
      highlightProps,
      variant,
      c: color,
      style,
      ...rest
    } = props;
    const theme = useTheme();

    const textContent = useMemo(() => {
      if (typeof children === 'string' || typeof children === 'number') {
        return String(children);
      }

      const parts = React.Children.toArray(children);
      if (parts.length === 0) {
        return '';
      }

      if (parts.every((part) => typeof part === 'string' || typeof part === 'number')) {
        return parts.map((part) => String(part)).join('');
      }

      return null;
    }, [children]);

    // Keyed by the values' content, not the array's identity, so an inline
    // `highlight={['a', 'b']}` doesn't rebuild the regex on every render.
    const highlightKey = useMemo(() => toHighlightArray(highlight, trim).join(KEY_SEPARATOR), [highlight, trim]);
    const matcher = useMemo(() => buildMatcher(highlightKey, caseSensitive), [highlightKey, caseSensitive]);
    const segments = useMemo(
      () => (textContent !== null && matcher ? splitSegments(textContent, matcher, caseSensitive) : null),
      [textContent, matcher, caseSensitive]
    );

    const markProps = useMemo(() => {
      const { style: markStyle, as: markAs, variant: markVariant, c: markColor, ...markRest } = highlightProps ?? {};
      return { markStyle, markAs: markAs ?? 'mark', markVariant: markVariant ?? 'span', markColor, markRest };
    }, [highlightProps]);

    // Same resolution Text itself performs, so the marker can keep the
    // surrounding color when it reads on the fill.
    const outerColor = resolveTextColor(theme, color) ?? colorFromStyle(style);
    const markBackground = useMemo(() => resolveMarkBackground(theme, highlightColor), [theme, highlightColor]);
    const markTextColor = useMemo(
      () => (markProps.markColor ? undefined : readableTextOn(theme, markBackground, outerColor ?? theme.text.primary)),
      [markProps.markColor, theme, markBackground, outerColor]
    );

    const baseMarkStyle = useMemo<TextStyle>(
      () => ({
        backgroundColor: markBackground,
        ...(markTextColor ? { color: markTextColor } : null),
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: isWeb ? 0 : 2,
      }),
      [markBackground, markTextColor]
    );

    const overrideMarkStyle = useMemo(
      () => (typeof highlightStyles === 'function' ? highlightStyles(theme) : highlightStyles),
      [highlightStyles, theme]
    );

    const renderedChildren = useMemo(() => {
      if (textContent === null) return children;
      if (!segments) return textContent;

      const { markStyle, markAs, markVariant, markColor, markRest } = markProps;
      return segments.map((segment, index) =>
        segment.marked ? (
          <Text
            key={`highlight-${index}`}
            variant={markVariant}
            as={markAs}
            c={markColor}
            {...markRest}
            style={[baseMarkStyle, overrideMarkStyle, markStyle]}
          >
            {segment.text}
          </Text>
        ) : (
          <React.Fragment key={`text-${index}`}>{segment.text}</React.Fragment>
        )
      );
    }, [children, textContent, segments, markProps, baseMarkStyle, overrideMarkStyle]);

    return (
      <Text ref={ref} variant={variant ?? 'span'} c={color} style={style} {...rest}>
        {renderedChildren}
      </Text>
    );
  },
  { displayName: 'Highlight' }
);

export default Highlight;
