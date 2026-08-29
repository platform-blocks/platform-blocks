import { Button, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap" align="flex-end">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </Row>
  );
}