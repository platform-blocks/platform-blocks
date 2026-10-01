import { Block, Card, Text } from '@plocks/ui';

const VARIANTS = ['filled', 'outline', 'elevated', 'subtle', 'ghost', 'gradient'] as const;

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant} p="lg" radius="lg">
          <Text c={variant === 'gradient' ? 'white' : undefined}>{variant}</Text>
        </Card>
      ))}
    </Block>
  );
}
