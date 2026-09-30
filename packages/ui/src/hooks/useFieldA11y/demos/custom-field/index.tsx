import { useState } from 'react';
import { TextInput } from 'react-native';
import { Block, Text, useFieldA11y, useTheme } from '@plocks/ui';

const LABEL = 'Username';
const HELPER = 'Lowercase letters and numbers, 3–16 characters.';

export function Demo() {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const error = /[^a-z0-9]/.test(value) ? 'Only lowercase letters and numbers are allowed.' : undefined;

  const { controlProps, labelProps, errorProps, helperProps, invalid, showError, showHelper } = useFieldA11y({
    label: LABEL,
    helperText: HELPER,
    error,
    required: true,
  });

  return (
    <Block fullWidth maw={360} gap="xs">
      <Text {...labelProps} fw="600">
        {LABEL}
        <Text c="error" aria-hidden>
          {' *'}
        </Text>
      </Text>

      <TextInput
        {...controlProps}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: invalid ? theme.colors.error[5] : theme.backgrounds.borderStrong,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 14,
          fontFamily: theme.fontFamily,
          color: theme.text.primary,
        }}
      />

      {showError ? (
        <Block {...errorProps} accessible>
          <Text size="sm" c="error">
            {error}
          </Text>
        </Block>
      ) : showHelper ? (
        <Text {...helperProps} size="sm" c="muted">
          {HELPER}
        </Text>
      ) : null}
    </Block>
  );
}
