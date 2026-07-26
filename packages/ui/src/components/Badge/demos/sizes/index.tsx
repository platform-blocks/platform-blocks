import { Badge, Block, Row, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export default function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Badge size={size}>Badge</Badge>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
