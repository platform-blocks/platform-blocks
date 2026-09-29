import { Block, Icon, Stepper } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Stepper active={1} completedIcon={<Icon name="check" />}>
        <Stepper.Step label="Account" icon={<Icon name="user" />} />
        <Stepper.Step label="Verification" icon={<Icon name="mail" />} />
        <Stepper.Step label="Preferences" icon={<Icon name="settings" />} />
      </Stepper>
    </Block>
  );
}
