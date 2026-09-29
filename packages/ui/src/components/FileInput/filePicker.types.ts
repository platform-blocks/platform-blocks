import type { FileInputSource } from './types';

export interface PickFilesOptions {
  /** MIME types (`image/*`) and extensions (`.pdf`). */
  accept: readonly string[];
  multiple: boolean;
}

export interface FileDropHandlers {
  /** Files are being dragged over (true) or left (false) the target. */
  onDragStateChange: (over: boolean) => void;
  onDrop: (files: FileInputSource[]) => void;
}

export interface ImagePreviewOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}
