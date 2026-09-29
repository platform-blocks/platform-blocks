import React from 'react';
import { StyleSheet, View } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Waveform } from '../Waveform';
import { WaveformSkeleton } from '../WaveformSkeleton';

const PEAKS = [0.1, 0.6, 0.3, 0.9, 0.4, 0.2, 0.75, 0.5, 0.35, 0.65];

describe('Waveform accessibility', () => {
  it('is a named image when not interactive', () => {
    render(<Waveform peaks={PEAKS} testID="wave" />);
    const node = screen.getByTestId('wave');
    expect(node.props.role).toBe('img');
    expect(node.props['aria-label']).toBe('Audio waveform visualization');
    expect(node.props['aria-valuenow']).toBeUndefined();
  });

  it('is a seek slider with aria-value* when interactive with onSeek', () => {
    render(<Waveform peaks={PEAKS} interactive onSeek={jest.fn()} progress={0.25} duration={200} testID="wave" />);
    const slider = screen.getByRole('slider', { name: 'Audio waveform' });
    expect(slider.props['aria-valuemin']).toBe(0);
    expect(slider.props['aria-valuemax']).toBe(100);
    expect(slider.props['aria-valuenow']).toBe(25);
    expect(slider.props['aria-valuetext']).toBe('0:50 of 3:20');
  });

  it('seeks through the screen-reader adjust actions (5 s steps with a duration)', () => {
    const onSeek = jest.fn();
    render(<Waveform peaks={PEAKS} interactive onSeek={onSeek} progress={0.5} duration={100} />);
    const slider = screen.getByRole('slider');
    fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onSeek).toHaveBeenLastCalledWith(0.55);
    // The parent hasn't re-rendered with the new progress, so the next step builds on 0.55.
    fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'decrement' } });
    expect(onSeek).toHaveBeenLastCalledWith(0.5);
  });

  it('seeks on press', () => {
    const onSeek = jest.fn();
    render(<Waveform peaks={PEAKS} w={30} barWidth={2} barGap={1} interactive onSeek={onSeek} />);
    const slider = screen.getByRole('slider');
    fireEvent(slider, 'responderGrant', { nativeEvent: { locationX: 14.5 } });
    expect(onSeek).toHaveBeenCalledWith(0.5);
  });

  it('shows a busy progressbar skeleton while loading, with loadingProgress', () => {
    render(<Waveform peaks={PEAKS} loading loadingProgress={0.4} testID="wave" />);
    const skeleton = screen.getByTestId('wave');
    expect(skeleton.props.role).toBe('progressbar');
    expect(skeleton.props['aria-busy']).toBe(true);
    expect(skeleton.props['aria-valuenow']).toBe(40);
  });

  it('announces errors as an alert', () => {
    render(<Waveform peaks={PEAKS} error="Could not decode" testID="wave" />);
    expect(screen.getByTestId('wave').props.role).toBe('alert');
    expect(screen.getByText('Could not decode')).toBeTruthy();
  });

  it('forwards the ref, applies spacing and merges array styles', () => {
    const ref = React.createRef<View>();
    render(<Waveform ref={ref} peaks={PEAKS} testID="wave" mt={8} style={[{ opacity: 0.5 }, { borderWidth: 1 }]} />);
    expect(ref.current).not.toBeNull();
    const flat = StyleSheet.flatten(screen.getByTestId('wave').props.style);
    expect(flat.marginTop).toBe(8);
    expect(flat.opacity).toBe(0.5);
    expect(flat.borderWidth).toBe(1);
  });

  it('keeps skeleton bars stable across renders', () => {
    const { toJSON, rerender } = render(<WaveformSkeleton barsCount={6} />);
    const first = JSON.stringify(toJSON());
    rerender(<WaveformSkeleton barsCount={6} />);
    expect(JSON.stringify(toJSON())).toBe(first);
  });
});
