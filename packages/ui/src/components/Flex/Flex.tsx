import React, { useMemo } from 'react';
import { View, type DimensionValue, type ViewProps, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import { extractLayoutProps, getLayoutStyles, type LayoutProps } from '../../core/utils/layout';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';

export interface FlexProps
  extends BaseProps<ViewStyle>,
    LayoutProps,
    Omit<ViewProps, 'style' | 'testID' | 'children'> {
  /**
   * Flex direction. `row` already follows the layout direction (it runs
   * right-to-left in RTL on both React Native and the web).
   */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';

  /** Align items on the cross axis */
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';

  /** Justify content on the main axis */
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';

  /** Flex wrap */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

  /** Gap between children (applies to both row and column gap) */
  gap?: SizeValue;

  /** Row gap between children */
  rowGap?: SizeValue;

  /** Column gap between children */
  columnGap?: SizeValue;

  /** Flex grow */
  grow?: number;

  /** Flex shrink */
  shrink?: number;

  /** Flex basis */
  basis?: DimensionValue;

  /** Children elements */
  children?: React.ReactNode;

  /**
   * Keep left-to-right order even in right-to-left layouts (e.g. media
   * controls, number pads). Lays this container's subtree out LTR.
   */
  disableRTLMirroring?: boolean;
}

const gapValue = (theme: Parameters<typeof resolveSpacing>[0], value: SizeValue | undefined) => {
  if (value === undefined) return undefined;
  const resolved = resolveSpacing(theme, value);
  return typeof resolved === 'number' ? resolved : undefined;
};

export const Flex = factory<{ props: FlexProps; ref: View }>(
  (props, ref) => {
    const theme = useTheme();
    const { styleProps, otherProps: propsAfterSpacing } = extractStyleProps(props);
    const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);

    const {
      direction = 'row',
      align = 'flex-start',
      justify = 'flex-start',
      wrap = 'nowrap',
      gap = 'sm',
      rowGap,
      columnGap,
      grow,
      shrink,
      basis,
      children,
      style,
      testID,
      disableRTLMirroring = false,
      // Everything Flex doesn't own — onLayout, role / aria-*, nativeID,
      // pointerEvents, dataSet — forwards to the underlying View untouched.
      ...rest
    } = otherProps;

    const flexStyle = useMemo((): ViewStyle => {
      const style: ViewStyle = {
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
      };
      if (grow !== undefined) style.flexGrow = grow;
      if (shrink !== undefined) style.flexShrink = shrink;
      if (basis !== undefined) style.flexBasis = basis;
      const g = gapValue(theme, gap);
      if (g !== undefined) style.gap = g;
      const rg = gapValue(theme, rowGap);
      if (rg !== undefined) style.rowGap = rg;
      const cg = gapValue(theme, columnGap);
      if (cg !== undefined) style.columnGap = cg;
      if (disableRTLMirroring) style.direction = 'ltr';
      return style;
    }, [theme, direction, align, justify, wrap, grow, shrink, basis, gap, rowGap, columnGap, disableRTLMirroring]);

    const spacingStyle = useStyleProps(styleProps);
    const layoutStyle = getLayoutStyles(layoutProps);

    return (
      // `fullWidth` before the style props, so an explicit `w` wins.
      <View {...rest} ref={ref} style={[flexStyle, layoutStyle, spacingStyle, style]} testID={testID}>
        {children}
      </View>
    );
  },
  { displayName: 'Flex' }
);
