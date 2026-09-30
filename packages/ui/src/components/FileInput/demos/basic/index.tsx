import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Upload files"
        helperText="Choose files from your device"
        multiple
        fullWidth
      />
    </Block>
  );
}
