import React from 'react';
import { View, ViewProps, ViewStyle, StyleProp, DimensionValue } from 'react-native';

import { factory, Factory } from '../../core/factory';
import { SpacingProps, getSpacingStyles, LayoutProps, getLayoutStyles, extractSpacingProps, extractLayoutProps } from '../../core/utils';
import { SizeValue, getSpacing } from '../../core/theme/sizes';
import { useDirection } from '../../core/providers/DirectionProvider';

export interface FlexProps extends SpacingProps, LayoutProps, Omit<ViewProps, 'style'> {
  /** Flex direction */
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

  /** Custom styles */
  style?: StyleProp<ViewStyle>;

  /** Test ID for testing */
  testID?: string;

  /** Disable automatic RTL mirroring for row direction */
  disableRTLMirroring?: boolean;
}

export const Flex = factory<Factory<{ props: FlexProps; ref: View }>>(
  (props, ref) => {
    const { isRTL } = useDirection();
    const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
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
      // Everything Flex doesn't own — onLayout, accessibility props, nativeID,
      // pointerEvents, dataSet — forwards to the underlying View untouched.
      ...rest
    } = otherProps;

    // Mirror row direction in RTL unless explicitly disabled
    const getFlexDirection = (): ViewStyle['flexDirection'] => {
      if (disableRTLMirroring || !isRTL) {
        return direction;
      }

      // Mirror row directions in RTL
      switch (direction) {
        case 'row':
          return 'row-reverse';
        case 'row-reverse':
          return 'row';
        default:
          // column and column-reverse are not affected by RTL
          return direction;
      }
    };

    const flexStyle: ViewStyle = {
      display: 'flex',
      flexDirection: getFlexDirection(),
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap,
      ...(grow !== undefined && { flexGrow: grow }),
      ...(shrink !== undefined && { flexShrink: shrink }),
      ...(basis !== undefined && { flexBasis: basis }),
      ...(gap !== undefined && { gap: getSpacing(gap) }),
      ...(rowGap !== undefined && { rowGap: getSpacing(rowGap) }),
      ...(columnGap !== undefined && { columnGap: getSpacing(columnGap) })
    };

    const spacingStyle = getSpacingStyles(spacingProps);
    const layoutStyle = getLayoutStyles(layoutProps);

    return (
      <View
        {...rest}
        ref={ref}
        style={[flexStyle, spacingStyle, layoutStyle, style]}
        testID={testID}
      >
        {children}
      </View>
    );
  }
);
