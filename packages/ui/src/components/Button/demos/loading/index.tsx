import { Button, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Button loading>Submit application</Button>
      <Button loading loadingTitle="Submitting…">
        Submit application
      </Button>
    </Row>
  );
}
