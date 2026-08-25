import React from 'react';
import {
  BrandButton,
  Button,
  Card,
  Checkbox,
  Column,
  Divider,
  Flex,
  Input,
  PasswordInput,
  Text,
  Title,
  useTheme,
} from '@platform-blocks/ui';

/**
 * Complete sign-in screen. State is plain React state — validation runs on
 * submit and errors render inline on the fields.
 */
export function LoginExample() {
  const theme = useTheme();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!/.+@.+\..+/.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Password must be at least 8 characters';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      console.log('sign in', { email, remember });
    }
  };

  return (
    <Column
      style={{ flex: 1, backgroundColor: theme.backgrounds.base }}
      justify="center"
      align="center"
      p="lg"
    >
      <Card variant="elevated" p="xl" style={{ maxWidth: 420, width: '100%' }}>
        <Column gap="lg">
          <Column gap="xs">
            <Title order={2}>Welcome back</Title>
            <Text colorVariant="secondary">Sign in to continue to your account</Text>
          </Column>

          <Column gap="md">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              fullWidth
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              fullWidth
            />
            <Flex direction="row" align="center" justify="space-between">
              <Checkbox label="Remember me" checked={remember} onChange={setRemember} />
              <Button
                title="Forgot password?"
                variant="link"
                size="sm"
                onPress={() => console.log('reset password')}
              />
            </Flex>
          </Column>

          <Button title="Sign in" variant="filled" fullWidth onPress={handleSubmit} />

          <Divider label="or continue with" />

          <Flex direction="row" gap="md">
            <BrandButton
              brand="google"
              title="Google"
              style={{ flex: 1 }}
              onPress={() => console.log('google sign-in')}
            />
            <BrandButton
              brand="apple"
              title="Apple"
              style={{ flex: 1 }}
              onPress={() => console.log('apple sign-in')}
            />
          </Flex>

          <Flex direction="row" justify="center" align="center" gap="xs">
            <Text variant="small" colorVariant="secondary">New here?</Text>
            <Button
              title="Create an account"
              variant="link"
              size="sm"
              onPress={() => console.log('sign up')}
            />
          </Flex>
        </Column>
      </Card>
    </Column>
  );
}
