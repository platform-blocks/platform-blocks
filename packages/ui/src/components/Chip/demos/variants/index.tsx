import { Chip, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap={8} wrap="wrap">
      <Chip variant="filled">Filled</Chip>
      <Chip variant="outline">Outline</Chip>
      <Chip variant="light">Light</Chip>
      <Chip variant="subtle">Subtle</Chip>
      <Chip variant="surface">Surface</Chip>
      <Chip variant="gradient">Gradient</Chip>
    </Row>
  );
}
