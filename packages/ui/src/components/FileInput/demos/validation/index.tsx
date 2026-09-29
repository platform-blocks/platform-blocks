import { Block, FileInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Upload small files"
        helperText="Files must be below 2MB"
        maxSize={2 * 1024 * 1024}
        multiple
        fullWidth
      />
      <FileInput
        label="Upload up to 3 files"
        maxFiles={3}
        multiple
        fullWidth
      />
      <FileInput
        label="Required upload"
        error="Please select at least one file"
        required
        fullWidth
      />
      <FileInput
        label="Disabled upload"
        helperText="The uploader is unavailable"
        disabled
        fullWidth
      />
    </Block>
  );
}
