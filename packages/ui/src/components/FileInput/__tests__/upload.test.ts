import { uploadFiles } from '../upload';
import type { FileInputFile } from '../types';

class FakeXHR {
  static instances: FakeXHR[] = [];
  method = '';
  url = '';
  headers: Record<string, string> = {};
  status = 200;
  body: unknown;
  upload: { onprogress: ((event: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = {
    onprogress: null,
  };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    FakeXHR.instances.push(this);
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(header: string, value: string) {
    this.headers[header] = value;
  }
  send(body: unknown) {
    this.body = body;
  }
}

/** React Native's FormData accepts `{ uri, name, type }` parts; Node's (undici) only Blobs. */
class FakeFormData {
  parts: Array<[string, unknown]> = [];
  append(key: string, value: unknown) {
    this.parts.push([key, value]);
  }
}

const file: FileInputFile = {
  file: { uri: 'file:///tmp/a.png', name: 'a.png' },
  id: 'f1',
  name: 'a.png',
  size: 10,
  type: 'image/png',
  uri: 'file:///tmp/a.png',
};

describe('uploadFiles', () => {
  const realXHR = global.XMLHttpRequest;
  const realFormData = global.FormData;
  beforeEach(() => {
    FakeXHR.instances = [];
    (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = FakeXHR;
    (global as unknown as { FormData: unknown }).FormData = FakeFormData;
  });
  afterEach(() => {
    global.XMLHttpRequest = realXHR;
    global.FormData = realFormData;
  });

  it('posts each file as multipart data with headers and reports progress', async () => {
    const onProgress = jest.fn();
    const done = uploadFiles(
      [file],
      { url: 'https://example.com/upload', method: 'PUT', headers: { Authorization: 'x' }, fieldName: 'upload', formData: { folder: 'docs' } },
      onProgress
    );
    const xhr = FakeXHR.instances[0];
    expect(xhr.method).toBe('PUT');
    expect(xhr.url).toBe('https://example.com/upload');
    expect(xhr.headers).toEqual({ Authorization: 'x' });
    expect((xhr.body as FakeFormData).parts).toEqual([
      ['folder', 'docs'],
      ['upload', { uri: 'file:///tmp/a.png', name: 'a.png', type: 'image/png' }],
    ]);

    xhr.upload.onprogress?.({ lengthComputable: true, loaded: 5, total: 10 });
    expect(onProgress).toHaveBeenCalledWith('f1', 50);

    xhr.onload?.();
    await expect(done).resolves.toBeUndefined();
  });

  it('rejects on a failed status', async () => {
    const done = uploadFiles([file], { url: '/upload' }, () => {});
    const xhr = FakeXHR.instances[0];
    xhr.status = 500;
    xhr.onload?.();
    await expect(done).rejects.toThrow('Upload failed (500)');
  });
});
