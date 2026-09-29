import { NumberInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <NumberInput
      label="Playback speed"
      defaultValue={32}
      min={0}
      max={200}
      suffix="%"
      withSideButtons
    />
  );
}
