import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { Tooltip } from '../Tooltip';
import { Avatar } from './Avatar';
import type { AvatarGroupProps, AvatarProps } from './types';

const ROW: ViewStyle = { flexDirection: 'row', alignItems: 'center' };

/**
 * Overlapping avatars. With `limit`, the rest collapse into a `+N` avatar
 * (named "N more" for screen readers).
 */
export const AvatarGroup = factory<{ props: AvatarGroupProps; ref: View }>((props, ref) => {
  const {
    children,
    limit,
    spacing = -8,
    style,
    size,
    bordered = true,
    surplusTooltip,
    surplusLabel,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);

  const childrenArray = React.Children.toArray(children).filter(React.isValidElement);
  const visibleChildren = limit ? childrenArray.slice(0, limit) : childrenArray;
  const remainingCount = limit ? Math.max(0, childrenArray.length - limit) : 0;

  const wrapperStyle = (index: number): ViewStyle => ({
    marginStart: index > 0 ? spacing : 0,
    // Earlier avatars stack above later ones.
    zIndex: visibleChildren.length - index,
    ...(bordered ? { borderWidth: 2, borderColor: theme.backgrounds.surface, borderRadius: 9999 } : null),
  });

  const surplus =
    remainingCount > 0 ? (
      <View style={wrapperStyle(visibleChildren.length)}>
        <Avatar
          fallback={`+${remainingCount}`}
          bg={theme.text.secondary}
          size={size}
          accessibilityLabel={surplusLabel ?? `${remainingCount} more`}
        />
      </View>
    ) : null;

  return (
    <View ref={ref} style={[ROW, resolveStyleProps(styleProps, theme), style]} testID={testID}>
      {visibleChildren.map((child, index) => (
        <View key={child.key ?? index} style={wrapperStyle(index)}>
          {size !== undefined
            ? React.cloneElement(child as React.ReactElement<AvatarProps>, {
                size: (child.props as AvatarProps).size ?? size,
              })
            : child}
        </View>
      ))}
      {surplus && surplusTooltip ? (
        <Tooltip label={surplusTooltip} maw={220}>
          {surplus}
        </Tooltip>
      ) : (
        surplus
      )}
    </View>
  );
}, { displayName: 'AvatarGroup' });
