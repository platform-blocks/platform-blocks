import { useState } from 'react';
import { Block, Button, FileInput, Flex, Text } from '@platform-blocks/react-ui-library';
import type { FileInputFile } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [files, setFiles] = useState<FileInputFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate upload process for each file
    for (const file of files) {
      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 25) {
        setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    setIsUploading(false);
    alert('Files uploaded successfully!');
    setFiles([]);
    setUploadProgress({});
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Block fullWidth>
      <FileInput
        label="Select files to upload"
        helperText="Choose files and click upload to simulate progress"
        onFilesChange={setFiles}
        multiple
        maxFiles={5}
        maxSize={10 * 1024 * 1024}
        fullWidth
      />

      {files.length > 0 && (
        <Block fullWidth>
          <Text size="sm" weight="semibold">
            Selected files
          </Text>
          <Block>
            {files.map((file, index) => (
              <Flex
                key={file.id ?? file.name}
                direction="row"
                justify="space-between"
                align="center"
                p={8}
                style={{ borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 4 }}
              >
                <Block>
                  <Text size="sm" weight="medium">
                    {file.name}
                  </Text>
                  <Text size="xs" color="secondary">
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                  {uploadProgress[file.name] !== undefined && (
                    <Text size="xs" color="primary">
                      Progress: {uploadProgress[file.name]}%
                    </Text>
                  )}
                </Block>
                <Button size="xs" variant="outline" onPress={() => handleRemove(index)} disabled={isUploading}>
                  Remove
                </Button>
              </Flex>
            ))}
          </Block>

          <Flex direction="row" gap={12} wrap="wrap">
            <Button
              variant="gradient"
              onPress={handleUpload}
              disabled={isUploading || files.length === 0}
              loading={isUploading}
            >
              {isUploading ? 'Uploading…' : 'Upload files'}
            </Button>
            <Button
              variant="outline"
              onPress={() => {
                setFiles([]);
                setUploadProgress({});
              }}
              disabled={isUploading}
            >
              Clear all
            </Button>
          </Flex>
        </Block>
      )}
    </Block>
  );
}
