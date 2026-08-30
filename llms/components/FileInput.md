# FileInput

The FileInput component provides a user-friendly interface for file uploads with drag-and-drop functionality, file validation, and preview capabilities.

## Metadata

- Canonical name: `FileInput`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { FileInput } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: input
- Docs: https://react-ui-library.com/components/FileInput
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/FileInput

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | 'standard' \| 'dropzone' \| 'compact' | No |  | File input variant |
| `accept` | string[] | No |  | Accepted file types (MIME types or extensions) |
| `multiple` | boolean | No |  | Multiple file selection |
| `maxSize` | number | No |  | Maximum file size in bytes |
| `maxFiles` | number | No |  | Maximum number of files |
| `onUpload` | (files: FileInputFile[]) => Promise<void> | No |  | Upload handler |
| `onProgress` | (fileId: string, progress: number) => void | No |  | Upload progress callback |
| `onFilesChange` | (files: FileInputFile[]) => void | No |  | File change handler |
| `onFileRemove` | (fileId: string) => void | No |  | File remove handler |
| `PreviewComponent` | React.ComponentType<{ file: FileInputFile; onRemove: () => void }> | No |  | File preview component |
| `children` | React.ReactNode | No |  | Custom drop zone content |
| `showFileList` | boolean | No |  | Whether to show file list |
| `enableDragDrop` | boolean | No |  | Whether to enable drag and drop |
| `validateFile` | (file: File \| DocumentPickerAssetLike) => string \| null | No |  | Custom validation function |
| `imagePreview` | { enabled?: boolean; maxWidth?: number; maxHeight?: number; quality?: number; } | No |  | Image preview settings |
| `uploadSettings` | { url?: string; method?: 'POST' \| 'PUT'; headers?: Record<string, string>; fieldName?: string; formData?: Record<string, string>; } | No |  | Upload settings |
| `value` | string | No |  | Input value |
| `onChangeText` | (text: string) => void | No |  | Change handler |
| `label` | React.ReactNode | No |  | Input label (string or component) |
| `disabled` | boolean | No |  | Whether input is disabled |
| `required` | boolean | No |  | Whether input is required |
| `placeholder` | string | No |  | Input placeholder |
| `error` | string | No |  | Error message |
| `helperText` | string | No |  | Helper text |
| `description` | string | No |  | Optional short description displayed directly under the label (above the field) |
| `size` | SizeValue | No |  | Input size |
| `withAsterisk` | boolean | No |  | Whether to show required indicator |
| `name` | string | No |  | Input name for form integration |
| `startSection` | React.ReactNode | No |  | Left section content |
| `endSection` | React.ReactNode | No |  | Right section content |
| `style` | any | No |  | Additional styling |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `accessibilityHint` | string | No |  | Accessibility hint |
| `testID` | string | No |  | Test ID for testing |
| `debounceMs` | number | No |  | Debounce delay for validation in milliseconds |
| `onFocus` | () => void | No |  | Focus handler |
| `onBlur` | () => void | No |  | Blur handler |
| `onEnter` | () => void | No |  | Enter key press handler |
| `clearable` | boolean | No |  | Show built-in clear button when input has value |
| `clearButtonLabel` | string | No |  | Accessible label for the clear button |
| `onClear` | () => void | No |  | Callback when the clear button is pressed |
| `keyboardFocusId` | string | No |  | Identifier used with KeyboardManagerProvider to request refocus |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field label `<Text>` (style, weight, ff, etc.) |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the field description `<Text>` |
| `placeholderTextColor` | string | No |  | Color of the placeholder text. Falls back to `theme.text.muted`. |
| `startSectionProps` | Omit<ViewProps, 'children'> | No |  | Props applied to the wrapping `<View>` around `startSection` (style, accessibility, etc.). |
| `endSectionProps` | Omit<ViewProps, 'children'> | No |  | Props applied to the wrapping `<View>` around `endSection`. |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basic
ID: `FileInput.basic` • Tags: basic, upload, files • Category: basics • Status: stable • Since: 1.0.0

Simple file input with helper text and multiple file selection.

```tsx
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
        <Text size="xs" color="secondary">
          Selected: {files.map((file) => file.name).join(', ')}
        </Text>
      )}
    </Block>
  );
}
```

### Dropzone
ID: `FileInput.dropzone` • Tags: dropzone, drag-and-drop, upload • Category: variants • Status: stable • Since: 1.0.0

Drag-and-drop dropzone variant with native fallback instructions and selected file list.

```tsx
const [files, setFiles] = useState<FileInputFile[]>([]);
  const instructions =
    Platform.OS === 'web'
      ? 'Drag files into the dropzone or click Browse files to pick from your desktop.'
      : 'Tap the dropzone to open the native file picker on touch devices.';
  return (
    <Block fullWidth>
      <Text size="sm" color="secondary">
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
              <Text key={file.id} size="xs" color="secondary">
                {file.name}
              </Text>
            ))}
          </Block>
        </Block>
      )}
    </Block>
  );
}
```

### File Type Restrictions
ID: `FileInput.fileTypes` • Tags: accept, validation, upload • Category: features • Status: stable • Since: 1.0.0

Configure different file inputs with MIME filters, extension lists, and size limits.

```tsx
const [imageFiles, setImageFiles] = useState<FileInputFile[]>([]);
  const [documentFiles, setDocumentFiles] = useState<FileInputFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<FileInputFile[]>([]);
  return (
    <Block fullWidth>
      <Block>
        <Text weight="semibold">File type restrictions</Text>
        <Text size="sm" color="secondary">
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
          <Text size="xs" color="secondary">
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
          <Text size="xs" color="secondary">
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
          <Text size="xs" color="secondary">
            Selected: {videoFiles.map((file) => file.name).join(', ')}
          </Text>
        )}
      </Block>
    </Block>
  );
}
```

### Image Preview
ID: `FileInput.imagePreview` • Category: general

Image upload with preview thumbnails and remove functionality.

```tsx
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
```

### Size Variants
ID: `FileInput.variants` • Category: general

Different size variants and customization options.

```tsx
const sizes = [
  { label: 'Small', size: 'sm' as const },
  { label: 'Medium (default)', size: 'md' as const },
  { label: 'Large', size: 'lg' as const },
];
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
```

### Upload Progress
ID: `FileInput.upload` • Category: general

File upload with progress simulation and bulk actions.

```tsx
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
```

### Validation & States
ID: `FileInput.validation` • Category: general

File input with various validation rules and states.

```tsx
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
```
