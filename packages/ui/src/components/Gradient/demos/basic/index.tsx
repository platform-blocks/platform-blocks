import { Gradient, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Gradient colors={['#2563eb', '#7c3aed']} h={120} radius="lg" p="md" justify="center">
      <Text c="#ffffff" fw="bold">
        Gradient surface
      </Text>
    </Gradient>
  );
}
