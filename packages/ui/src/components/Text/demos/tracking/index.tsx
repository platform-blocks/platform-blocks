import { Block, Text } from '@platform-blocks/ui';

const TRACKING = [-1, -0.5, 0, 0.5, 1, 2, 4];

export function Demo() {
  return (
    <Block>
      {TRACKING.map((tracking) => (
        <Text key={tracking} lts={tracking}>
          Tracking {tracking}
        </Text>
      ))}
    </Block>
  );
}
