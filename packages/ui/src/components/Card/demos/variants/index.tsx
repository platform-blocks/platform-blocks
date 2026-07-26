import { Block, Card, Text } from '@platform-blocks/ui';

const VARIANTS = ['filled', 'outline', 'elevated', 'subtle', 'ghost', 'gradient'] as const;

export default function Demo() {
  return (
    <Block>
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant} p="lg" radius="lg">
          <Block>
            <Text variant="small" colorVariant="muted">
              {String(variant).toUpperCase()} variant
            </Text>
            <Text colorVariant="muted">
              Apply the {variant} treatment to match surface contrast needs.
            </Text>
          </Block>
        </Card>
      ))}
    </Block>
  );
}
