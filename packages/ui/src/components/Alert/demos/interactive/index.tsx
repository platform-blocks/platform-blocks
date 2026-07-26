import { useState } from 'react';
import { Alert, Button } from '@platform-blocks/ui';

export default function Demo() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <Button variant="outline" onPress={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }

  return (
    <Alert
      sev="warning"
      title="Draft warning"
      withCloseButton
      onClose={() => setVisible(false)}
    >
      Your draft is missing a title. Resolve before publishing.
    </Alert>
  );
}
