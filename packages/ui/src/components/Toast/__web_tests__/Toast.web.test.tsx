import React from 'react';
import { Pressable, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Toast } from '../Toast';
import { ToastProvider, useToast } from '../ToastProvider';
import { clearAnnouncer } from '../../../core/accessibility/announce';

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  clearAnnouncer();
});

/** Advances in steps so timers scheduled by each step's re-render also run. */
function advance(ms: number, step = 250) {
  for (let elapsed = 0; elapsed < ms; elapsed += step) {
    act(() => {
      jest.advanceTimersByTime(step);
    });
  }
}

function liveRegion(politeness: 'polite' | 'assertive'): HTMLElement | null {
  return document.querySelector(`[data-plocks-announcer] [aria-live="${politeness}"]`);
}

function Trigger({ options }: { options: Parameters<ReturnType<typeof useToast>['show']>[0] }) {
  const toast = useToast();
  return (
    <Pressable role="button" accessibilityLabel="Notify" onPress={() => toast.show(options)}>
      <Text>Notify</Text>
    </Pressable>
  );
}

describe('Toast (react-native-web DOM)', () => {
  it('announces itself when shown (polite by default, assertive for errors)', () => {
    const { rerender } = render(<Toast visible title="Saved" autoHide={0}>Your changes are live</Toast>);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(liveRegion('polite')?.textContent).toBe('Saved. Your changes are live');

    rerender(<Toast visible={false} title="Saved" autoHide={0}>Your changes are live</Toast>);
    render(<Toast visible severity="error" title="Upload failed" autoHide={0} />);
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(liveRegion('assertive')?.textContent).toBe('Upload failed');
  });

  it('names the toast from element children as text (never "[object Object]")', () => {
    render(
      <Toast visible autoHide={0} title="Invite sent" testID="toast">
        <Text>
          to <Text>ada@example.com</Text>
        </Text>
      </Toast>
    );
    const group = screen.getByRole('group', { name: 'Invite sent. to ada@example.com' });
    expect(group.getAttribute('aria-label')).not.toContain('[object Object]');
    expect(screen.getByRole('button', { name: 'Close notification' })).toBeTruthy();
  });

  it('Escape dismisses the toast while focus is inside it', () => {
    const onClose = jest.fn();
    render(<Toast visible autoHide={0} title="Heads up" onClose={onClose} />);
    const close = screen.getByRole('button', { name: 'Close notification' });
    act(() => close.focus());
    fireEvent.keyDown(close, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-hides (baseline)', () => {
    render(
      <ToastProvider>
        <Trigger options={{ title: 'Bye', autoHide: 1000, testID: 'toast' }} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    advance(3_000);
    // (The text also lives on in the announcer's live region for a while.)
    expect(screen.queryByTestId('toast')).toBeNull();
  });

  it('pauses the countdown while the pointer rests on the stack', () => {
    render(
      <ToastProvider>
        <Trigger options={{ title: 'Read me', autoHide: 1000, testID: 'toast' }} />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Notify' }));
    advance(500);
    const toast = screen.getByTestId('toast');
    fireEvent.mouseEnter(toast);
    advance(5_000);
    expect(screen.queryByTestId('toast')).toBeTruthy();

    // Leaving resumes the remaining time, then the exit transition runs.
    fireEvent.mouseLeave(toast);
    advance(3_000);
    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
