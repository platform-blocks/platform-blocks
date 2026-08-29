import { useState } from 'react';
import { Block, Rating } from '@platform-blocks/ui';

export function Demo() {
  const [interactiveValue, setInteractiveValue] = useState<number>(4);

  return (
    <Block>
      <Rating
        value={interactiveValue}
        onChange={setInteractiveValue}
        size="lg"
        label="Interactive rating"
      />
      <Rating
        value={4.5}
        readOnly
        size="lg"
        label="Read-only rating"
        disclaimer="Use `readOnly` to show aggregated scores."
      />
      <Rating
        defaultValue={3}
        showTooltip
        size="lg"
        label="Tooltip rating"
        disclaimer="Tooltips show numeric value on hover."
      />
      <Rating
        defaultValue={4}
        showTooltip
        getTooltipLabel={(value, count) => `${value} out of ${count} stars`}
        size="lg"
        label="Custom tooltip text"
        disclaimer="Pass `getTooltipLabel` to format the tooltip."
      />
      <Rating
        value={3}
        disabled
        size="lg"
        label="Disabled rating"
        disclaimer="`disabled` blocks input and dims the control."
      />
    </Block>
  );
}


