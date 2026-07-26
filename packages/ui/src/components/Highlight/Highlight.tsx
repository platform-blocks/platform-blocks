import React, { useMemo } from 'react';
import { Platform, StyleSheet, type Text as RNText } from 'react-native';

import { Text } from '../Text';
import type { TextProps } from '../Text/Text';
import { useTheme } from '../../core/theme';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import type { HighlightProps, HighlightValue } from './types';

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

type RGB = { r: number; g: number; b: number };

const flattenStyleArray = (style: any): any[] => {
  if (!Array.isArray(style)) {
    return style ? [style] : [];
  }
  return style.reduce<any[]>((acc, item) => {
    acc.push(...flattenStyleArray(item));
    return acc;
  }, []);
};

const extractColorFromStyle = (style: any): string | undefined => {
  for (const entry of flattenStyleArray(style)) {
    if (entry && typeof entry === 'object' && typeof entry.color === 'string') {
      return entry.color;
    }
  }
  return undefined;
};

const parseColor = (value?: string): RGB | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('#')) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].every(component => !Number.isNaN(component))) {
        return { r, g, b };
      }
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].every(component => !Number.isNaN(component))) {
        return { r, g, b };
      }
    }
  }

  const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(part => part.trim()).slice(0, 3);
    if (parts.length === 3) {
      const [r, g, b] = parts.map(part => parseFloat(part));
      if ([r, g, b].every(component => !Number.isNaN(component))) {
        return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
      }
    }
  }

  return undefined;
};

const getRelativeLuminance = ({ r, g, b }: RGB): number => {
  const srgb = [r, g, b].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
};

const mixRgb = (color: RGB, target: RGB, weight: number): RGB => ({
  r: Math.round(color.r * (1 - weight) + target.r * weight),
  g: Math.round(color.g * (1 - weight) + target.g * weight),
  b: Math.round(color.b * (1 - weight) + target.b * weight),
});

const toRgba = ({ r, g, b }: RGB, alpha: number): string => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const resolvePaletteShade = (palette: string[] | undefined, preferredIndex: number, fallbackIndex: number): string | undefined => {
  if (!palette || palette.length === 0) {
    return undefined;
  }

  const safePreferred = palette[Math.min(Math.max(preferredIndex, 0), palette.length - 1)];
  if (safePreferred) {
    return safePreferred;
  }

  return palette[Math.min(Math.max(fallbackIndex, 0), palette.length - 1)];
};

const createAdaptiveBackground = (baseColor: string, isTextLight: boolean, colorScheme: 'light' | 'dark'): string => {
  const rgb = parseColor(baseColor);
  if (!rgb) {
    return baseColor;
  }

  const target = isTextLight ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  const mixAmount = isTextLight ? (colorScheme === 'dark' ? 0.4 : 0.3) : (colorScheme === 'dark' ? 0.25 : 0.15);
  const alpha = isTextLight ? (colorScheme === 'dark' ? 0.7 : 0.8) : (colorScheme === 'dark' ? 0.55 : 0.88);

  const mixed = mixRgb(rgb, target, mixAmount);
  return toRgba(mixed, alpha);
};

const resolveHighlightBackground = (
  theme: PlatformBlocksTheme,
  highlightColor: string | undefined,
  isTextLight: boolean,
): string => {
  const themeColors = theme.colors as Record<string, string[] | undefined>;
  const paletteFromProp = highlightColor ? themeColors[highlightColor] : undefined;
  const defaultPalette = theme.colors.highlight || theme.colors.amber || theme.colors.primary;
  const preferredPalette = paletteFromProp || defaultPalette;
  const highlightStateColor = theme.states?.highlightBackground;

  let baseColor: string | undefined = paletteFromProp
    ? resolvePaletteShade(paletteFromProp, isTextLight ? 8 : 2, isTextLight ? 7 : 3)
    : undefined;

  if (!baseColor && highlightColor && !paletteFromProp) {
    baseColor = highlightColor;
  }

  if (!baseColor && highlightStateColor) {
    baseColor = highlightStateColor;
  }

  if (!baseColor && preferredPalette) {
    baseColor = resolvePaletteShade(preferredPalette, isTextLight ? 8 : 2, isTextLight ? 7 : 3);
  }

  if (!baseColor) {
    baseColor = isTextLight ? '#92400E' : '#FDE68A';
  }

  return createAdaptiveBackground(baseColor, isTextLight, theme.colorScheme);
};

const createBaseHighlightStyle = (
  theme: PlatformBlocksTheme,
  backgroundColor: string,
  textColor: string,
  includeColor: boolean,
) => ({
  backgroundColor,
  ...(includeColor ? { color: textColor } : {}),
  borderRadius: 4,
  paddingHorizontal: 4,
  paddingVertical: Platform.OS === 'web' ? 0 : 2,
});

