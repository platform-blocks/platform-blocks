import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Upload images"
        accept={['image/*']}
        helperText="Add images to see inline previews"
        multiple
        fullWidth
      />
    </Block>
  );
}
