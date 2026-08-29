import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { factory } from '../../core/factory';
import { useTheme } from '../../core/theme';
import { getSpacing, getHeight, getFontSize } from '../../core/theme/sizes';
import { createRadiusStyles } from '../../core/theme/radius';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { 
  getSpacingStyles, 
  getLayoutStyles, 
  extractSpacingProps, 
  extractLayoutProps 
} from '../../core/utils';
import { Text } from '../Text';
import { useDisclaimer, extractDisclaimerProps } from '../_internal/Disclaimer';
import { ToggleButtonProps, ToggleGroupProps, ToggleGroupContextValue } from './types';

// Create context for toggle group
const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

// Hook to use toggle group context
const useToggleGroup = () => {
  return useContext(ToggleGroupContext);
};

// Helper function to get toggle button styles
const getToggleButtonStyles = (
  theme: any,
  selected: boolean,
  disabled: boolean,
  size: any,
  color?: string,
  variant?: 'solid' | 'ghost',
  isFirst?: boolean,
  isLast?: boolean,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) => {
  const height = getHeight(size);
  const horizontalSpacing = getSpacing(size);
  
  const baseColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
  
  const isGhost = variant === 'ghost';
  
  const baseStyles = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height,
    minHeight: height,
    paddingHorizontal: horizontalSpacing,
    paddingVertical: 2,
    borderWidth: isGhost ? 0 : 1,
    backgroundColor: selected ? (isGhost ? theme.colors.gray[2] : baseColor) : 'transparent',
    borderColor: isGhost ? 'transparent' : baseColor,
    opacity: disabled ? 0.5 : 1,
  };

  // Handle border radius for grouped buttons
  const radiusStyles: any = {};
  const radius = 6; // Default border radius
  
  if (orientation === 'horizontal') {
    if (isFirst && !isLast) {
      radiusStyles.borderTopLeftRadius = radius;
      radiusStyles.borderBottomLeftRadius = radius;
      radiusStyles.borderTopRightRadius = 0;
      radiusStyles.borderBottomRightRadius = 0;
      radiusStyles.borderRightWidth = 0;
    } else if (isLast && !isFirst) {
      radiusStyles.borderTopRightRadius = radius;
      radiusStyles.borderBottomRightRadius = radius;
      radiusStyles.borderTopLeftRadius = 0;
      radiusStyles.borderBottomLeftRadius = 0;
    } else if (!isFirst && !isLast) {
      radiusStyles.borderRadius = 0;
      radiusStyles.borderRightWidth = 0;
    } else {
      radiusStyles.borderRadius = radius;
    }
  } else {
    // Vertical orientation
    if (isFirst && !isLast) {
      radiusStyles.borderTopLeftRadius = radius;
      radiusStyles.borderTopRightRadius = radius;
      radiusStyles.borderBottomLeftRadius = 0;
      radiusStyles.borderBottomRightRadius = 0;
      radiusStyles.borderBottomWidth = 0;
    } else if (isLast && !isFirst) {
      radiusStyles.borderBottomLeftRadius = radius;
      radiusStyles.borderBottomRightRadius = radius;
      radiusStyles.borderTopLeftRadius = 0;
      radiusStyles.borderTopRightRadius = 0;
    } else if (!isFirst && !isLast) {
      radiusStyles.borderRadius = 0;
      radiusStyles.borderBottomWidth = 0;
    } else {
      radiusStyles.borderRadius = radius;
    }
  }

  return {
    ...baseStyles,
    ...radiusStyles,
  };
};

// ToggleButton component
/**
 * A toggle button component for use within toggle groups or as standalone controls.
 * Supports selection states, various sizes, and visual variants.
 */
