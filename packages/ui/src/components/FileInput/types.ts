import type React from 'react';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';

/** A file from `expo-document-picker` (native). */
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

/** What the user picked: a DOM `File` (web) or a document-picker asset (native). */
export type FileInputSource = File | DocumentPickerAssetLike;

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

/** Passed to `onUpload` as its second argument. */
export interface FileUploadHelpers {
  /** Report upload progress (0-100) for one file; updates the list and calls `onProgress`. */
  onProgress: (fileId: string, progress: number) => void;
}

/** Built-in uploader settings (used when `onUpload` is not given). */
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

export interface FileInputProps extends Omit<FieldBaseProps, 'variant'> {
  /** Id of the picker button; label/error ids derive from it. Generated when omitted. */
  id?: string;

  /** File input variant */
  variant?: 'standard' | 'dropzone' | 'compact';

  /**
   * Prompt text: the picker button's text (`standard`, `compact`) or the drop
   * zone's main line (`dropzone`). Defaults to "Choose File(s)" / "Upload" /
   * "Drag and drop files here".
   */
  placeholder?: string;

  /** Accepted file types (MIME types like `image/*`, or extensions like `.pdf`) */
  accept?: string[];

  /** Multiple file selection */
  multiple?: boolean;

  /** Maximum file size in bytes */
  maxSize?: number;

  /** Maximum number of files */
  maxFiles?: number;

  /**
   * Upload handler, called with the newly added valid files. Report progress
   * with `helpers.onProgress(fileId, percent)`; reject to mark them failed.
   */
  onUpload?: (files: FileInputFile[], helpers: FileUploadHelpers) => Promise<void>;

  /** Upload progress callback (from `helpers.onProgress` or the built-in uploader) */
  onProgress?: (fileId: string, progress: number) => void;

  /** Called with the full list when files are added or removed */
  onFilesChange?: (files: FileInputFile[]) => void;

  /** File remove handler */
  onFileRemove?: (fileId: string) => void;

  /** Custom renderer for each file in the list */
  PreviewComponent?: React.ComponentType<{ file: FileInputFile; onRemove: () => void }>;

  /** Custom drop zone content (`variant="dropzone"`) */
  children?: React.ReactNode;

  /** Whether to show file list */
  showFileList?: boolean;

  /** Whether to enable drag and drop (web; default on web) */
  enableDragDrop?: boolean;

  /** Custom validation: return an error message, or null when the file is fine */
  validateFile?: (file: FileInputSource) => string | null;

  /** Image preview settings */
  imagePreview?: {
    /** Enable image previews */
    enabled?: boolean;
    /** Maximum preview width */
    maxWidth?: number;
    /** Maximum preview height */
    maxHeight?: number;
    /** Preview quality (0-1) */
    quality?: number;
  };

  /** Built-in multipart uploader, used when there is no `onUpload` */
  uploadSettings?: FileInputUploadSettings;
}
