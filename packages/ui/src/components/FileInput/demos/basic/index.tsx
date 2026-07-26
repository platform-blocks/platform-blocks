import { useState } from 'react';

import { Block, FileInput, Text } from '@platform-blocks/ui';
import type { FileInputFile } from '@platform-blocks/ui';

export default function Demo() {
  const [files, setFiles] = useState<FileInputFile[]>([]);

  return (
    <Block fullWidth>
      <FileInput
        label="Upload files"
        helperText="Choose files from your device"
        onFilesChange={setFiles}
        multiple
        fullWidth
      />
      {files.length > 0 && (
        <Text size="xs" colorVariant="secondary">
          Selected: {files.map((file) => file.name).join(', ')}
        </Text>
      )}
    </Block>
  );
}