export const ToggleButton = factory<{
  props: ToggleButtonProps;
  ref: View;
}>((props, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
  const { layoutProps, otherProps } = extractLayoutProps(propsAfterSpacing);
  
  const {
    value,
    selected: selectedProp,
    onPress: onPressProp,
    disabled: disabledProp,
    children,
    size: sizeProp,
    color: colorProp,
    variant: variantProp,
    style,
    testID,
    ...restProps
  } = otherProps;

  const theme = useTheme();
  const groupContext = useToggleGroup();
  
  // Use group context values as fallbacks
  const selected = selectedProp ?? (
    groupContext 
      ? Array.isArray(groupContext.value) 
        ? groupContext.value.includes(value)
        : groupContext.value === value
      : false
  );
  
  const disabled = disabledProp ?? groupContext?.disabled ?? false;
  const size = sizeProp ?? groupContext?.size ?? 'md';
  // A button's own color wins over the group's.
  const color = colorProp ?? groupContext?.color;
  const variant = variantProp ?? groupContext?.variant ?? 'solid';

  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);
  
  // For standalone buttons, use full border radius
  const buttonStyles = useMemo(() => {
    if (!groupContext) {
      // Standalone button
      const height = getHeight(size);
      const horizontalSpacing = getSpacing(size);
      
      const baseColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
      
      const isGhost = variant === 'ghost';
      return {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        height,
        minHeight: height,
        paddingHorizontal: horizontalSpacing,
        paddingVertical: 2,
        borderWidth: isGhost ? 0 : 1,
        borderRadius: 6,
        // backgroundColor: selected ? (isGhost ? theme.colors.gray[2] : baseColor) : 'transparent',
        borderColor: isGhost ? 'transparent' : baseColor,
        opacity: disabled ? 0.5 : 1,
      };
    }
    
    // This will be set by the group
    return {};
  }, [theme, selected, disabled, size, color, groupContext, variant]);

  const textColor = useMemo(() => {
    const baseColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
    
    if (variant === 'ghost') {
      return selected ? theme.colors.primary[7] : baseColor;
    }
    return selected ? '#FFFFFF' : baseColor;
  }, [selected, color, theme.colors.primary, variant]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (groupContext?.onChange) {
      groupContext.onChange(value);
    } else if (onPressProp) {
      onPressProp(value);
    }
  }, [disabled, groupContext, value, onPressProp]);

  return (
    <View style={[spacingStyles, layoutStyles]} ref={ref}>
      <Pressable
        style={[buttonStyles, style]}
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        {...restProps}
      >
        {typeof children === 'string' ? (
          <Text 
            size={size} 
            weight="600" 
            color={textColor}
            selectable={false}
            style={{ 
              lineHeight: getFontSize(size) * 1.3,
              textAlignVertical: 'center' as const
            }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    </View>
  );
});

// ToggleGroup component
/**
 * A group of toggle buttons that manages selection state and provides keyboard navigation.
 * Supports single or multi-selection modes with customizable orientation and styling.
 */
export const ToggleGroup = factory<{
  props: ToggleGroupProps;
  ref: View;
}>((props, ref) => {
  const { spacingProps, otherProps: propsAfterSpacing } = extractSpacingProps(props);
  const { layoutProps, otherProps: propsAfterLayout } = extractLayoutProps(propsAfterSpacing);
  const { disclaimerProps: disclaimerData, otherProps } = extractDisclaimerProps(propsAfterLayout as ToggleGroupProps);
  
  const {
    value,
    onChange,
    exclusive = false,
    disabled = false,
    size = 'md',
    color,
    variant,
    orientation = 'horizontal',
    required = false,
    style,
    children,
    testID,
    ...restProps
  } = otherProps;

  const theme = useTheme();
  const renderDisclaimer = useDisclaimer(disclaimerData.disclaimer, disclaimerData.disclaimerProps);
  
  const spacingStyles = getSpacingStyles(spacingProps);
  const layoutStyles = getLayoutStyles(layoutProps);

  const containerStyles = useMemo(() => ({
    flexDirection: orientation === 'horizontal' ? 'row' as const : 'column' as const,
    alignItems: 'stretch' as const,
  }), [orientation]);

  const handleChange = useCallback((buttonValue: string | number) => {
    if (!onChange) return;
    
    if (exclusive) {
      // Exclusive mode - only one can be selected
      if (required && value === buttonValue) {
        // Don't allow deselecting if required and this is the only selected
        return;
      }
      // For exclusive mode, pass the buttonValue or an empty array to represent no selection
      onChange(value === buttonValue ? [] : buttonValue);
    } else {
      // Multiple selection mode
      const currentValues = Array.isArray(value) ? value : (value !== undefined ? [value] : []);
      const isSelected = currentValues.includes(buttonValue);
      
      if (isSelected) {
        const newValues = currentValues.filter(v => v !== buttonValue);
        if (required && newValues.length === 0) {
          // Don't allow deselecting all if required
          return;
        }
        onChange(newValues);
      } else {
        onChange([...currentValues, buttonValue]);
      }
    }
  }, [value, onChange, exclusive, required]);

  const contextValue = useMemo<ToggleGroupContextValue>(() => ({
    value,
    onChange: handleChange,
    exclusive,
    disabled,
    size,
    color,
    variant,
    required,
  }), [value, handleChange, exclusive, disabled, size, color, variant, required]);

  // Clone children with position info for styling
  const childrenWithProps = useMemo(() => {
    const childArray = React.Children.toArray(children);
    
    return childArray.map((child, index) => {
      if (React.isValidElement<ToggleButtonProps>(child) && child.type === ToggleButton) {
        const isFirst = index === 0;
        const isLast = index === childArray.length - 1;
        
        const buttonValue = child.props.value;
        const selected = Array.isArray(value) 
          ? value.includes(buttonValue)
          : value === buttonValue;
        
        const effectiveVariant = (child.props as any).variant ?? variant;
        const effectiveColor = (child.props as any).color ?? color;
        const buttonStyles = getToggleButtonStyles(
          theme,
          selected,
          disabled || (child.props.disabled ?? false),
          size,
          effectiveColor,
          effectiveVariant,
          isFirst,
          isLast,
          orientation
        );        return React.cloneElement(child, {
          ...child.props,
          style: [buttonStyles, child.props.style],
        });
      }
      
      return child;
    });
  }, [children, value, theme, disabled, size, color, orientation]);

  const disclaimerNode = renderDisclaimer();

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <View style={spacingStyles}>
        <View 
          style={[containerStyles, layoutStyles, style]} 
          ref={ref}
          testID={testID}
          {...restProps}
        >
          {childrenWithProps}
        </View>
        {disclaimerNode ? (
          <View style={{ width: '100%' }}>
            {disclaimerNode}
          </View>
        ) : null}
      </View>
    </ToggleGroupContext.Provider>
  );
});

// Set display names
ToggleButton.displayName = 'ToggleButton';
ToggleGroup.displayName = 'ToggleGroup';
