import React from 'react';
import { View } from 'react-native';
import { DESIGN_TOKENS } from '../../core';
import type { FormGroupProps } from './types';

export const FormGroup = React.forwardRef<View, FormGroupProps>(({
  children,
  direction = 'column',
  columns = 2,
  spacing = 'md',
  align = 'stretch',
}, ref) => {
  const getSpacing = () => {
    switch (spacing) {
      case 'xs': return DESIGN_TOKENS.spacing.xs;
      case 'sm': return DESIGN_TOKENS.spacing.sm;
      case 'md': return DESIGN_TOKENS.spacing.md;
      case 'lg': return DESIGN_TOKENS.spacing.lg;
      default: return DESIGN_TOKENS.spacing.md;
    }
  };

  const getAlignItems = () => {
    switch (align) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'stretch': return 'stretch';
      default: return 'stretch';
    }
  };

  if (direction === 'row') {
    // Row layout with columns
    const childArray = React.Children.toArray(children);
    const rows = [];
    
    for (let i = 0; i < childArray.length; i += columns) {
      rows.push(childArray.slice(i, i + columns));
    }

    return (
      <View style={{ gap: getSpacing() }}>
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: 'row',
              gap: getSpacing(),
              alignItems: getAlignItems(),
            }}
          >
            {row.map((child, colIndex) => (
              <View key={colIndex} style={{ flex: 1 }}>
                {child}
              </View>
            ))}
            {/* Fill empty columns */}
            {row.length < columns && 
              Array.from({ length: columns - row.length }).map((_, emptyIndex) => (
                <View key={`empty-${emptyIndex}`} style={{ flex: 1 }} />
              ))
            }
          </View>
        ))}
      </View>
    );
  }

  // Column layout
  return (
    <View
      ref={ref}
      style={{
        gap: getSpacing(),
        alignItems: getAlignItems(),
      }}
    >
      {children}
    </View>
  );
});

FormGroup.displayName = 'FormGroup';