import { Block, Stepper } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={3}>
        <Stepper.Step label="Plan" color="teal" />
        <Stepper.Step label="Design" color="cyan" />
        <Stepper.Step label="Build" color="violet" />
        <Stepper.Step label="Launch" color="pink" />
      </Stepper>
    </Block>
  );
}
