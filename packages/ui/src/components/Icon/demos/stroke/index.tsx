import { Flex, Icon, Text } from '@platform-blocks/ui';

const strokeVariants = [
  { label: 'Thin (0.75)', value: 0.75 },
  { label: 'Default (1.5)', value: 1.5 },
  { label: 'Bold (3)', value: 3 },
];

export function Demo() {
  return (
    <Flex direction="row" align="center" gap="lg" wrap="wrap">
      {strokeVariants.map(({ label, value }) => (
        <Flex key={label} direction="column" align="center" gap="sm">
          <Icon name="contrast" size="xl" stroke={value} />
          <Text variant="small" style={{ textAlign: 'center' }}>{label}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
