import { Column, GradientText, Text } from '@plocks/ui';

const variants = ['h3', 'p', 'strong'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">{variant}</Text>
          <GradientText variant={variant} colors={['#FF0080', '#7928CA']}>
            Gradient text with semantic markup
          </GradientText>
        </Column>
      ))}
    </Column>
  );
}
