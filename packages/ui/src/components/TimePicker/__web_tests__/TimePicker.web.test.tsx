import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { TimePicker } from '../TimePicker';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('TimePicker (react-native-web DOM)', () => {
  it('is a named group of adjustable wheels, one per column, without duplicate caption text', () => {
    render(<TimePicker withSeconds format={12} defaultValue={{ hours: 14, minutes: 5, seconds: 0 }} minuteStep={5} />);
    const group = screen.getByRole('group', { name: 'Time' });
    expect(group).toBeTruthy();
    for (const name of ['Hour', 'Minute', 'Second', 'Period']) {
      expect(screen.getByRole('slider', { name })).toBeTruthy();
    }
    // Visible captions are aria-hidden: each column is announced once, by its wheel.
    const captions = Array.from(document.querySelectorAll('[aria-hidden="true"]')).map((node) => node.textContent);
    expect(captions).toEqual(expect.arrayContaining(['Hour', 'Minute', 'Second', 'Period']));
  });
});
