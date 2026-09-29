import React, { createRef } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { pickFiles } from '../filePicker';
import { FileInput, formatFileSize, validateFileAgainst } from '../FileInput';
import type { DocumentPickerAssetLike } from '../types';

jest.mock('../filePicker', () => ({
  pickFiles: jest.fn(),
  attachFileDropTarget: jest.fn(() => () => {}),
  preventWindowFileDrop: jest.fn(() => () => {}),
  createImagePreview: jest.fn(async () => undefined),
}));

const mockedPick = pickFiles as jest.MockedFunction<typeof pickFiles>;

const asset = (name: string, size: number, mimeType: string): DocumentPickerAssetLike => ({
  uri: `file:///tmp/${name}`,
  name,
  size,
  mimeType,
});

describe('FileInput (native)', () => {
  beforeEach(() => {
    mockedPick.mockReset();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {});
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it('forwards its ref to the root view', () => {
    const ref = createRef<View>();
    render(<FileInput ref={ref} label="Resume" testID="file" />);
    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('file')).toBeTruthy();
  });

  it('names the picker button by the label and the action', () => {
    render(<FileInput label="Resume" />);
    expect(screen.getByRole('button', { name: 'Resume, Choose File' })).toBeTruthy();
  });

  it('adds picked files, validates them, and removes them', async () => {
    const onFilesChange = jest.fn();
    const onFileRemove = jest.fn();
    mockedPick.mockResolvedValue([asset('cv.pdf', 1000, 'application/pdf'), asset('huge.pdf', 5_000_000, 'application/pdf')]);

    render(
      <FileInput
        label="Documents"
        multiple
        maxSize={1_000_000}
        accept={['application/pdf']}
        onFilesChange={onFilesChange}
        onFileRemove={onFileRemove}
      />
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Documents, Choose Files' }));
    });

    expect(mockedPick).toHaveBeenCalledWith({ accept: ['application/pdf'], multiple: true });
    expect(screen.getByText('cv.pdf')).toBeTruthy();
    expect(screen.getByText('File size exceeds 1.0MB limit')).toBeTruthy();
    expect(onFilesChange).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'cv.pdf', status: 'pending' }),
      expect.objectContaining({ name: 'huge.pdf', status: 'error' }),
    ]);

    fireEvent.press(screen.getByRole('button', { name: 'Remove cv.pdf' }));
    expect(screen.queryByText('cv.pdf')).toBeNull();
    expect(onFileRemove).toHaveBeenCalledWith(expect.any(String));
  });

  it('replaces the file in single mode', async () => {
    mockedPick.mockResolvedValueOnce([asset('a.txt', 10, 'text/plain')]).mockResolvedValueOnce([asset('b.txt', 10, 'text/plain')]);
    render(<FileInput label="File" maxFiles={1} />);
    const button = screen.getByRole('button', { name: 'File, Choose File' });
    await act(async () => fireEvent.press(button));
    await act(async () => fireEvent.press(button));
    expect(screen.queryByText('a.txt')).toBeNull();
    expect(screen.getByText('b.txt')).toBeTruthy();
  });

  it('uploads valid files and reports progress through onUpload helpers', async () => {
    const onProgress = jest.fn();
    const onUpload = jest.fn(async (files, helpers) => {
      helpers.onProgress(files[0].id, 50);
    });
    mockedPick.mockResolvedValue([asset('photo.png', 10, 'image/png')]);

    render(<FileInput label="Photo" onUpload={onUpload} onProgress={onProgress} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Photo, Choose File' }));
    });

    expect(onUpload).toHaveBeenCalledWith([expect.objectContaining({ name: 'photo.png' })], expect.any(Object));
    expect(onProgress).toHaveBeenCalledWith(expect.any(String), 50);
    expect(screen.getByLabelText('Uploaded')).toBeTruthy();
  });

  it('marks failed uploads', async () => {
    mockedPick.mockResolvedValue([asset('photo.png', 10, 'image/png')]);
    render(<FileInput label="Photo" onUpload={async () => Promise.reject(new Error('Server down'))} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Photo, Choose File' }));
    });
    expect(screen.getByText('Server down')).toBeTruthy();
    expect(screen.getByLabelText('Failed')).toBeTruthy();
  });

  it('does not open the picker while disabled', async () => {
    render(<FileInput label="File" disabled />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'File, Choose File' }));
    });
    expect(mockedPick).not.toHaveBeenCalled();
  });

  it('shows the error from the field frame', () => {
    render(<FileInput label="File" error="A file is required" helperText="PDF only" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByText('PDF only')).toBeNull();
  });

  it('sizes the field root with the box props; an explicit `w` wins over `fullWidth`', () => {
    render(<FileInput label="File" testID="file" fullWidth w={240} />);
    expect(StyleSheet.flatten(screen.getByTestId('file').props.style).width).toBe(240);
  });
});

describe('FileInput helpers', () => {
  it('formats sizes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('validates by extension, MIME wildcard and custom check', () => {
    const pdf = asset('doc.PDF', 10, '');
    expect(validateFileAgainst(pdf, { accept: ['.pdf'] })).toBeNull();
    expect(validateFileAgainst(asset('a.png', 10, 'image/png'), { accept: ['image/*'] })).toBeNull();
    expect(validateFileAgainst(asset('a.txt', 10, 'text/plain'), { accept: ['image/*'] })).toMatch(/not accepted/);
    expect(validateFileAgainst(pdf, { validateFile: () => 'Nope' })).toBe('Nope');
  });
});
