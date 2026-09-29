import { Block, FileInput } from '@platform-blocks/ui';

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
