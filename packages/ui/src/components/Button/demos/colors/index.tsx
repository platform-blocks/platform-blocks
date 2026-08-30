import { Button, Row } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Button variant="filled" color="primary">Primary</Button>
      <Button variant="filled" color="secondary">Secondary</Button>
      <Button variant="filled" color="success">Success</Button>
      <Button variant="filled" color="warning">Warning</Button>
      <Button variant="filled" color="error">Error</Button>
    </Row>
  );
}
