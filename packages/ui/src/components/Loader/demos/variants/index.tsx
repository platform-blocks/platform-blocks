import { Column, Loader, Row, Text } from '@plocks/ui';

const variants = ['oval', 'bars', 'dots'] as const;

export function Demo() {
  return (
    <Row gap="xl" align="center" wrap="wrap">
      {variants.map(variant => (
        <Column key={variant} gap="xs" align="center">
          <Loader variant={variant} />
          <Text size="sm">{variant}</Text>
        </Column>
      ))}
    </Row>
  );
}
