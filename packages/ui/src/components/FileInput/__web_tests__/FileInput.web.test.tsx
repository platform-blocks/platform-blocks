import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { FileInput } from '../FileInput';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

/** Answers the next file dialog (a transient <input type="file">) with `files`. */
function answerNextFileDialog(files: File[]) {
  const click = jest.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (this: HTMLInputElement) {
    Object.defineProperty(this, 'files', { value: files, configurable: true });
    this.dispatchEvent(new Event('change'));
  });
  return click;
}

describe('FileInput (react-native-web DOM)', () => {
  afterEach(() => jest.restoreAllMocks());

  it('is a button named by the field label and its action, described by the helper text', () => {
    render(<FileInput id="cv" label="Resume" helperText="PDF, max 10MB" />);
    const button = screen.getByRole('button', { name: 'Resume Choose File' });
    expect(button.id).toBe('cv');
    expect(button.getAttribute('aria-describedby')).toBe('cv-helper');
  });

  it('links an error and marks the field invalid', () => {
    render(<FileInput id="cv" label="Resume" error="Please attach a file" />);
    const button = screen.getByRole('button', { name: 'Resume Choose File' });
    expect(button.getAttribute('aria-invalid')).toBe('true');
    expect(button.getAttribute('aria-describedby')).toBe('cv-error');
    expect(screen.getByRole('alert').textContent).toBe('Please attach a file');
  });

  it('opens the browser file dialog and lists the chosen files', async () => {
    const click = answerNextFileDialog([new File(['hello'], 'notes.txt', { type: 'text/plain' })]);
    const onFilesChange = jest.fn();
    render(<FileInput label="Attachment" accept={['.txt']} onFilesChange={onFilesChange} />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Attachment Choose File' }));
    });

    expect(click).toHaveBeenCalled();
    const picker = click.mock.contexts[0] as HTMLInputElement;
    expect(picker.type).toBe('file');
    expect(picker.accept).toBe('.txt');
    expect(document.querySelector('[data-pb-file-picker]')).toBeNull();
    expect(screen.getByText('notes.txt')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove notes.txt' })).toBeTruthy();
    expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'notes.txt', status: 'pending' })]);
  });

  it('accepts files dropped on the drop zone', async () => {
    render(<FileInput label="Photos" variant="dropzone" multiple />);
    const zone = screen.getByRole('button', { name: 'Photos Browse files' });
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    const dataTransfer = { types: ['Files'], files: [file], dropEffect: 'none' };

    fireEvent.dragOver(zone, { dataTransfer });
    expect(screen.getByText('Drop files here')).toBeTruthy();

    await act(async () => {
      fireEvent.drop(zone, { dataTransfer });
    });
    expect(screen.getByText('a.txt')).toBeTruthy();
    expect(screen.getByText('Drag and drop files here')).toBeTruthy();
  });
});
