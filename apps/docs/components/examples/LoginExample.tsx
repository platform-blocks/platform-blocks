import React from 'react';
import {
  Button,
  Card,
  Checkbox,
  Column,
  Divider,
  Flex,
  Form,
  PasswordInput,
  Text,
  Title,
  useTheme,
  useFormContext,
} from '@plocks/ui';
import { BrandButton } from '@plocks/brands';

const loginValues = { email: '', password: '', remember: true };

const loginValidation = {
  email: [{ type: 'pattern' as const, value: /.+@.+\..+/, message: 'Enter a valid email address' }],
  password: [{ type: 'minLength' as const, value: 8, message: 'Password must be at least 8 characters' }],
};

function LoginFields() {
  const form = useFormContext();

  return (
    <>
      <Form.Field name="email">
        <Form.Input label="Email" placeholder="you@example.com" fullWidth />
      </Form.Field>
      <PasswordInput
        label="Password"
        placeholder="Your password"
        {...form.getFieldProps('password')}
        fullWidth
      />
      <Flex direction="row" align="center" justify="space-between">
        <Checkbox
          label="Remember me"
          checked={Boolean(form.values.remember)}
          onChange={(checked) => form.setFieldValue('remember', checked)}
        />
        <Button title="Forgot password?" variant="link" size="sm" onPress={() => console.log('reset password')} />
      </Flex>
    </>
  );
}

/** Sign-in example using plocks form state and validation. */
export function LoginExample() {
  const theme = useTheme();
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
            <Text c="secondary">Sign in to continue to your account</Text>
          </Column>

          <Form
            initialValues={loginValues}
            validationSchema={loginValidation}
            onSubmit={({ email, remember }) => console.log('sign in', { email, remember })}
          >
            <Column gap="md">
              <LoginFields />
              <Form.Submit variant="filled" fullWidth>Sign in</Form.Submit>
            </Column>
          </Form>

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
            <Text variant="small" c="secondary">New here?</Text>
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
