import { Block, Card, Text } from '@platform-blocks/react-ui-library';

const VARIANTS = ['filled', 'outline', 'elevated', 'subtle', 'ghost', 'gradient'] as const;

export function Demo() {
  return (
    <Block>
      {VARIANTS.map((variant) => (
        <Card key={variant} variant={variant} p="lg" radius="lg">
          <Block>
            <Text variant="small" color="muted">
              {String(variant).toUpperCase()} variant
            </Text>
            <Text color="muted">
              Apply the {variant} treatment to match surface contrast needs.
            </Text>
          </Block>
        </Card>
      ))}
    </Block>
  );
}
