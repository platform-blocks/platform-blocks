import { Badge, Block, Row, resolveResponsiveValue, useBreakpoint } from '@plocks/ui';

export function Demo() {
  const breakpoint = useBreakpoint();
  const columns = resolveResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 }, breakpoint);

  return (
    <Block fullWidth align="flex-start">
      <Badge size="lg">{breakpoint}</Badge>
      <Row gap="sm" w="full">
        {Array.from({ length: columns }, (_, i) => (
          <Block key={i} grow h={56} radius="md" bg="primary" />
        ))}
      </Row>
    </Block>
  );
}
