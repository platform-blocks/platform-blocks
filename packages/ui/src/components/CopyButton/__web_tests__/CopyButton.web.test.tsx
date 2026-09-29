import React from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { clearAnnouncer } from '../../../core/accessibility/announce';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { CopyButton } from '../CopyButton';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

describe('CopyButton (react-native-web DOM)', () => {
  const writeText = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    jest.useFakeTimers();
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    clearAnnouncer();
    jest.useRealTimers();
  });

  it('is a button named "Copy" that copies, calls onCopy and announces "Copied"', async () => {
    const onCopy = jest.fn();
    const ref = React.createRef<unknown>();
    render(<CopyButton ref={ref as never} value="npm i @platform-blocks/ui" onCopy={onCopy} disableToast />);
    expect(ref.current).toBeTruthy();

    const button = screen.getByRole('button', { name: 'Copy' });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledWith('npm i @platform-blocks/ui');
    expect(onCopy).toHaveBeenCalledWith('npm i @platform-blocks/ui');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    const live = document.querySelector('[data-pb-announcer] [aria-live="polite"]');
    expect(live?.textContent).toBe('Copied');
  });

  it('does not call onCopy when copying fails (onCopyError instead)', async () => {
    writeText.mockImplementationOnce(() => Promise.reject(new Error('denied')));
    const onCopy = jest.fn();
    const onCopyError = jest.fn();
    const execCommand = jest.fn(() => false);
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
    render(<CopyButton value="secret" onCopy={onCopy} onCopyError={onCopyError} disableToast />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    });
    expect(onCopy).not.toHaveBeenCalled();
    expect(onCopyError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('iconOnly={false} renders a labelled button', () => {
    render(<CopyButton value="x" iconOnly={false} label="Copy key" />);
    expect(screen.getByRole('button', { name: 'Copy key' }).textContent).toContain('Copy key');
  });
});
