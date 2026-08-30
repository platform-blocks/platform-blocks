import { Card, Flex, Text, Icon } from '@platform-blocks/react-ui-library';

const strokeVariants = [
  { label: 'Thin (0.75)', value: 0.75 },
  { label: 'Default (1.5)', value: 1.5 },
  { label: 'Bold (3)', value: 3 },
];

export function Demo() {
  return (
    <Card variant="outline" style={{ padding: 20 }}>
      <Flex direction="column" gap="md">
        <Text variant="h6">Stroke thickness</Text>
        <Text variant="p" color="secondary">
          Adjust the stroke thickness to match different visual weights. Filled icons that opt in to preserving stroke (like{' '}
          contrast) keep their outline while the fill still applies.
        </Text>
        <Flex direction="row" align="center" gap="lg" wrap="wrap">
          {strokeVariants.map(({ label, value }) => (
            <Flex key={label} direction="column" align="center" gap="sm">
              <Icon name="contrast" size="xl" variant="filled" stroke={value} />
              <Text variant="small" style={{ textAlign: 'center' }}>{label}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}
