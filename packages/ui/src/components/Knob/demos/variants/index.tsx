import { useState } from 'react';

import { Block, Knob, Row, Text } from '@plocks/ui';
import type { KnobVariant } from '@plocks/ui';

const VARIANTS: { variant: KnobVariant; blurb: string }[] = [
  { variant: 'default', blurb: 'Stock dial' },
  { variant: 'minimal', blurb: 'Hairline, dense UIs' },
  { variant: 'digital', blurb: 'Hard edges, lit marker' },
  { variant: 'retro', blurb: 'Solid body, indicator arm' },
  { variant: 'studio', blurb: 'Plugin rack' },
];

export function Demo() {
  const [value, setValue] = useState(62);

  return (
    <Block fullWidth direction="row" justify="space-between">
        {VARIANTS.map(({ variant, blurb }) => (
          <Block key={variant} align="center" gap="xs">
            <Knob accessibilityLabel={`${variant} knob`}
              value={value}
              onChange={setValue}
              variant={variant}
            />
            <Text size="sm" fw="600">{variant}</Text>
          </Block>
        ))}
    </Block>
  );
}
