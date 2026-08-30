import { Block, Card, Indicator, Row, Text } from '@platform-blocks/react-ui-library';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 24] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Card w={56} h={56} radius="lg">
            <Indicator placement="top-right" size={size} offset={4} />
          </Card>
          <Text variant="small">{typeof size === 'number' ? `${size} (numeric)` : size}</Text>
        </Block>
      ))}
    </Row>
  );
}
