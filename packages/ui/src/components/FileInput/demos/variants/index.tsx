import { useState } from 'react';
import { Block, FileInput, Text } from '@platform-blocks/react-ui-library';
import type { FileInputFile } from '@platform-blocks/react-ui-library';

const sizes = [
  { label: 'Small', size: 'sm' as const },
  { label: 'Medium (default)', size: 'md' as const },
  { label: 'Large', size: 'lg' as const },
];

export function Demo() {
  const [files, setFiles] = useState<Record<string, FileInputFile[]>>({});

  const handleChange = (key: string) => (next: FileInputFile[]) => {
    setFiles((prev) => ({ ...prev, [key]: next }));
  };

  return (
    <Block fullWidth>
      {sizes.map(({ label, size }) => (
        <Block key={label} fullWidth>
          <Text size="sm" weight="semibold">
            {label}
          </Text>
          <FileInput
            label={`${label} input`}
            helperText={`${label} size example`}
            onFilesChange={handleChange(label)}
            size={size}
            multiple={size === 'lg'}
            fullWidth
          />
          {files[label]?.length ? (
            <Text size="xs" color="secondary">
              Selected: {files[label].length}
            </Text>
          ) : null}
        </Block>
      ))}

      <Block fullWidth>
        <Text size="sm" weight="semibold">
          Custom placeholder
        </Text>
        <FileInput
          placeholder="Click to select your files"
          helperText="Demonstrates placeholder overrides"
          onFilesChange={handleChange('custom')}
          fullWidth
        />
      </Block>
    </Block>
  );
}
