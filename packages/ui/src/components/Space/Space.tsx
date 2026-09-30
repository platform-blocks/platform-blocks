import React, { useMemo } from 'react';
import { View, type DimensionValue, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { SpacingValue } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import type { SpaceProps } from './types';

/** `w` / `h` / `size` → a dimension: spacing tokens resolve through `theme.spacing`, `'full'` is 100%. */
function resolveDimension(
  theme: Parameters<typeof resolveSpacing>[0],
  value?: SpaceProps['w']
): DimensionValue | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  if (value === 'full') return '100%';
  if (value === 'auto' || value.endsWith('%')) return value as DimensionValue;
  const resolved = resolveSpacing(theme, value as SpacingValue);
  return typeof resolved === 'number' ? resolved : undefined;
}

/** A fixed-size gap between siblings. Height `size` (default `md`) unless `h` / `w` is given. */
export const Space = factory<{ props: SpaceProps; ref: View }>((props, ref) => {
  const theme = useTheme();
  // `w` / `h` are the spacer itself (and accept spacing tokens), so they are
  // resolved here rather than with the other style props.
  const { h, w, ...propsWithoutSize } = props;
  const { styleProps, otherProps } = extractStyleProps(propsWithoutSize);
  const { size = 'md', style, ...rest } = otherProps;

  const spacerStyle = useMemo((): ViewStyle => {
    const height = resolveDimension(theme, h);
    const width = resolveDimension(theme, w);
    return {
      height: height ?? (width == null ? resolveDimension(theme, size) ?? 0 : undefined),
      width,
      flexShrink: 0,
    };
  }, [theme, h, w, size]);
  const spacingStyle = useStyleProps(styleProps);

  return <View ref={ref} style={[spacerStyle, spacingStyle, style]} {...rest} />;
}, { displayName: 'Space' });
