/**
 * Native file picking for FileInput (the web version is `filePicker.web.ts`).
 * Uses the optional `expo-document-picker`; without it picking is disabled with
 * a dev warning. Native has no drag-and-drop and no generated previews (images
 * preview from their file `uri`).
 */
import { warnOnce } from '../../core/utils/logger';
import { resolveDocumentPicker } from '../../utils/optionalDependencies';
import type { FileDropHandlers, ImagePreviewOptions, PickFilesOptions } from './filePicker.types';
import type { DocumentPickerAssetLike, FileInputSource } from './types';

export type { FileDropHandlers, ImagePreviewOptions, PickFilesOptions } from './filePicker.types';

interface DocumentPickerResultLike {
  canceled?: boolean;
  assets?: DocumentPickerAssetLike[] | null;
  output?: ArrayLike<File> | null;
}

let documentPicker: ReturnType<typeof resolveDocumentPicker> | null = null;

/** Opens the system document picker; resolves with the picked files, or null when cancelled/unavailable. */
export async function pickFiles({ accept, multiple }: PickFilesOptions): Promise<FileInputSource[] | null> {
  documentPicker ??= resolveDocumentPicker();
  const picker = documentPicker.DocumentPicker;
  if (!documentPicker.hasDocumentPicker || !picker?.getDocumentAsync) {
    warnOnce(
      'file-input:no-document-picker',
      'FileInput: expo-document-picker not installed, native file picker is disabled.'
    );
    return null;
  }

  // The native picker filters by MIME type only; extensions are checked on selection.
  const pickerTypes = accept.filter((type) => !type.startsWith('.'));
  const result = (await picker.getDocumentAsync({
    multiple,
    copyToCacheDirectory: true,
    type: pickerTypes.length > 0 ? pickerTypes : undefined,
  })) as DocumentPickerResultLike | null;

  if (!result || result.canceled) return null;
  if (result.assets?.length) return result.assets;
  if (result.output?.length) return Array.from(result.output);
  return null;
}

/** No drag-and-drop on native. */
export function attachFileDropTarget(_node: unknown, _handlers: FileDropHandlers): () => void {
  return () => {};
}

/** No window to protect on native. */
export function preventWindowFileDrop(): () => void {
  return () => {};
}

/** Native previews come straight from the asset `uri`. */
export async function createImagePreview(
  _file: FileInputSource,
  _options: ImagePreviewOptions
): Promise<string | undefined> {
  return undefined;
}
