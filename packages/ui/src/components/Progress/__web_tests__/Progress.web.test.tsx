import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Progress } from '../Progress';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Progress (react-native-web DOM)', () => {
  it('is a progressbar with its range and (clamped) value in the DOM', () => {
    render(<Progress value={150} aria-label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
  });

  it('carries custom value text', () => {
    render(<Progress value={37.5} aria-label="Files" aria-valuetext="3 of 8 files" />);
    const bar = screen.getByRole('progressbar', { name: 'Files' });
    expect(bar.getAttribute('aria-valuenow')).toBe('37.5');
    expect(bar.getAttribute('aria-valuetext')).toBe('3 of 8 files');
  });

  it('is named by its visible label and described by the error, which is an alert', () => {
    render(<Progress value={40} label="Uploading assets" error="Upload failed" />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading assets' });
    const labelId = bar.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId as string)?.textContent).toBe('Uploading assets');

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Upload failed');
    expect(bar.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('exposes every section of a segmented bar as its own progressbar inside a named group', () => {
    render(
      <Progress.Root aria-label="Storage">
        <Progress.Section value={30} aria-label="Photos" />
        <Progress.Section value={45} aria-label="Documents" />
      </Progress.Root>
    );
    expect(screen.getByRole('group', { name: 'Storage' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Photos' }).getAttribute('aria-valuenow')).toBe('30');
    expect(screen.getByRole('progressbar', { name: 'Documents' }).getAttribute('aria-valuenow')).toBe('45');
  });
});
