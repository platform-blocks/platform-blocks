import { Badge, Row, Text, useViewport } from '@plocks/ui';

export function Demo() {
  const { width, height, breakpoint } = useViewport();

  return (
    <Row gap="sm" align="center">
      <Text size="xl" fw="700">
        {Math.round(width)} × {Math.round(height)}
      </Text>
      <Badge size="lg">{breakpoint}</Badge>
    </Row>
  );
}
