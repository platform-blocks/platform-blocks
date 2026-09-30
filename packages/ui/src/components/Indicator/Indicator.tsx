import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { isWeb } from '../../core/platform';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { onColor, resolveFontSize } from '../../core/theme/tokens';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { Text } from '../Text';
import type { IndicatorProps } from './types';

/** Hidden from assistive technology, without hiding the element from test queries on native. */
const DECORATIVE = isWeb ? a11yProps({ hidden: true }) : { importantForAccessibility: 'no' as const };

/**
 * A small dot (or count pill) on the corner of a parent container. Wrap the
 * target in a relatively positioned container and place `<Indicator />` inside.
 *
 * Pass `label` to render text content (e.g. a count); the dot expands to a pill
 * so multi-digit values fit. For custom content (an icon) use `children`. A
 * plain dot is decorative unless `accessibilityLabel` says what it means.
 */
export const Indicator = factory<{ props: IndicatorProps; ref: View }>((props, ref) => {
  const {
    size = 'sm',
    color,
    borderColor,
    borderWidth = 1,
    placement = 'bottom-right',
    offset = 0,
    style,
    children,
    label,
    labelProps,
    accessibilityLabel,
    invisible,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  if (invisible) return null;

  const fill = resolveAccentColor(theme, color ?? 'success') ?? theme.text.link;
  const ringColor = (borderColor && resolveAccentColor(theme, borderColor)) || theme.backgrounds?.surface;
  // A status dot is as tall as the text of its size token.
  const diameter = typeof size === 'number' ? size : resolveFontSize(theme, size);

  // When a `label` is provided, expand the dot to a pill so multi-digit counts
  // (e.g. "12", "99+") fit. Plain dots stay perfectly circular.
  const hasLabelText = label !== undefined && label !== null && label !== '';
  const edge = -offset;
  const [vertical, horizontal] = placement.split('-') as ['top' | 'bottom', 'left' | 'right'];

  const base: ViewStyle = {
    position: 'absolute',
    minWidth: hasLabelText ? diameter : undefined,
    width: hasLabelText ? undefined : diameter,
    height: diameter,
    paddingHorizontal: hasLabelText ? Math.max(4, Math.round(diameter / 3)) : 0,
    borderRadius: diameter / 2,
    backgroundColor: fill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth,
    borderColor: ringColor,
    ...(vertical === 'top' ? { top: edge } : { bottom: edge }),
    // Logical side, so the indicator mirrors with the layout under RTL.
    ...(horizontal === 'left' ? { start: edge } : { end: edge }),
  };

  const renderLabel = () => {
    if (typeof label !== 'string' && typeof label !== 'number') return label;
    return (
      <Text
        {...mergeSlotProps(
          {
            size: Math.max(9, Math.round(diameter * 0.55)),
            fw: '700' as const,
            c: onColor(theme, fill),
            style: { lineHeight: diameter },
          },
          labelProps
        )}
      >
        {label}
      </Text>
    );
  };

  const accessibility = accessibilityLabel
    ? a11yProps({ role: 'img', label: accessibilityLabel, accessible: true })
    : hasLabelText || children
      ? {}
      : DECORATIVE;

  return (
    <View ref={ref} style={[base, resolveStyleProps(styleProps, theme), style]} testID={testID} {...accessibility}>
      {hasLabelText ? renderLabel() : children}
    </View>
  );
}, { displayName: 'Indicator' });
