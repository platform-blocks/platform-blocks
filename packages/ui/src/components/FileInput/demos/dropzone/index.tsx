import { useState } from 'react';
import { Platform } from 'react-native';

import { Block, FileInput, Text } from '@platform-blocks/ui';
import type { FileInputFile } from '@platform-blocks/ui';

export default function Demo() {
  const [files, setFiles] = useState<FileInputFile[]>([]);

  const instructions =
    Platform.OS === 'web'
      ? 'Drag files into the dropzone or click Browse files to pick from your desktop.'
      : 'Tap the dropzone to open the native file picker on touch devices.';

  return (
    <Block fullWidth>
      <Text size="sm" colorVariant="secondary">
        {instructions}
      </Text>
      <FileInput
        variant="dropzone"
        multiple
        accept={['image/*', '.pdf', '.txt']}
        helperText="Drag & drop on desktop or tap to browse on mobile"
        onFilesChange={setFiles}
        showFileList
        fullWidth
      />
      {files.length > 0 && (
        <Block>
          <Text size="xs" weight="semibold">
            Selected files ({files.length})
          </Text>
          <Block>
            {files.map((file) => (
              <Text key={file.id} size="xs" colorVariant="secondary">
                {file.name}
              </Text>
            ))}
          </Block>
        </Block>
      )}
    </Block>
  );
}
