import { Block, PinInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <PinInput mask defaultValue="1234" label="Masked" />
      <PinInput oneTimeCode length={6} label="One-time code" />
      <PinInput defaultValue="1289" error="Incorrect PIN. Try again." label="Validation" />
    </Block>
  );
}
