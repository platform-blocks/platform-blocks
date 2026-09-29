import type { DocumentPickerAssetLike, FileInputFile, FileInputUploadSettings } from './types';

/** A `FormData` part for a picked file: the `File` on web, RN's `{ uri, name, type }` descriptor on native. */
function toFormDataPart(file: FileInputFile): Blob {
  const source = file.file;
  if (typeof File !== 'undefined' && source instanceof File) return source;
  const assetUri = (source as DocumentPickerAssetLike).uri;
  // React Native's FormData uploads `{ uri, name, type }` objects.
  return { uri: file.uri ?? assetUri ?? '', name: file.name, type: file.type || 'application/octet-stream' } as unknown as Blob;
}

function uploadOne(file: FileInputFile, settings: FileInputUploadSettings, onProgress: (progress: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(settings.method ?? 'POST', settings.url ?? '');
    for (const [header, value] of Object.entries(settings.headers ?? {})) {
      xhr.setRequestHeader(header, value);
    }
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));

    const body = new FormData();
    for (const [key, value] of Object.entries(settings.formData ?? {})) {
      body.append(key, value);
    }
    body.append(settings.fieldName ?? 'file', toFormDataPart(file), file.name);
    xhr.send(body);
  });
}

/**
 * The built-in uploader used when FileInput has `uploadSettings.url` and no
 * `onUpload`: one multipart request per file (XMLHttpRequest, so upload
 * progress works on web and native). Rejects when any upload fails.
 */
export async function uploadFiles(
  files: FileInputFile[],
  settings: FileInputUploadSettings,
  onProgress: (fileId: string, progress: number) => void
): Promise<void> {
  await Promise.all(files.map((file) => uploadOne(file, settings, (progress) => onProgress(file.id, progress))));
}
