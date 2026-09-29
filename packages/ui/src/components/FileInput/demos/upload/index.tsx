import { Block, FileInput } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Select files to upload"
        multiple
        fullWidth
        onUpload={async (files, { onProgress }) => {
          for (const file of files) {
            for (let progress = 0; progress <= 100; progress += 25) {
              onProgress(file.id, progress);
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        }}
      />
    </Block>
  );
}
