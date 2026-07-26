import { useState } from 'react';

import { Block, FileInput, Text } from '@platform-blocks/ui';
import type { FileInputFile } from '@platform-blocks/ui';

export default function Demo() {
  const [imageFiles, setImageFiles] = useState<FileInputFile[]>([]);
  const [documentFiles, setDocumentFiles] = useState<FileInputFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileInputFile[]>([]);

  return (
    <Block fullWidth>
      <Block>
        <Text weight="semibold">File type restrictions</Text>
        <Text size="sm" colorVariant="secondary">
          Limit accepted file types per uploader using MIME types, extensions, and size caps.
        </Text>
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Images only
        </Text>
        <FileInput
          accept={['image/*']}
          helperText="Only image files are allowed"
          onFilesChange={setImageFiles}
          multiple
          fullWidth
        />
        {imageFiles.length > 0 && (
          <Text size="xs" colorVariant="secondary">
            Selected: {imageFiles.map((file) => file.name).join(', ')}
          </Text>
        )}
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Documents only
        </Text>
        <FileInput
          accept={['.pdf', '.doc', '.docx', '.txt']}
          helperText="PDF, Word documents, and text files only"
          onFilesChange={setDocumentFiles}
          multiple
          fullWidth
        />
        {documentFiles.length > 0 && (
          <Text size="xs" colorVariant="secondary">
            Selected: {documentFiles.map((file) => file.name).join(', ')}
          </Text>
        )}
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Videos (max 50MB)
        </Text>
        <FileInput
          accept={['video/*']}
          maxSize={50 * 1024 * 1024}
          helperText="Video files up to 50MB"
          onFilesChange={setVideoFiles}
          fullWidth
        />
        {videoFiles.length > 0 && (
          <Text size="xs" colorVariant="secondary">
            Selected: {videoFiles.map((file) => file.name).join(', ')}
          </Text>
        )}
      </Block>
    </Block>
  );
}
