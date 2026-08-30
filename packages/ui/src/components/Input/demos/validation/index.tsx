import { useState } from 'react';

import { Block, Input } from '@platform-blocks/react-ui-library';

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function Demo() {
  const [email, setEmail] = useState('');

  return (
    <Block>
      <Input
        type="email"
        label="Email address"
        placeholder="user@example.com"
        value={email}
        onChangeText={setEmail}
        required
        error={email.length > 0 && !isValidEmail(email) ? 'Please enter a valid email address' : undefined}
        helperText="We'll never share your email"
      />

      <Input label="Disabled" value="Cannot edit this value" disabled />
    </Block>
  );
}
