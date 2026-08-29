import { useState } from 'react';

import { Block, NumberInput, Text } from '@platform-blocks/ui';

export function Demo() {
  const [price, setPrice] = useState<number | undefined>(249.99);
  const [discount, setDiscount] = useState<number | undefined>(10);

  const finalPrice = price != null && discount != null
    ? price * (1 - discount / 100)
    : undefined;

  return (
    <Block>
      <Block>
        <NumberInput
          label="List price"
          value={price}
          onChange={setPrice}
          format="currency"
          currency="USD"
          fixedDecimalScale
          decimalScale={2}
          min={0}
          allowNegative={false}
        />
        <NumberInput
          label="Discount"
          value={discount}
          onChange={setDiscount}
          suffix="%"
          min={0}
          max={100}
          step={0.5}
          allowDecimal
        />
      </Block>

      <Text size="xs" color="secondary">
        Final price: {finalPrice != null ? `$${finalPrice.toFixed(2)}` : '—'}
      </Text>
    </Block>
  );
}
