import { useState } from 'react';
import { NumberInput } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [quantity, setQuantity] = useState<number | undefined>(2);

  return (
    <NumberInput
      label="Quantity"
      placeholder="Enter amount"
      value={quantity}
      onChange={setQuantity}
      min={0}
      step={1}
    />
  );
}
