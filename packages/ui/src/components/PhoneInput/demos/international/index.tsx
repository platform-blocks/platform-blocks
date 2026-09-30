import { Block, PhoneInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <PhoneInput
        label="Auto-detect from a + prefix"
        autoDetect
        placeholder="Try +447911123456 or +33123456789"
      />
      <PhoneInput
        label="Manual international"
        country="INTL"
        placeholder="Enter any international number"
      />
    </Block>
  );
}
