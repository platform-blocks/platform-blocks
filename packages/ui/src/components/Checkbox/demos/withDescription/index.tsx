import { Block, Checkbox } from '@plocks/ui';

export function Demo() {
  return (
    <Block style={{ maxWidth: 400 }}>
      <Checkbox
        label="Receive product updates"
        description="Get occasional emails about new features and improvements."
      />
      <Checkbox
        label="Accept terms of service"
        description="Required before creating an account."
        error="Please accept to continue."
        required
      />
    </Block>
  );
}
