import { Column, Highlight, Text } from '@plocks/ui';

const variants = ['h4', 'p', 'small'] as const;

export function Demo() {
  return (
    <Column gap="md">
      {variants.map(variant => (
        <Column key={variant} gap="xs">
          <Text size="xs" c="secondary">{variant}</Text>
          <Highlight variant={variant} highlight="design">A design system for every screen.</Highlight>
        </Column>
      ))}
    </Column>
  );
}
