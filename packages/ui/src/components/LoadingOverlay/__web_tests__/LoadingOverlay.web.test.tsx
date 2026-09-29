import React from 'react';
import { Text, View } from 'react-native';
import { act, render, screen } from '@testing-library/react';

import { LoadingOverlay } from '../LoadingOverlay';
import { clearAnnouncer } from '../../../core/accessibility/announce';

describe('LoadingOverlay (react-native-web DOM)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    clearAnnouncer();
  });

  function Region({ visible }: { visible: boolean }) {
    return (
      <View testID="region">
        <Text>Form</Text>
        <LoadingOverlay visible={visible} loadingLabel="Saving profile" />
      </View>
    );
  }

  it('marks the covered region aria-busy and exposes a named progress indicator', () => {
    const { rerender } = render(<Region visible />);
    const region = screen.getByTestId('region');
    expect(region.getAttribute('aria-busy')).toBe('true');
    const indicator = screen.getByRole('progressbar', { name: 'Saving profile' });
    expect(indicator.getAttribute('aria-busy')).toBe('true');

    rerender(<Region visible={false} />);
    expect(region.getAttribute('aria-busy')).toBeNull();
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('announces only waits longer than announceAfter', () => {
    const live = () => document.querySelector('[data-pb-announcer] [aria-live="polite"]')?.textContent ?? '';
    const { rerender } = render(<Region visible />);
    act(() => {
      jest.advanceTimersByTime(500);
    });
    rerender(<Region visible={false} />);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(live()).toBe('');

    rerender(<Region visible />);
    act(() => {
      jest.advanceTimersByTime(1100);
    });
    expect(live()).toBe('Saving profile');
  });
});
