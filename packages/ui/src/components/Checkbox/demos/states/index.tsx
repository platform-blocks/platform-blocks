import { Block, Checkbox } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Checkbox label="Enabled" defaultChecked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Required" required defaultChecked />
      <Checkbox label="With error" error="Selection required" />
    </Block>
  );
}
