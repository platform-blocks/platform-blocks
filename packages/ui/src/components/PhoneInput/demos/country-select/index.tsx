import { Block, PhoneInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="Phone number" selectableCountry defaultValue="5551234567" />
    </Block>
  );
}
