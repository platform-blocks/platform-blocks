/**
 * Web file picking for FileInput (the native version is `filePicker.ts`): a
 * transient `<input type="file">`, HTML5 drag-and-drop on the drop zone, and
 * downscaled image previews via canvas.
 */
import { hasDOM } from '../../core/platform';
import type { FileDropHandlers, ImagePreviewOptions, PickFilesOptions } from './filePicker.types';
import type { FileInputSource } from './types';

export type { FileDropHandlers, ImagePreviewOptions, PickFilesOptions } from './filePicker.types';

/**
 * Opens the browser file dialog. Resolves with the chosen files, or null when
 * the dialog is cancelled (browsers without the `cancel` event never resolve a
 * cancelled pick, which is harmless).
 */
export function pickFiles({ accept, multiple }: PickFilesOptions): Promise<FileInputSource[] | null> {
  if (!hasDOM) return Promise.resolve(null);

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (accept.length > 0) input.accept = accept.join(',');
    input.style.display = 'none';
    input.setAttribute('data-plocks-file-picker', '');

    const finish = (files: FileInputSource[] | null) => {
      input.remove();
      resolve(files);
    };
    input.addEventListener('change', () => finish(input.files ? Array.from(input.files) : null), { once: true });
    input.addEventListener('cancel', () => finish(null), { once: true });

    // Safari only opens the dialog for an input that is in the document.
    document.body.appendChild(input);
    input.click();
  });
}

const hasFiles = (event: DragEvent) => !!event.dataTransfer && Array.from(event.dataTransfer.types).includes('Files');

/**
 * Makes `node` (a react-native-web View's DOM element) a file drop target.
 * Returns the cleanup.
 */
export function attachFileDropTarget(node: unknown, handlers: FileDropHandlers): () => void {
  if (!hasDOM || !(node instanceof HTMLElement)) return () => {};
  const element = node;

  const onDragOver = (event: DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    handlers.onDragStateChange(true);
  };
  const onDragLeave = (event: DragEvent) => {
    // Only when leaving the zone itself, not when moving between its children.
    if (event.relatedTarget instanceof Node && element.contains(event.relatedTarget)) return;
    handlers.onDragStateChange(false);
  };
  const onDrop = (event: DragEvent) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    event.stopPropagation();
    handlers.onDragStateChange(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) handlers.onDrop(Array.from(files));
  };

  element.addEventListener('dragenter', onDragOver);
  element.addEventListener('dragover', onDragOver);
  element.addEventListener('dragleave', onDragLeave);
  element.addEventListener('drop', onDrop);
  return () => {
    element.removeEventListener('dragenter', onDragOver);
    element.removeEventListener('dragover', onDragOver);
    element.removeEventListener('dragleave', onDragLeave);
    element.removeEventListener('drop', onDrop);
  };
}

/**
 * Stops the browser from navigating to a file dropped next to (not on) a drop
 * zone. Only file drags are touched, so other drag-and-drop on the page keeps
 * working. Returns the cleanup.
 */
export function preventWindowFileDrop(): () => void {
  if (!hasDOM) return () => {};
  const prevent = (event: DragEvent) => {
    if (hasFiles(event)) event.preventDefault();
  };
  document.addEventListener('dragover', prevent);
  document.addEventListener('drop', prevent);
  return () => {
    document.removeEventListener('dragover', prevent);
    document.removeEventListener('drop', prevent);
  };
}

/** A downscaled JPEG data URL of an image `File`, or undefined for anything else. */
export function createImagePreview(file: FileInputSource, options: ImagePreviewOptions): Promise<string | undefined> {
  if (!hasDOM || typeof File === 'undefined' || !(file instanceof File) || !file.type.startsWith('image/')) {
    return Promise.resolve(undefined);
  }

  const { maxWidth = 200, maxHeight = 200, quality = 0.8 } = options;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(undefined);
    reader.onload = () => {
      const img = document.createElement('img');
      img.onerror = () => resolve(undefined);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = typeof reader.result === 'string' ? reader.result : '';
    };
    reader.readAsDataURL(file);
  });
}
