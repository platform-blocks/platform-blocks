import { Block, FileInput } from '@platform-blocks/ui';

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
