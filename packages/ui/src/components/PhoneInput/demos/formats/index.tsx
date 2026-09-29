import { Block, PhoneInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="United States" country="US" />
      <PhoneInput label="United Kingdom" country="GB" />
      <PhoneInput label="France" country="FR" />
      <PhoneInput label="Brazil" country="BR" />
    </Block>
  );
}
