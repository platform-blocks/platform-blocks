# FileInput

The FileInput component provides a user-friendly interface for file uploads with drag-and-drop functionality, file validation, and preview capabilities.

## Metadata

- Import: `import { FileInput } from '@plocks/ui';`
- Docs: https://plocks.dev/components/FileInput
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/FileInput

## Props

- `id`: string — Id of the picker button; label/error ids derive from it. Generated when omitted.
- `variant`: 'standard' | 'dropzone' | 'compact' — File input variant
- `placeholder`: string — Prompt text: the picker button's text (`standard`, `compact`) or the drop zone's main line (`dropzone`). Defaults to "Choose File(s)" / "Upload" / "Drag and drop files here".
- `accept`: string[] — Accepted file types (MIME types like `image/*`, or extensions like `.pdf`)
- `multiple`: boolean — Multiple file selection
- `maxSize`: number — Maximum file size in bytes
- `maxFiles`: number — Maximum number of files
- `onUpload`: (files: FileInputFile[], helpers: FileUploadHelpers) => Promise<void> — Upload handler, called with the newly added valid files. Report progress with `helpers.onProgress(fileId, percent)`; reject to mark them failed.
- `onProgress`: (fileId: string, progress: number) => void — Upload progress callback (from `helpers.onProgress` or the built-in uploader)
- `onFilesChange`: (files: FileInputFile[]) => void — Called with the full list when files are added or removed
- `onFileRemove`: (fileId: string) => void — File remove handler
- `PreviewComponent`: React.ComponentType<{ file: FileInputFile; onRemove: () => void }> — Custom renderer for each file in the list
- `children`: React.ReactNode — Custom drop zone content (`variant="dropzone"`)
- `showFileList`: boolean — Whether to show file list
- `enableDragDrop`: boolean — Whether to enable drag and drop (web; default on web)
- `validateFile`: (file: FileInputSource) => string | null — Custom validation: return an error message, or null when the file is fine
- `imagePreview`: { enabled?: boolean; maxWidth?: number; maxHeight?: number; quality?: number; } — Image preview settings
- `uploadSettings`: FileInputUploadSettings — Built-in multipart uploader, used when there is no `onUpload`
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — field (`label` `description` `error` `helperText` `required` `withAsterisk` `disabled` `readOnly` `size` `radius` `name` `accessibilityLabel` `accessibilityHint` `keyboardFocusId` `labelProps` `descriptionProps` `onFocus` `onBlur`), base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`), disclaimer (`disclaimer` `disclaimerProps`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface FileInputFile {
  /** File object or document picker asset */
  file: FileInputSource;
  /** Unique identifier */
  id: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Native file URI (if available) */
  uri?: string;
  /** Preview URL (for images) */
  previewUrl?: string;
  /** Upload progress (0-100) */
  progress?: number;
  /** Upload status */
  status?: 'pending' | 'uploading' | 'success' | 'error';
  /** Error message if validation or upload failed */
  error?: string;
}

export interface FileUploadHelpers {
  /** Report upload progress (0-100) for one file; updates the list and calls `onProgress`. */
  onProgress: (fileId: string, progress: number) => void;
}

export type FileInputSource = File | DocumentPickerAssetLike;

export interface FileInputUploadSettings {
  /** Upload URL (required for the built-in uploader) */
  url?: string;
  /** HTTP method */
  method?: 'POST' | 'PUT';
  /** Additional headers */
  headers?: Record<string, string>;
  /** Form field name for files (default `'file'`) */
  fieldName?: string;
  /** Additional form data */
  formData?: Record<string, string>;
}

export interface DocumentPickerAssetLike {
  uri?: string | null;
  name?: string | null;
  size?: number | null;
  mimeType?: string | null;
  type?: string | null;
  file?: File;
  fileCopyUri?: string | null;
  [key: string]: unknown;
}
```

## Examples

### Basics

Simple file input with helper text and multiple file selection.

```tsx
import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Upload files"
        helperText="Choose files from your device"
        multiple
        fullWidth
      />
    </Block>
  );
}
```

### Dropzone

Drag-and-drop dropzone variant with native fallback instructions and selected file list.

```tsx
import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        variant="dropzone"
        multiple
        helperText="Drag & drop on desktop or tap to browse on mobile"
        fullWidth
      />
    </Block>
  );
}
```

### File Type Restrictions

Configure different file inputs with MIME filters, extension lists, and size limits.

```tsx
import { Block, FileInput } from '@plocks/ui';

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
```

### Image Preview

Image upload with preview thumbnails and remove functionality.

```tsx
import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Upload images"
        accept={['image/*']}
        helperText="Add images to see inline previews"
        multiple
        fullWidth
      />
    </Block>
  );
}
```

### Size Variants

Different size variants and customization options.

```tsx
import { Block, FileInput } from '@plocks/ui';

const sizes = [
  { label: 'Small', size: 'sm' as const },
  { label: 'Medium (default)', size: 'md' as const },
  { label: 'Large', size: 'lg' as const },
];

export function Demo() {
  return (
    <Block fullWidth>
      {sizes.map(({ label, size }) => (
        <FileInput key={size} label={label} size={size} fullWidth />
      ))}
      <FileInput
        label="Custom placeholder"
        placeholder="Click to select your files"
        fullWidth
      />
    </Block>
  );
}
```

### Upload Progress

Upload files with `onUpload` and report each file's progress with its `onProgress` helper.

```tsx
import { Block, FileInput } from '@plocks/ui';

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
```

### Validation & States

File input with various validation rules and states.

```tsx
import { Block, FileInput } from '@plocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <FileInput
        label="Upload small files"
        helperText="Files must be below 2MB"
        maxSize={2 * 1024 * 1024}
        multiple
        fullWidth
      />
      <FileInput
        label="Upload up to 3 files"
        maxFiles={3}
        multiple
        fullWidth
      />
      <FileInput
        label="Required upload"
        error="Please select at least one file"
        required
        fullWidth
      />
      <FileInput
        label="Disabled upload"
        helperText="The uploader is unavailable"
        disabled
        fullWidth
      />
    </Block>
  );
}
```
