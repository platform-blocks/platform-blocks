import { Block, Stepper } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={1}>
        <Stepper.Step label="Details" />
        <Stepper.Step label="Processing" loading />
        <Stepper.Step label="Ready" />
      </Stepper>
    </Block>
  );
}