export const Highlight = React.forwardRef<RNText, HighlightProps>(({
  children,
  highlight,
  highlightStyles,
  highlightColor,
  caseSensitive = false,
  trim = true,
  highlightProps,
  variant,
  ...rest
}, ref) => {
  const theme = useTheme();

  const outerVariant = variant ?? 'span';

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

  const highlightValues = useMemo(() => toHighlightArray(highlight, trim), [highlight, trim]);

  const highlightPropsValue = useMemo<Partial<TextProps>>(() => highlightProps ?? {}, [highlightProps]);

  const highlightDerived = useMemo(() => {
    const { style, as, variant: innerVariant, color: colorProp, ...restProps } = highlightPropsValue;
    return {
      style,
      color: colorProp,
      as: (as as TextProps['as']) ?? (Platform.OS === 'web' ? 'mark' : 'span'),
      variant: (innerVariant as TextProps['variant']) ?? 'span',
      rest: restProps,
    };
  }, [highlightPropsValue]);

  const outerColor = useMemo(() => {
    const restProps = rest as Partial<TextProps>;

    if (restProps?.color && typeof restProps.color === 'string') {
      return restProps.color;
    }

    const colorVariantKey = (restProps as any)?.colorVariant;
    if (typeof colorVariantKey === 'string') {
      const fromText = (theme.text as Record<string, string | undefined>)[colorVariantKey];
      if (fromText) {
        return fromText;
      }

      const palette = (theme.colors as Record<string, string[] | undefined>)[colorVariantKey];
      const paletteColor = resolvePaletteShade(palette, 6, palette ? palette.length - 1 : 6);
      if (paletteColor) {
        return paletteColor;
      }
    }

    return extractColorFromStyle(restProps?.style);
  }, [rest, theme]);

  // Default to the surrounding text color so a highlight reads like a normal
  // marker (yellow background, unchanged text) rather than recoloring the text.
  const fallbackTextColor = theme.text.primary;

  const { resolvedTextColor, isTextColorLight } = useMemo(() => {
    const candidate = highlightDerived.color ?? outerColor ?? fallbackTextColor;
    const parsedCandidate = parseColor(candidate);
    if (parsedCandidate) {
      return {
        resolvedTextColor: candidate as string,
        isTextColorLight: getRelativeLuminance(parsedCandidate) > 0.6,
      };
    }

    const parsedFallback = parseColor(fallbackTextColor);
    if (parsedFallback) {
      return {
        resolvedTextColor: fallbackTextColor,
        isTextColorLight: getRelativeLuminance(parsedFallback) > 0.6,
      };
    }

    return {
      resolvedTextColor: candidate ?? fallbackTextColor,
      isTextColorLight: theme.colorScheme === 'dark',
    };
  }, [highlightDerived.color, outerColor, fallbackTextColor, theme.colorScheme]);

  const highlightBackground = useMemo(
    () => resolveHighlightBackground(theme, highlightColor, isTextColorLight),
    [theme, highlightColor, isTextColorLight],
  );

  const highlightColorProp = highlightDerived.color;

  const baseHighlightStyle = useMemo(
    () => createBaseHighlightStyle(theme, highlightBackground, resolvedTextColor, !highlightColorProp),
    [theme, highlightBackground, resolvedTextColor, highlightColorProp],
  );

  const overrideHighlightStyle = useMemo(() => (
    typeof highlightStyles === 'function' ? highlightStyles(theme) : highlightStyles
  ), [highlightStyles, theme]);

  const highlightNodeStyle = useMemo(
    () => StyleSheet.flatten([
      baseHighlightStyle,
      overrideHighlightStyle,
      highlightDerived.style,
    ]),
    [baseHighlightStyle, overrideHighlightStyle, highlightDerived.style],
  );

  const highlightVariant = highlightDerived.variant;
  const highlightAs = highlightDerived.as;
  const highlightRest = highlightDerived.rest;

  const highlightRegex = useMemo(() => {
    if (textContent === null || highlightValues.length === 0) {
      return null;
    }

    const escaped = highlightValues
      .map((value) => escapeRegExp(value))
      .filter((value) => value.length > 0)
      .sort((a, b) => b.length - a.length);

    if (escaped.length === 0) {
      return null;
    }

    return new RegExp(`(${escaped.join('|')})`, caseSensitive ? 'g' : 'gi');
  }, [textContent, highlightValues, caseSensitive]);

  const highlightNormalizedSet = useMemo(() => {
    if (caseSensitive) {
      return new Set(highlightValues);
    }

    return new Set(highlightValues.map((value) => value.toLowerCase()));
  }, [highlightValues, caseSensitive]);

  const renderedChildren = useMemo(() => {
    if (textContent === null) {
      return children;
    }

    if (!highlightRegex || highlightValues.length === 0) {
      return textContent;
    }

    const segments = textContent.split(highlightRegex);
    if (segments.length <= 1) {
      return textContent;
    }

    return segments.map((segment, index) => {
      if (!segment) {
        return null;
      }

      const normalizedSegment = caseSensitive ? segment : segment.toLowerCase();

      if (highlightNormalizedSet.has(normalizedSegment)) {
        return (
          <Text
            key={`highlight-${index}`}
            variant={highlightVariant}
            as={highlightAs}
            color={highlightColorProp}
            {...highlightRest}
            style={highlightNodeStyle}
          >
            {segment}
          </Text>
        );
      }

      return (
        <React.Fragment key={`text-${index}`}>
          {segment}
        </React.Fragment>
      );
    }).filter((item) => item !== null);
  }, [
    children,
    textContent,
    highlightRegex,
    highlightValues,
    caseSensitive,
    highlightNormalizedSet,
    highlightVariant,
    highlightAs,
    highlightRest,
    highlightNodeStyle,
    highlightColorProp,
  ]);

  return (
    <Text ref={ref} variant={outerVariant} {...rest}>
      {renderedChildren}
    </Text>
  );
});

Highlight.displayName = 'Highlight';

export default Highlight;
