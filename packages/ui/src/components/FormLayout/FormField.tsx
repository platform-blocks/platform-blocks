import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { DESIGN_TOKENS } from '../../core';
import { useTheme } from '../../core/theme';
import type { FormFieldProps } from './types';

export const FormField = React.forwardRef<View, FormFieldProps>(({
  label,
  description,
  error,
  required = false,
  children,
  width = 'full',
  labelPosition = 'top',
}, ref) => {
  const theme = useTheme();

  const getWidth = () => {
    if (width === 'auto') return 'auto';
    if (width === 'full') return '100%';
    if (typeof width === 'number') return width;
    return '100%';
  };

  const LabelContent = () => (
    <>
      {label && (
        <Text size="sm" weight="medium" style={{ color: theme.colors.gray[9] }}>
          {label}
          {required && <Text style={{ color: theme.colors.error[5] }}> *</Text>}
        </Text>
      )}
      {description && (
        <Text size="xs" style={{ color: theme.colors.gray[6], marginTop: DESIGN_TOKENS.spacing.xs }}>
          {description}
        </Text>
      )}
    </>
  );

  const renderHorizontal = () => (
    <View
      ref={ref}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: DESIGN_TOKENS.spacing.md,
        width: getWidth(),
      }}
    >
      <View style={{ minWidth: 120, justifyContent: 'flex-start', paddingTop: DESIGN_TOKENS.spacing.xs }}>
        <LabelContent />
      </View>
      <View style={{ flex: 1 }}>
        {children}
        {error && (
          <Text size="xs" style={{ color: theme.colors.error[5], marginTop: DESIGN_TOKENS.spacing.xs }}>
            {error}
          </Text>
        )}
      </View>
    </View>
  );

  const renderVertical = () => (
    <View ref={ref} style={{ gap: DESIGN_TOKENS.spacing.xs, width: getWidth() }}>
      <LabelContent />
      {children}
      {error && (
        <Text size="xs" style={{ color: theme.colors.error[5] }}>
          {error}
        </Text>
      )}
    </View>
  );

  if (labelPosition === 'left' || labelPosition === 'right') {
    return renderHorizontal();
  }

  return renderVertical();
});

FormField.displayName = 'FormField';