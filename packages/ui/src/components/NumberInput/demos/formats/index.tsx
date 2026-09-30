import { Block, NumberInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <NumberInput
        label="List price"
        defaultValue={249.99}
        format="currency"
        decimalScale={2}
        fixedDecimalScale
      />
      <NumberInput
        label="Discount"
        defaultValue={10}
        format="percentage"
      />
    </Block>
  );
}
