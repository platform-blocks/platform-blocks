---
name: KeyboardAwareLayout
category: layout
status: beta
---
`KeyboardAwareLayout` provides a drop-in wrapper around React Native's `KeyboardAvoidingView` with sensible defaults and a built-in `ScrollView`. When paired with `KeyboardManagerProvider`, screens automatically pad their content by the current keyboard height and can forward refs for fine-grained control.

## Usage

```tsx
import { KeyboardAwareLayout, Input, Button } from '@platform-blocks/react-ui-library';

export function SignInScreen() {
  return (
    <KeyboardAwareLayout contentContainerStyle={{ padding: 24 }}>
      <Input label="Email" keyboardFocusId="auth-email" />
      <Input label="Password" type="password" mt="md" keyboardFocusId="auth-password" />
      <Button title="Continue" mt="xl" />
    </KeyboardAwareLayout>
  );
}
```

## Props

- `scrollable` — toggle the internal `ScrollView` (default: `true`)
- `extraScrollHeight` — additional padding appended to the detected keyboard height (default: `24`)
- `scrollRef` — forward a ref to the internal `ScrollView`
- `scrollViewProps` — supply extra props that merge with the default `ScrollView`
- `keyboardShouldPersistTaps` — forwarded to the `ScrollView` (default: `'handled'`)

Include `KeyboardAwareLayout` inside a `KeyboardManagerProvider` so keyboard visibility and height updates stay synchronized across components.
