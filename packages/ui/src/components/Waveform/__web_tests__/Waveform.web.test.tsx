import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Waveform } from '../Waveform';

const PEAKS = [0.1, 0.6, 0.3, 0.9, 0.4, 0.2, 0.75, 0.5, 0.35, 0.65];

describe('Waveform (react-native-web DOM)', () => {
  it('is a named image when not interactive', () => {
    render(<Waveform peaks={PEAKS} accessibilityLabel="Track preview" />);
    const img = screen.getByRole('img', { name: 'Track preview' });
    expect(img.getAttribute('aria-valuenow')).toBeNull();
    expect(img.getAttribute('tabindex')).not.toBe('0');
  });

  it('is a focusable seek slider with aria-valuenow when interactive', () => {
    const onSeek = jest.fn();
    render(<Waveform peaks={PEAKS} interactive onSeek={onSeek} progress={0.5} duration={100} />);
    const slider = screen.getByRole('slider', { name: 'Audio waveform' });
    expect(slider.getAttribute('aria-valuenow')).toBe('50');
    expect(slider.getAttribute('aria-valuemin')).toBe('0');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
    expect(slider.getAttribute('aria-valuetext')).toBe('0:50 of 1:40');
    expect(slider.getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenLastCalledWith(0.55);
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onSeek).toHaveBeenLastCalledWith(1);
  });

  it('dispatches the documented waveformSpacePress event on Space', () => {
    const listener = jest.fn();
    document.addEventListener('waveformSpacePress', listener);
    render(<Waveform peaks={PEAKS} interactive onSeek={jest.fn()} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: ' ' });
    expect(listener).toHaveBeenCalledTimes(1);
    document.removeEventListener('waveformSpacePress', listener);
  });

  it('lets a consumer onKeyDown handle keys first', () => {
    const onSeek = jest.fn();
    const onKeyDown = jest.fn((event: { key: string; preventDefault: () => void }) => {
      if (event.key === 'ArrowRight') event.preventDefault();
    });
    render(<Waveform peaks={PEAKS} interactive onSeek={onSeek} onKeyDown={onKeyDown} />);
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
    expect(onKeyDown).toHaveBeenCalled();
    expect(onSeek).not.toHaveBeenCalled();
  });
});
