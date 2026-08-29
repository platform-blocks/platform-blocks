import { useState } from 'react';
import { Block, Button, Card, FileInput, Flex, Text } from '@platform-blocks/ui';
import type { FileInputFile } from '@platform-blocks/ui';

export function Demo() {
  const [images, setImages] = useState<FileInputFile[]>([]);

  const handleRemoveFile = (index: number) => {
    setImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <Block fullWidth>
      <FileInput
        label="Upload images"
        accept={['image/*']}
        helperText="Add images to see inline previews"
        onFilesChange={setImages}
        multiple
        fullWidth
      />

      {images.length > 0 && (
        <Block fullWidth>
          <Text size="sm" weight="semibold">
            Selected images ({images.length})
          </Text>
          <Flex direction="row" gap={12} wrap="wrap">
            {images.map((file, index) => (
              <Card key={file.id ?? file.name} p={8} variant="outline" style={{ width: 150 }}>
                <Block>
                  {file.previewUrl && (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                    />
                  )}
                  <Text size="xs" weight="medium" align="center">
                    {file.name}
                  </Text>
                  <Button size="xs" variant="outline" onPress={() => handleRemoveFile(index)}>
                    Remove
                  </Button>
                </Block>
              </Card>
            ))}
          </Flex>
        </Block>
      )}
    </Block>
  );
}
