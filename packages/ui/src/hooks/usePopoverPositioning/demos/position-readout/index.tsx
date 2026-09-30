import { useState } from 'react';
import { Block, Button, Text, usePopoverPositioning } from '@plocks/ui';

export function Demo() {
  const [measuring, setMeasuring] = useState(false);
  const { anchorRef, position } = usePopoverPositioning(measuring, {
    placement: 'top',
    offset: 8,
  });

  return (
    <Block align="center">
      <Button ref={anchorRef} onPress={() => setMeasuring((current) => !current)}>
        {measuring ? 'Stop' : 'Measure'}
      </Button>

      {position ? (
        <Text size="sm" ff="monospace">
          {position.placement} · x {Math.round(position.x)} · y {Math.round(position.y)}
        </Text>
      ) : null}
    </Block>
  );
}
