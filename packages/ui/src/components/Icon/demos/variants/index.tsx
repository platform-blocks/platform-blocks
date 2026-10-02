import { Column, Icon, Row, Text } from '@plocks/ui';

const variants = ['outlined', 'filled'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Row key={variant} gap="md" align="center">
          <Text>{variant}</Text>
          <Icon name="heart" variant={variant} size="xl" />
          <Icon name="star" variant={variant} size="xl" />
          <Icon name="bell" variant={variant} size="xl" />
        </Row>
      ))}
    </Column>
  );
}
