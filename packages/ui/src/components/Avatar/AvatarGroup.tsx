import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../core/theme';
import { Avatar } from './Avatar';
import { Tooltip } from '../Tooltip';
import type { AvatarGroupProps } from './types';

export function AvatarGroup({
  children,
  limit,
  spacing = -8,
  style,
  size,
  bordered = true,
  surplusTooltip,
}: AvatarGroupProps) {
  const theme = useTheme();
  
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = limit ? childrenArray.slice(0, limit) : childrenArray;
  const remainingCount = limit ? Math.max(0, childrenArray.length - limit) : 0;
  
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    ...StyleSheet.flatten(style),
  };

  const avatarWrapperStyle = (index: number): ViewStyle => ({
    marginLeft: index > 0 ? spacing : 0,
    zIndex: visibleChildren.length - index, // Stack avatars with decreasing z-index
    ...(bordered && {
      borderWidth: 2,
      borderColor: theme.colors.gray[0],
      borderRadius: 100, // Large value to ensure circular border
    }),
  });

  return (
    <View style={containerStyle}>
      {visibleChildren.map((child, index) => {
        if (React.isValidElement(child)) {
          return (
            <View key={index} style={avatarWrapperStyle(index)}>
              {size ? React.cloneElement(child, { size, ...(child.props as any) }) : child}
            </View>
          );
        }
        return null;
      })}
      
      {remainingCount > 0 && (() => {
        const surplus = (
          <View style={avatarWrapperStyle(visibleChildren.length)}>
            <Avatar
              fallback={`+${remainingCount}`}
              backgroundColor={theme.colors.gray[6]}
              textColor={theme.colors.gray[0]}
              size={size}
            />
          </View>
        );
        return surplusTooltip
          ? <Tooltip label={surplusTooltip} maxWidth={220}>{surplus}</Tooltip>
          : surplus;
      })()}
    </View>
  );
}
