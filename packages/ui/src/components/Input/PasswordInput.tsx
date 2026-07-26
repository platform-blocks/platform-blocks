import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, type TextInput } from 'react-native';
import { Input } from './Input';
import { PasswordInputProps } from './types';
import { calculatePasswordStrength } from './validation';
import { Icon } from '../Icon';
import { Progress } from '../Progress';
import { Text } from '../Text';
import { useTheme } from '../../core/theme';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: number;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  strength
}) => {
  const theme = useTheme();

  const getStrengthColor = (strength: number) => {
    if (strength < 0.3) return theme.colors.error[5];
    if (strength < 0.6) return theme.colors.warning[5];
    if (strength < 0.8) return theme.colors.warning[6];
    return theme.colors.success[5];
  };

  const getStrengthLabel = (strength: number) => {
    if (strength < 0.3) return 'Weak';
    if (strength < 0.6) return 'Fair';
    if (strength < 0.8) return 'Good';
    return 'Strong';
  };

  const requirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
    { label: 'Contains special character', met: /[!@#$%^&*(),.?\":{}|<>]/.test(password) }
  ], [password]);


  // if (!password) return null;

  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text size="sm" style={{ flex: 1 }}>
          Password strength: {getStrengthLabel(strength)}
        </Text>
      </View>

      <Progress
        value={strength * 100}
        color={getStrengthColor(strength)}
        size="sm"
        style={{ marginBottom: 8 }}
      />

      <View>
        {requirements.map((req, index) => (
          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Icon
              name={req.met ? 'check' : 'x'}
              size={12}
              color={req.met ? theme.colors.success[5] : theme.colors.error[5]}
              style={{ marginRight: 6 }}
            />
            <Text
              size="xs"
              color={req.met ? 'success' : 'muted'}
            >
              {req.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>((props, ref) => {
  const {
    showStrengthIndicator = false,
    showVisibilityToggle = true,
    strengthValidation,
    value,
    onChangeText,
    ...inputProps
  } = props;

  const { fullWidth, endSection: propRightSection, ...restInputProps } = inputProps;

  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const strength = useMemo(() => {
    return calculatePasswordStrength(value || '', strengthValidation);
  }, [value, strengthValidation]);

  const handleToggleVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleChangeText = useCallback((text: string) => {
    onChangeText?.(text);
  }, [onChangeText]);


  const endSection = useMemo(() => {
    if (!showVisibilityToggle) return propRightSection;

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {propRightSection}
        <Pressable
          onPress={handleToggleVisibility}
          style={{
            padding: 4,
            marginLeft: propRightSection ? 4 : 0,
          }}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Icon
            name={showPassword ? 'eyeOff' : 'eye'}
            size={18}
            color={theme.text.muted}
            stroke={6}
          />
        </Pressable>
      </View>
    );
  }, [
    showVisibilityToggle,
    propRightSection,
    showPassword,
    handleToggleVisibility,
    theme.text.muted
  ]);

  return (
    <View style={fullWidth ? { width: '100%' } : undefined}>
      {showStrengthIndicator && value ? (
        <PasswordStrengthIndicator password={value} strength={strength} />
      ) : null}

      <Input
        ref={ref}
        {...restInputProps}
        fullWidth={fullWidth}
        type="password"
        value={value}
        onChangeText={handleChangeText}
        secureTextEntry={!showPassword}
        endSection={endSection}
        autoComplete="current-password"
      />


    </View>
  );
});

// Set display name for debugging
PasswordInput.displayName = 'PasswordInput';
