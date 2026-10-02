import { Column, Text, Title } from '@plocks/ui';

const variants = ['h2', 'h3', 'h4'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">order=3 · variant={variant}</Text>
          <Title order={3} variant={variant}>Section title</Title>
        </Column>
      ))}
    </Column>
  );
}
