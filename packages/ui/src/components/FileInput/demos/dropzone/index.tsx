import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        variant="dropzone"
        multiple
        helperText="Drag & drop on desktop or tap to browse on mobile"
        fullWidth
      />
    </Block>
  );
}
