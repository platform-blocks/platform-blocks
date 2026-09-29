import React from 'react';
import { View, type FlexAlignType } from 'react-native';
import { factory } from '../../core/factory/factory';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import type { FormGroupProps } from './types';

const ALIGN: Record<NonNullable<FormGroupProps['align']>, FlexAlignType> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
};

/** Groups form fields in a column, or in rows of `columns` equal-width cells. */
export const FormGroup = factory<{ props: FormGroupProps; ref: View }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    const { children, direction = 'column', columns = 2, spacing = 'md', align = 'stretch', style, testID } = otherProps;
    const theme = useTheme();
    const gap = resolveSpacing(theme, spacing) as number;
    const alignItems = ALIGN[align] ?? 'stretch';
    const rootStyle = [resolveStyleProps(styleProps, theme), style];

    if (direction === 'row') {
      const childArray = React.Children.toArray(children);
      const rows: React.ReactNode[][] = [];
      for (let i = 0; i < childArray.length; i += columns) {
        rows.push(childArray.slice(i, i + columns));
      }

      return (
        <View ref={ref} testID={testID} style={[{ gap }, rootStyle]}>
          {rows.map((row, rowIndex) => (
            // Rows are positional slots of a static layout, so the index is their identity.
            <View key={rowIndex} style={{ flexDirection: 'row', gap, alignItems }}>
              {row.map((child, colIndex) => (
                <View key={colIndex} style={{ flex: 1 }}>
                  {child}
                </View>
              ))}
              {/* Fill empty columns so the last row keeps the grid widths */}
              {row.length < columns &&
                Array.from({ length: columns - row.length }).map((_, emptyIndex) => (
                  <View key={`empty-${emptyIndex}`} style={{ flex: 1 }} />
                ))}
            </View>
          ))}
        </View>
      );
    }

    return (
      <View ref={ref} testID={testID} style={[{ gap, alignItems }, rootStyle]}>
        {children}
      </View>
    );
  },
  { displayName: 'FormGroup' }
);
