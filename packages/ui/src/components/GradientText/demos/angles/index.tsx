import { Block, GradientText } from '@platform-blocks/ui';

const angles = [0, 45, 90, 135];

export function Demo() {
  return (
    <Block gap="md">
      {angles.map((angle) => (
        <GradientText key={angle} colors={['#FF0080', '#7928CA']} angle={angle} size="lg">
          {angle}° gradient
        </GradientText>
      ))}
    </Block>
  );
}
