import React, { useEffect, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Text } from '../Text';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { announce } from '../../core/accessibility/announce';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { isNative, isWeb } from '../../core/platform/flags';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveVariantRoles } from '../../core/theme/variantRoles';
import { semanticIcons, type SemanticIconRole } from '../../core/theme/semanticIcons';
import { resolveIconSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { Icon } from '../Icon';

import type { AlertProps, AlertSeverity, AlertFactoryPayload } from './types';
import type { ThemeColor } from '../../core/theme/resolveColors';

/** Minimum close-button target: WCAG 2.2 target size on web, the platform guideline on native. */
const CLOSE_TARGET = isWeb ? 24 : 44;
const DEFAULT_CLOSE_LABEL = 'Close';

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1 },
  content: { flex: 1 },
  close: { minWidth: CLOSE_TARGET, minHeight: CLOSE_TARGET, alignItems: 'center', justifyContent: 'center' },
  closePressed: { opacity: 0.6 },
});

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

/**
 * Urgent alerts interrupt (`role="alert"`, assertive); the rest are polite
 * status messages. Decided by `severity` when given, else by the palette the
 * `color` names (`'error'`, `'warning.6'`, …). Variant is visual only.
 */
const isUrgent = (severity: AlertSeverity | undefined, color: ThemeColor | undefined): boolean => {
  if (severity) return severity === 'error' || severity === 'warning';
  const palette = typeof color === 'string' ? color.split('.')[0] : undefined;
  return palette === 'error' || palette === 'warning';
};

// Helper function to get default icon for severity
const getSeverityIcon = (severity: AlertSeverity): React.ReactNode => {
  const name = semanticIcons[severity as SemanticIconRole] ?? semanticIcons.info;
  return <Icon name={name} size="md" />;
};

type IconElementProps = { color?: string; size?: SizeValue };

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

  const { styleProps, otherProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);

  const theme = useTheme();

  // Determine final color - severity overrides color prop
  const finalColor = severity ? getSeverityColor(severity) : color;
  const urgent = isUrgent(severity, color);

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
  const themed = useMemo(() => {
    const roles = resolveVariantRoles(theme, { variant, color: finalColor });
    const gapSm = resolveSpacing(theme, 'sm');
    const gapXs = resolveSpacing(theme, 'xs');
    const iconSize = resolveIconSize(theme, 'md');
    // The close target is larger than its icon; negative margins give the
    // difference back so the alert's layout doesn't grow.
    const targetInset = -(CLOSE_TARGET - iconSize) / 2;
    const root: ViewStyle = {
      borderRadius: resolveRadius(theme, radius),
      padding: resolveSpacing(theme, 'md'),
      backgroundColor: roles.fill,
      borderColor: roles.border,
    };
    return {
      roles,
      iconSize,
      root,
      iconWrap: { marginEnd: gapSm, marginTop: 2 } as ViewStyle,
      titleGap: gapXs === 'auto' ? 0 : gapXs,
      close: { marginStart: gapSm, marginTop: targetInset, marginEnd: targetInset, marginBottom: targetInset } as ViewStyle,
    };
  }, [theme, variant, finalColor, radius]);

  const textColor = themed.roles.text;
  const iconColor = themed.roles.text;

  // iOS has no live regions, and Android only announces changes: speak urgent
  // alerts when they appear (and when their message changes).
  const spokenMessage = urgent && isNative ? [title, getNodeText(children)].filter(Boolean).join('. ') : '';
  useEffect(() => {
    if (spokenMessage) announce(spokenMessage, { politeness: 'assertive' });
  }, [spokenMessage]);

  return (
    <View
      ref={ref}
      style={[styles.root, themed.root, fullWidth ? { width: '100%' } : null, spacingStyles, style]}
      testID={testID}
      {...a11yProps({ role: urgent ? 'alert' : 'status' })}
      {...otherProps}
    >
      {/* Icon */}
      {finalIcon && (
        <View style={themed.iconWrap}>
          {React.isValidElement<IconElementProps>(finalIcon)
            ? React.cloneElement(finalIcon, {
              color: iconColor,
              size: 'md'
            })
            : finalIcon
          }
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {title && (
          <Text
            {...mergeSlotProps(
              {
                size: 'lg',
                fw: '600',
                style: { color: textColor, marginBottom: children ? themed.titleGap : 0 },
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
              { size: 'md', lh: 20, style: { color: textColor } },
              bodyProps
            )}
          >
            {children}
          </Text>
        )}
      </View>

      {/* Close Button */}
      {withCloseButton && (
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.close, themed.close, pressed ? styles.closePressed : null]}
          {...a11yProps({ role: 'button', label: closeButtonLabel || DEFAULT_CLOSE_LABEL })}
        >
          <Icon name="x" size={themed.iconSize} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
}

export const Alert = factory<AlertFactoryPayload>(AlertBase, { displayName: 'Alert' });

Alert.displayName = 'Alert';
