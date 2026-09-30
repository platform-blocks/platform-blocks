import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput label="With country code" />
      <PhoneInput label="Without country code" showCountryCode={false} />
    </Block>
  );
}
