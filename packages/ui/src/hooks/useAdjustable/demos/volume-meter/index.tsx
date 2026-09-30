import { useState } from 'react';
import { Block, IconButton, useAdjustable } from '@plocks/ui';

const LEVELS = 10;

export function Demo() {
  const [level, setLevel] = useState(6);
  const { adjustableProps, increment, decrement } = useAdjustable({
    value: level,
    min: 0,
    max: LEVELS,
    step: 1,
    onChange: setLevel,
    label: 'Volume',
    valueText: (value) => `${value * 10} percent`,
  });

  return (
    <Block direction="row" align="center" gap="sm">
      <IconButton icon="minus" variant="ghost" accessibilityLabel="Quieter" onPress={() => decrement()} />
      <Block {...adjustableProps} direction="row" align="flex-end" gap={4} p="xs" radius="sm">
        {Array.from({ length: LEVELS }, (_, index) => (
          <Block
            key={index}
            w={8}
            h={8 + index * 3}
            radius={2}
            bg={index < level ? 'primary.5' : 'borderStrong'}
          />
        ))}
      </Block>
      <IconButton icon="plus" variant="ghost" accessibilityLabel="Louder" onPress={() => increment()} />
    </Block>
  );
}
