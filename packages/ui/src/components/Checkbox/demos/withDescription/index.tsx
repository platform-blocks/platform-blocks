import { useState } from 'react';
import { Block, Checkbox, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [newsletter, setNewsletter] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  return (
    <Block style={{ maxWidth: 400 }}>
      <Checkbox
        label="Receive product updates"
        description="Get occasional emails about new features and improvements."
        checked={newsletter}
        onChange={setNewsletter}
      />
      <Checkbox
        label="Accept terms of service"
        description="Required before creating an account."
        error={termsAccepted ? undefined : 'Please accept to continue.'}
        checked={termsAccepted}
        onChange={setTermsAccepted}
        required
      />
      <Text variant="small" colorVariant="muted">
        Use `description` for supporting copy and pair with `error` to surface validation details.
      </Text>
    </Block>
  );
}
