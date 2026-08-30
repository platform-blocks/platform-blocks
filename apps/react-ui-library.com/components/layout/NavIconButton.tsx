import React from 'react';
import { ViewStyle } from 'react-native';
import { Icon, Tooltip, useAppShell, useTheme } from '@platform-blocks/react-ui-library';
import { PressAnimation } from '@platform-blocks/react-ui-library';

export interface NavIconButtonProps {
  /** Icon name */
  icon: string;
  /** Icon size (default: 'lg') */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Icon color (uses theme.text.primary by default) */
  color?: string;
  /** Button press handler */
  onPress: () => void;
  /** Accessibility label */
  accessibilityLabel: string;
  /** Tooltip label */
  tooltipLabel?: string;
  /** Hit slop for better touch targets */
  hitSlop?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Disable the button */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
  /** Icon variant */
  variant?: 'filled' | 'outlined';
  /** Margin - supports theme spacing values, numbers (pixels), or 'auto' */
  m?: number | 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Hover in handler (Pressable web) */
  onHoverIn?: (...args: any[]) => void;
  /** Hover out handler (Pressable web) */
  onHoverOut?: (...args: any[]) => void;
  /** Focus handler */
  onFocus?: (...args: any[]) => void;
  /** Blur handler */
  onBlur?: (...args: any[]) => void;
}

/**
 * Standardized navigation icon button with consistent press animations,
 * proper hit targets, and accessibility support.
 */
export const NavIconButton: React.FC<NavIconButtonProps> = ({
  icon,
  size = 'lg',
  color,
  onPress,
  accessibilityLabel,
  tooltipLabel,
  hitSlop = 8,
  style,
  disabled = false,
  testID,
  variant,
  m,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
}) => {
  const theme = useTheme();
  const { headerHeight } = useAppShell();

  const headerOffset = typeof headerHeight === 'number' ? headerHeight * 0.25 : 8;
  const iconColor = color || theme.text.primary;
  const disabledColor = theme.text.disabled;

  const button = (
    <PressAnimation
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{
        ...(style as any),
        margin: m as any,
        marginStart: headerOffset,
      }}
      variant="both"
      pressScale={0.9}
      pressOpacity={0.7}
      disableAnimation={disabled}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <Icon
        name={icon}
        size={size}
        color={disabled ? disabledColor : iconColor}
        variant={variant}
      />
    </PressAnimation>
  );

  if (!tooltipLabel) {
    return button;
  }

  return (
    <Tooltip label={tooltipLabel} position="bottom" withArrow>
      {button}
    </Tooltip>
  );
};

