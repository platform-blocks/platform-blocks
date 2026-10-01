import { Column, ShimmerText, Text } from '@plocks/ui';

const variants = ['h3', 'p', 'small'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">{variant}</Text>
          <ShimmerText variant={variant}>New arrivals this week</ShimmerText>
        </Column>
      ))}
    </Column>
  );
}
