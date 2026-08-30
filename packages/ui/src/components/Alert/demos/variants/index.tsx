import { Alert, Block } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Alert variant="light" color="primary" title="Light">
        Balanced background and border treatment for inline notes.
      </Alert>
      <Alert variant="outline" color="success" title="Outline">
        Subtle emphasis without increasing background contrast.
      </Alert>
      <Alert variant="filled" color="warning" title="Filled">
        High-contrast option for urgent messaging.
      </Alert>
      <Alert variant="subtle" color="error" title="Subtle">
        No background color, but tinted icon and text.
      </Alert>
    </Block>
  );
}
