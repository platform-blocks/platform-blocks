import React from 'react';
import { Pressable, type View } from 'react-native';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { DESIGN_TOKENS } from '../../core';
import { getCurrentPeriodStyles } from './currentPeriod';
import { getDaySize } from './utils';
import type { DayProps } from './types';

// `DayProps` carries an index signature, which makes React's `PropsWithoutRef`
// collapse every prop to `any`. Annotating the render function's parameter
// directly keeps the real prop types inside the component body.
const DayBase = ({
  date,
  selected = false,
  inRange = false,
  firstInRange = false,
  lastInRange = false,
  previewed = false,
  previewedInRange = false,
  previewedFirstInRange = false,
  previewedLastInRange = false,
  weekend = false,
  outside = false,
  today = false,
  disabled = false,
  onPress,
  onMouseEnter,
  onMouseLeave,
  size = 'md',
  style,
  children,
  ...otherProps
}: DayProps, ref: React.Ref<View>) => {
  const theme = useTheme();
  
  const daySize = getDaySize(size);

  const fontSize = {
    xs: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    '2xl': 'lg',
    '3xl': 'lg',
  }[size] as 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  const getBackgroundColor = () => {
    if (disabled) return 'transparent';
    if (selected) return theme.colors.primary[5];
    if (inRange) return theme.colors.primary[1];
    if (previewed && !inRange) return theme.colors.primary[2];
    if (previewedInRange) return theme.colors.primary[1];
    // `today` is drawn as a ring, not a fill — see ./currentPeriod.
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.gray[4];
    if (selected) return 'white';
    if (outside) return theme.colors.gray[4];
    if (weekend && !selected) return theme.colors.gray[6];
    if (today && !selected) return theme.colors.primary[6];
    return theme.colors.gray[9];
  };

  const getBorderRadius = () => {
    if (previewedFirstInRange && !previewedLastInRange) {
      return { borderTopLeftRadius: daySize / 2, borderBottomLeftRadius: daySize / 2 };
    }
    if (previewedLastInRange && !previewedFirstInRange) {
      return { borderTopRightRadius: daySize / 2, borderBottomRightRadius: daySize / 2 };
    }
    if (previewedFirstInRange && previewedLastInRange) {
      return { borderRadius: daySize / 2 };
    }
    if (firstInRange && !lastInRange) {
      return { borderTopLeftRadius: daySize / 2, borderBottomLeftRadius: daySize / 2 };
    }
    if (lastInRange && !firstInRange) {
      return { borderTopRightRadius: daySize / 2, borderBottomRightRadius: daySize / 2 };
    }
    if (selected || (firstInRange && lastInRange)) {
      return { borderRadius: daySize / 2 };
    }
    // Keep the today ring circular when the day isn't part of a range strip.
    if (today) {
      return { borderRadius: daySize / 2 };
    }
    return {};
  };

  const defaultContent = (
    <Text
      size={fontSize}
      weight={today || selected ? 'semibold' : 'medium'}
      style={{ 
        color: getTextColor(),
        fontSize: fontSize === 'xs' ? DESIGN_TOKENS.typography.fontSize.xs : fontSize === 'sm' ? DESIGN_TOKENS.typography.fontSize.sm : DESIGN_TOKENS.typography.fontSize.md,
      }}
    >
      {date.getDate()}
    </Text>
  );

  return (
    <Pressable
      ref={ref}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: daySize,
          height: daySize,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: getBackgroundColor(),
          opacity: pressed && !disabled ? 0.8 : 1,
          ...getCurrentPeriodStyles(theme, { isCurrent: today && !disabled, isSelected: selected }),
          ...getBorderRadius(),
        },
        style,
      ]}
      android_ripple={
        !disabled
          ? {
              color: theme.colors.primary[2],
              borderless: false,
              radius: daySize / 2,
            }
          : undefined
      }
      // Web-specific mouse events
      {...(onMouseEnter && { onMouseEnter })}
      {...(onMouseLeave && { onMouseLeave })}
      {...otherProps}
    >
      {children || defaultContent}
    </Pressable>
  );
};

// The same index-signature collapse breaks `forwardRef`'s own inference, so the
// public type is stated explicitly rather than derived.
export const Day = React.forwardRef(DayBase as any) as React.ForwardRefExoticComponent<
  DayProps & React.RefAttributes<View>
>;

Day.displayName = 'Day';