import { Button, Row } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Button variant="default">Default</Button>
      <Button variant="filled">Filled</Button>
      <Button variant="light">Light</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="gradient">Gradient</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="none">Text only</Button>
    </Row>
  );
}