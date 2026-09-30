import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput
        label="International format"
        mask="+00 (000) 000-0000"
        showCountryCode={false}
        placeholder="+44 (791) 112-3456"
      />
      <PhoneInput
        label="North America with extension"
        mask="000-000-0000 x0000"
        showCountryCode={false}
        placeholder="555-123-4567 x1234"
      />
    </Block>
  );
}
