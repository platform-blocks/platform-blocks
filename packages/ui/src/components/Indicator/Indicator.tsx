import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { COMPONENT_SIZES } from '../../core/theme/sizes';
import { mergeSlotProps } from '../../core/utils';
import type { IndicatorProps } from './types';

/**
 * Indicator: a small indicator positioned on the corner of a parent container.
 * Usage: Wrap target with a relative container and place <Indicator /> as a sibling.
 *
 * Pass `label` to render text content (e.g. a count); the dot expands to a pill
 * so multi-digit values fit. For custom content (icon, status dot variations),
 * use `children` instead.
 */
export function Indicator({
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
  invisible,
}: IndicatorProps) {
  const theme = useTheme();
  if (invisible) return null;

  const finalColor = color || theme.colors.success[5];
  const ringColor = borderColor || theme.colors.surface[0];

  // Resolve size to a number
  const resolvedSize = typeof size === 'number'
    ? size
    : COMPONENT_SIZES.badge[size];

  // When a `label` is provided, expand the dot to a pill so multi-digit counts
  // (e.g. "12", "99+") fit. Plain dots stay perfectly circular.
  const hasLabelText = label !== undefined && label !== null && label !== '';
  const horizontalPadding = hasLabelText ? Math.max(4, Math.round(resolvedSize / 3)) : 0;

  const base: ViewStyle = {
    position: 'absolute',
    minWidth: hasLabelText ? resolvedSize : undefined,
    width: hasLabelText ? undefined : resolvedSize,
    height: resolvedSize,
    paddingHorizontal: horizontalPadding,
    borderRadius: resolvedSize / 2,
    backgroundColor: finalColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth,
    borderColor: ringColor,
  };

  // Corner placement
  switch (placement) {
    case 'top-left':
      base.top = offset * -1;
      base.left = offset * -1;
      break;
    case 'top-right':
      base.top = offset * -1;
      base.right = offset * -1;
      break;
    case 'bottom-left':
      base.bottom = offset * -1;
      base.left = offset * -1;
      break;
    case 'bottom-right':
    default:
      base.bottom = offset * -1;
      base.right = offset * -1;
      break;
  }

  const renderLabel = () => {
    if (!hasLabelText) return null;
    if (typeof label !== 'string' && typeof label !== 'number') {
      return label as React.ReactNode;
    }
    return (
      <Text
        {...mergeSlotProps(
          {
            size: Math.max(9, Math.round(resolvedSize * 0.55)),
            weight: '700' as const,
            color: (theme.text as any)?.onPrimary || '#FFFFFF',
            style: { lineHeight: resolvedSize },
          },
          labelProps,
        )}
      >
        {label}
      </Text>
    );
  };

  return (
    <View style={[base, style]}>
      {hasLabelText ? renderLabel() : children}
    </View>
  );
}
