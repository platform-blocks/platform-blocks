import React from 'react';
import type { View } from 'react-native';

import { factory } from '../../core/factory';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import { Button } from '../Button/Button';
import { resolveAccentTextColor, resolveRoleColor } from '../Button/styles';
import type { ButtonVariant } from '../Button/types';
import { Icon } from '../Icon/Icon';
import type { IconButtonProps, IconButtonVariant } from './types';

/** Icon size as a share of the button height. */
const ICON_TO_HEIGHT = 0.5;

/**
 * IconButton variants on Button's: a tinted `secondary` is Button's `light`;
 * everything else maps one to one.
 */
function toButtonVariant(variant: IconButtonVariant, hasColor: boolean): ButtonVariant {
  return variant === 'secondary' && hasColor ? 'light' : variant;
}

/**
 * A square, icon-only Button. Built on `Button`, so it shares its size table
 * (an IconButton is exactly as tall as a Button of the same `size`), press
 * animation, focus ring and accessibility. Needs an accessible name:
 * `accessibilityLabel`, or a `tooltip`, whose text becomes the name.
 */
export const IconButton = factory<{ props: IconButtonProps; ref: View }>(
  (props, ref) => {
    const {
      icon,
      variant = 'default',
      size = 'md',
      color,
      iconColor,
      iconVariant,
      iconSize,
      ...rest
    } = props;

    const theme = useTheme();
    const control = getControlSize(theme, size);

    // Neutral variants keep their chrome and tint only the icon when a color is given.
    const tintsIconOnly = variant === 'default' || variant === 'none';
    const resolvedIconColor = iconColor
      ? resolveAccentColor(theme, iconColor) ?? iconColor
      : color && tintsIconOnly
        ? resolveAccentTextColor(theme, resolveRoleColor(theme, color))
        : variant === 'none'
          ? theme.text.secondary
          : undefined;

    const iconSource = typeof icon === 'string' ? { name: icon } : { icon };

    return (
      <Button
        ref={ref}
        {...rest}
        variant={toButtonVariant(variant, color != null)}
        size={size}
        color={color}
        icon={
          <Icon
            {...iconSource}
            size={iconSize ?? Math.round(control.height * ICON_TO_HEIGHT)}
            color={resolvedIconColor}
            variant={iconVariant}
          />
        }
      />
    );
  },
  { displayName: 'IconButton' }
);
