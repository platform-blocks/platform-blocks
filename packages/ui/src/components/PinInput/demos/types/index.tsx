import { Block, PinInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <PinInput type="numeric" label="Numeric" />
      <PinInput type="alphanumeric" label="Alphanumeric" />
    </Block>
  );
}
