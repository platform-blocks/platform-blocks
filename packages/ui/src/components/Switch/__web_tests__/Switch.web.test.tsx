import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Switch } from '../Switch';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('Switch (react-native-web DOM)', () => {
  it('exposes role="switch" with aria-checked and the label as its name', () => {
    render(<Switch id="wifi" label="Wi-Fi" />);

    const control = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(control.getAttribute('aria-checked')).toBe('false');
    expect(control.getAttribute('aria-labelledby')).toBe('wifi-label');
    // The on/off words are for native; the web reads aria-checked.
    expect(control.getAttribute('aria-valuetext')).toBeNull();

    fireEvent.click(control);
    expect(control.getAttribute('aria-checked')).toBe('true');
  });

  it('toggles with Space and from its label, as a single tab stop', () => {
    const onChange = jest.fn();
    const { container } = render(<Switch label="Bluetooth" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByText('Bluetooth'));
    expect(onChange).toHaveBeenLastCalledWith(false);

    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('points aria-controls at the element it toggles', () => {
    render(<Switch label="Details" controls="details-panel" />);
    expect(screen.getByRole('switch').getAttribute('aria-controls')).toBe('details-panel');
  });

  it('links helper text and errors', () => {
    const { rerender } = render(<Switch id="sync" label="Sync" helperText="Uses mobile data" />);
    expect(screen.getByRole('switch').getAttribute('aria-describedby')).toBe('sync-helper');

    rerender(
      <PlatformBlocksProvider>
        <Switch id="sync" label="Sync" helperText="Uses mobile data" error="Sync failed" />
      </PlatformBlocksProvider>
    );
    const control = screen.getByRole('switch');
    expect(control.getAttribute('aria-describedby')).toBe('sync-error');
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Sync failed');
  });
});
