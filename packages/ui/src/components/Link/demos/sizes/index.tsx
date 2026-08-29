import { Block, Link, Row, Text } from '@platform-blocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Link size={size} href="#">Link</Link>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
