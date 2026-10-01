import { Column, ListGroup, ListGroupItem, Text } from '@plocks/ui';

const variants = ['default', 'bordered', 'flush'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <ListGroup variant={variant}>
            <ListGroupItem>Overview</ListGroupItem>
            <ListGroupItem>Settings</ListGroupItem>
          </ListGroup>
        </Column>
      ))}
    </Column>
  );
}
