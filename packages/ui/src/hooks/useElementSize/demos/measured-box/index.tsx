import { Block, Text, useElementSize } from '@plocks/ui';

export function Demo() {
  const { width, height, onLayout } = useElementSize();

  return (
    <Block fullWidth onLayout={onLayout} bg="surface" p="xl" radius="md" align="center">
      <Text size="lg" fw="600">
        {Math.round(width)} × {Math.round(height)}
      </Text>
    </Block>
  );
}
