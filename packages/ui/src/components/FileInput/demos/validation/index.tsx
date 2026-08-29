import { useState } from 'react';
import { Block, FileInput, Text } from '@platform-blocks/ui';
import type { FileInputFile } from '@platform-blocks/ui';

export function Demo() {
  const [validatedFiles, setValidatedFiles] = useState<FileInputFile[]>([]);
  const [singleFile, setSingleFile] = useState<FileInputFile[]>([]);
  const [limitedFiles, setLimitedFiles] = useState<FileInputFile[]>([]);

  return (
    <Block fullWidth>
      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Size validation (max 2MB)
        </Text>
        <FileInput
          label="Upload small files"
          helperText="Files must be below 2MB"
          onFilesChange={setValidatedFiles}
          maxSize={2 * 1024 * 1024}
          multiple
          fullWidth
        />
        {validatedFiles.length > 0 && (
          <Text size="xs" color="secondary">
            Selected: {validatedFiles.length}
          </Text>
        )}
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Single file only
        </Text>
        <FileInput
          label="Upload one file"
          helperText="Select a single file"
          onFilesChange={setSingleFile}
          multiple={false}
          fullWidth
        />
        {singleFile[0] && (
          <Text size="xs" color="secondary">
            Selected: {singleFile[0].name}
          </Text>
        )}
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Limited file count
        </Text>
        <FileInput
          label="Upload up to 3 files"
          helperText="Selecting more will show a validation error"
          onFilesChange={setLimitedFiles}
          multiple
          maxFiles={3}
          fullWidth
        />
        {limitedFiles.length > 0 && (
          <Text size="xs" color="secondary">
            Selected: {limitedFiles.length}
          </Text>
        )}
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          With error state
        </Text>
        <FileInput
          label="Required upload"
          helperText="This field is required"
          onFilesChange={() => {}}
          error="Please select at least one file"
          required
          fullWidth
        />
      </Block>

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Disabled state
        </Text>
        <FileInput
          label="Disabled upload"
          helperText="The uploader is unavailable"
          onFilesChange={() => {}}
          disabled
          fullWidth
        />
      </Block>
    </Block>
  );
}
