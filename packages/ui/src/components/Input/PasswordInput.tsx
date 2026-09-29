import React, { useCallback, useMemo, useState } from 'react';
import { View, type TextInput } from 'react-native';
import { factory } from '../../core/factory/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { Icon } from '../Icon';
import { Progress } from '../Progress';
import { Text } from '../Text';
import { HIDDEN_PASSWORD_PROPS, Input } from './Input';
import { PasswordToggle } from './PasswordToggle';
import type { ExtendedTextInputProps, PasswordInputProps } from './types';
import { calculatePasswordStrength } from './validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  strength: number;
}

const REQUIREMENTS: ReadonlyArray<{ label: string; test: (password: string) => boolean }> = [
  { label: 'At least 8 characters', test: (password) => password.length >= 8 },
  { label: 'Contains uppercase letter', test: (password) => /[A-Z]/.test(password) },
  { label: 'Contains lowercase letter', test: (password) => /[a-z]/.test(password) },
  { label: 'Contains number', test: (password) => /\d/.test(password) },
  { label: 'Contains special character', test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password) },
];

const strengthLabel = (strength: number) => {
  if (strength < 0.3) return 'Weak';
  if (strength < 0.6) return 'Fair';
  if (strength < 0.8) return 'Good';
  return 'Strong';
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password, strength }) => {
  const theme = useTheme();
  const styles = useThemedStyles(
    () => ({
      root: { marginTop: 8 },
      title: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 4 },
      progress: { marginBottom: 8 },
      requirement: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 2, gap: 6 },
    }),
    []
  );

  const strengthColor =
    strength < 0.3
      ? theme.colors.error[5]
      : strength < 0.6
        ? theme.colors.warning[5]
        : strength < 0.8
          ? theme.colors.warning[6]
          : theme.colors.success[5];

  const requirements = useMemo(
    () => REQUIREMENTS.map((requirement) => ({ label: requirement.label, met: requirement.test(password) })),
    [password]
  );

  return (
    <View style={styles.root}>
      <View style={styles.title}>
        <Text size="sm" style={{ flex: 1 }}>
          Password strength: {strengthLabel(strength)}
        </Text>
      </View>

      <Progress value={strength * 100} color={strengthColor} size="sm" style={styles.progress} />

      <View>
        {requirements.map((requirement) => (
          <View key={requirement.label} style={styles.requirement}>
            <Icon
              name={requirement.met ? 'check' : 'x'}
              size={12}
              color={requirement.met ? theme.colors.success[5] : theme.colors.error[5]}
            />
            <Text size="xs" c={requirement.met ? 'success' : 'muted'}>
              {requirement.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * Password field with a show/hide toggle and an optional strength meter.
 * `ref` points at the TextInput.
 */
export const PasswordInput = factory<{ props: PasswordInputProps; ref: TextInput }>(
  (props, ref) => {
    const {
      showStrengthIndicator = false,
      showVisibilityToggle = true,
      strengthValidation,
      value,
      defaultValue,
      onChangeText,
      endSection,
      textInputProps,
      autoComplete = 'current-password',
      size = 'md',
      disabled,
      fullWidth,
      ...inputProps
    } = props;

    const [password, setPassword] = useControllableState<string>({
      value,
      defaultValue,
      finalValue: '',
      onChange: onChangeText,
    });
    const [showPassword, setShowPassword] = useState(false);

    const strength = useMemo(
      () => calculatePasswordStrength(password, strengthValidation),
      [password, strengthValidation]
    );

    const handleToggleVisibility = useCallback(() => setShowPassword((shown) => !shown), []);

    const toggle = showVisibilityToggle ? (
      <PasswordToggle visible={showPassword} onToggle={handleToggleVisibility} size={size} disabled={disabled} />
    ) : null;

    const secureProps = useMemo<ExtendedTextInputProps>(
      () => ({
        textContentType: 'password',
        autoCapitalize: 'none',
        ...(showPassword ? null : HIDDEN_PASSWORD_PROPS),
        ...textInputProps,
      }),
      [showPassword, textInputProps]
    );

    return (
      <View style={fullWidth ? { width: '100%' } : undefined}>
        {showStrengthIndicator && password ? (
          <PasswordStrengthIndicator password={password} strength={strength} />
        ) : null}

        <Input
          ref={ref}
          {...inputProps}
          fullWidth={fullWidth}
          size={size}
          disabled={disabled}
          type="text"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoComplete={autoComplete}
          autoCorrect={false}
          spellCheck={false}
          textInputProps={secureProps}
          endSection={
            toggle && endSection ? (
              <>
                {endSection}
                {toggle}
              </>
            ) : (
              toggle ?? endSection
            )
          }
        />
      </View>
    );
  },
  { displayName: 'PasswordInput' }
);
