import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Text } from '../Text';

import { factory } from '../../core/factory';
import { getSpacing } from '../../core/theme/sizes';
import { createRadiusStyles } from '../../core/theme/radius';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveVariantRoles } from '../../core/theme/variantRoles';
import { semanticIcons, type SemanticIconRole } from '../../core/theme/semanticIcons';
import { SpacingProps, getSpacingStyles, extractSpacingProps, mergeSlotProps } from '../../core/utils';
import { Icon } from '../Icon';

import type { AlertProps, AlertSeverity, AlertFactoryPayload } from './types';
import type { ThemeColor } from '../../core/theme/resolveColors';

// Helper function to map severity to theme colors
const getSeverityColor = (severity: AlertSeverity): ThemeColor => {
  switch (severity) {
    case 'info':
      return 'primary';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'primary';
  }
};

// Helper function to get default icon for severity
const getSeverityIcon = (severity: AlertSeverity): React.ReactNode => {
  const name = semanticIcons[severity as SemanticIconRole] ?? semanticIcons.info;
  return <Icon name={name} size="md" />;
};

function AlertBase(props: AlertProps, ref: React.Ref<View>) {
  const {
    variant = 'light',
    color = 'primary',
    severity,
    title,
    children,
    icon,
    fullWidth = false,
    withCloseButton = false,
    closeButtonLabel,
    onClose,
    radius = 'md',
    style,
    testID,
    titleProps,
    bodyProps,
    ...rest
  } = props;

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);

  const theme = useTheme();
  
  // Handle radius prop with 'md' as default for alerts  
  const radiusStyles = createRadiusStyles(radius || 'md');
  const padding = getSpacing('md');

  // Determine final color - severity overrides color prop
  const finalColor = severity ? getSeverityColor(severity) : color;
  
  // Determine final icon based on icon prop value
  const getFinalIcon = () => {
    // If icon is explicitly false, show no icon
    if (icon === false) {
      return null;
    }
    
    // If icon is a string, use it as an Icon name
    if (typeof icon === 'string') {
      return <Icon name={icon} size="md" />;
    }
    
    // If icon is a React component, use it as-is
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    // If icon is null or undefined and severity exists, use default severity icon
    if ((icon === null || icon === undefined) && severity) {
      return getSeverityIcon(severity);
    }
    
    // If icon is null or undefined and no severity, show no icon
    return null;
  };
  
  const finalIcon = getFinalIcon();

  // Resolve fill / border / text through the shared variant system so an Alert
  // matches Badge, Chip, and Button for the same variant+color on every theme
  // and color scheme (text/icon use measured contrast, not fixed palette steps).
  const roles = resolveVariantRoles(theme, { variant, color: finalColor });

  const alertStyles: ViewStyle = {
    ...radiusStyles,
    padding,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: roles.fill,
    borderWidth: 1,
    borderColor: roles.border,
    ...(fullWidth ? { width: '100%' as const } : {}),
  };
  const textColor = roles.text;
  const iconColor = roles.text;

  return (
    <View
      ref={ref}
      style={[alertStyles, spacingStyles, style]}
      testID={testID}
      accessibilityRole="alert"
      {...otherProps}
      {...spacingProps as SpacingProps}
    >
      {/* Icon */}
      {finalIcon && (
        <View style={{ marginRight: getSpacing('sm'), marginTop: 2 }}>
          {React.isValidElement(finalIcon)
            ? React.cloneElement(finalIcon as React.ReactElement<any>, {
              color: iconColor,
              size: 'md'
            })
            : finalIcon
          }
        </View>
      )}

      {/* Content */}
      <View style={{ flex: 1 }}>
        {title && (
          <Text
            {...mergeSlotProps(
              {
                size: 16,
                weight: '600',
                style: { color: textColor, marginBottom: children ? getSpacing('xs') : 0 },
              },
              titleProps
            )}
          >
            {title}
          </Text>
        )}

        {children && (
          <Text
            {...mergeSlotProps(
              { size: 14, lineHeight: 20, style: { color: textColor } },
              bodyProps
            )}
          >
            {children}
          </Text>
        )}
      </View>

      {/* Close Button */}
      {withCloseButton && (
        <TouchableOpacity
          onPress={onClose}
          style={{
            marginLeft: getSpacing('sm'),
            padding: getSpacing('xs'),
            marginTop: -getSpacing('xs'),
            marginRight: -getSpacing('xs')
          }}
          accessibilityLabel={closeButtonLabel || 'Close alert'}
          accessibilityRole="button"
        >
          <Icon name="x" color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export const Alert = factory<AlertFactoryPayload>(AlertBase);

Alert.displayName = 'Alert';
