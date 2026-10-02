import { Column, Flex, Joystick, Text } from '@plocks/ui';

const variants = ['default', 'filled', 'outline', 'minimal', 'unstyled'] as const;

export function Demo() {
  return (
    <Flex direction="row" gap="lg" wrap="wrap">
      {variants.map(variant => (
        <Column key={variant} gap="xs" align="center">
          <Text size="sm">{variant}</Text>
          <Joystick variant={variant} accessibilityLabel={`${variant} joystick`} />
        </Column>
      ))}
    </Flex>
  );
}
