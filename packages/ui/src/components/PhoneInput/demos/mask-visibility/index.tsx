import { Block, PhoneInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="With country code" />
      <PhoneInput label="Without country code" showCountryCode={false} />
    </Block>
  );
}
