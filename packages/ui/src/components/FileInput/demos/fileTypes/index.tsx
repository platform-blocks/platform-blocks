import { Block, FileInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Images only"
        accept={['image/*']}
        helperText="Only image files are allowed"
        multiple
        fullWidth
      />
      <FileInput
        label="Documents only"
        accept={['.pdf', '.doc', '.docx', '.txt']}
        helperText="PDF, Word documents, and text files only"
        multiple
        fullWidth
      />
      <FileInput
        label="Videos (max 50MB)"
        accept={['video/*']}
        maxSize={50 * 1024 * 1024}
        helperText="Video files up to 50MB"
        fullWidth
      />
    </Block>
  );
}
