import { useState } from 'react';
import { Slider, Text, Block, Card } from '@platform-blocks/ui';

const VARIANTS = ['default', 'filled', 'outline', 'minimal', 'segmented', 'unstyled'] as const;

export function Demo() {
  const [value, setValue] = useState(40);

  return (
    <Block fullWidth>

      {VARIANTS.map((variant) => (
        <Slider
          key={variant}
          label={variant}
          variant={variant}
          value={value}
          onChange={setValue}
          min={0}
          max={100}
          step={5}
          showTicks={variant === 'segmented'}
          restrictToTicks={variant === 'segmented'}
          fullWidth
        />
      ))}
    </Block>
  );
}
