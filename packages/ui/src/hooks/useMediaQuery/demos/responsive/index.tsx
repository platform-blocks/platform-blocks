import { Badge, Block, Row, Text, useMediaQuery } from '@platform-blocks/react-ui-library';

export function Demo() {
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isWide = useMediaQuery('(min-width: 1024px)');
  const columns = isCompact ? 1 : isWide ? 4 : 2;

  return (
    <Block>
      <Row gap="xs" wrap="wrap">
        <Badge variant={isCompact ? 'light' : 'outline'} color={isCompact ? 'success' : 'gray'}>
          Compact (≤640px)
        </Badge>
        <Badge variant={isWide ? 'light' : 'outline'} color={isWide ? 'success' : 'gray'}>
          Wide (≥1024px)
        </Badge>
      </Row>

      <Row gap="md" wrap="wrap">
        {Array.from({ length: columns }).map((_, i) => (
          <Block key={i} bg="primary" p="md" radius="md" minW={120}>
            <Text c="white">Card {i + 1}</Text>
          </Block>
        ))}
      </Row>

      <Text size="sm" color="muted">
        Resize the viewport (or rotate the device) to see the layout adapt.
      </Text>
    </Block>
  );
}
