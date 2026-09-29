import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

const mockCopy = jest.fn<Promise<boolean>, [unknown]>();
let mockCopied = false;
let mockError: Error | null = null;

jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy, copied: mockCopied, error: mockError }),
}));

import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    mockCopy.mockReset();
    mockCopy.mockResolvedValue(true);
    mockCopied = false;
    mockError = null;
  });

  it('is a button named by its label and copies the value', async () => {
    const { getByRole } = render(<CopyButton value="abc" />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Copy' }));
    });
    expect(mockCopy).toHaveBeenCalledWith('abc');
  });

  it('calls onCopy and announces "Copied" once the copy resolved successfully', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    // iOS queues polite announcements through the options variant.
    const announceWithOptionsSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});
    let resolveCopy: (ok: boolean) => void = () => {};
    mockCopy.mockImplementation(() => new Promise<boolean>((resolve) => { resolveCopy = resolve; }));
    const onCopy = jest.fn();
    const { getByRole, rerender } = render(<CopyButton value="abc" onCopy={onCopy} />);
    fireEvent.press(getByRole('button', { name: 'Copy' }));
    // Not yet: the copy hasn't reported success.
    expect(onCopy).not.toHaveBeenCalled();

    await act(async () => {
      resolveCopy(true);
    });
    expect(onCopy).toHaveBeenCalledWith('abc');
    const announced = [...announceSpy.mock.calls, ...announceWithOptionsSpy.mock.calls].map(([message]) => message);
    expect(announced).toContain('Copied');

    // The hook's `copied` state drives the label (a changed prop re-renders the memoized component).
    mockCopied = true;
    act(() => {
      rerender(<CopyButton value="abc" onCopy={onCopy} tooltipPosition="bottom" />);
    });
    expect(getByRole('button', { name: 'Copied' })).toBeTruthy();
    announceSpy.mockRestore();
    announceWithOptionsSpy.mockRestore();
  });

  it('calls onCopyError (not onCopy) when the copy failed', async () => {
    mockCopy.mockResolvedValue(false);
    const onCopy = jest.fn();
    const onCopyError = jest.fn();
    const { getByRole, rerender } = render(<CopyButton value="abc" onCopy={onCopy} onCopyError={onCopyError} />);
    await act(async () => {
      fireEvent.press(getByRole('button', { name: 'Copy' }));
    });
    expect(onCopy).not.toHaveBeenCalled();

    const failure = new Error('denied');
    mockError = failure;
    act(() => {
      rerender(<CopyButton value="abc" onCopy={onCopy} onCopyError={onCopyError} tooltipPosition="bottom" />);
    });
    expect(onCopyError).toHaveBeenCalledWith(failure);
    expect(onCopy).not.toHaveBeenCalled();
  });

  it('renders a labelled button when iconOnly is false', () => {
    const { getByText } = render(<CopyButton value="abc" iconOnly={false} label="Copy key" />);
    expect(getByText('Copy key')).toBeTruthy();
  });
});
