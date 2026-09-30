import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Video } from '../Video';
import { VideoControls } from '../VideoControls';
import type { VideoState } from '../types';
import { __resetLayerStackForTests } from '@plocks/ui/test-utils';

const STATE: VideoState = {
  currentTime: 30,
  duration: 100,
  playing: false,
  loading: false,
  muted: false,
  volume: 1,
  playbackRate: 1,
  fullscreen: false,
  quality: 'auto',
  error: null,
  buffering: false,
};

const CONFIG = { play: true, pause: true, progress: true, time: true, volume: true, fullscreen: true, playbackRate: true };

function renderControls(overrides: Partial<React.ComponentProps<typeof VideoControls>> = {}) {
  const handlers = {
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onSeek: jest.fn(),
    onVolumeChange: jest.fn(),
    onToggleMute: jest.fn(),
    onPlaybackRateChange: jest.fn(),
    onToggleFullscreen: jest.fn(),
  };
  render(<VideoControls config={CONFIG} state={STATE} {...handlers} {...overrides} />);
  return handlers;
}

beforeEach(() => __resetLayerStackForTests());

describe('Video (react-native-web DOM)', () => {
  it('renders a named <video> inside a labelled group with labelled controls', () => {
    render(<Video source={{ url: 'https://example.com/clip.mp4' }} accessibilityLabel="Product tour" />);
    expect(screen.getByRole('group', { name: 'Product tour' })).toBeTruthy();
    expect(document.querySelector('video')?.getAttribute('aria-label')).toBe('Product tour');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enter fullscreen' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Volume' }).getAttribute('aria-valuetext')).toBe('100%');
  });

  it('mutes and unmutes the <video> element', () => {
    render(<Video source={{ url: 'https://example.com/clip.mp4' }} />);
    const video = document.querySelector('video') as HTMLVideoElement;
    fireEvent.click(screen.getByRole('button', { name: 'Mute' }));
    expect(video.muted).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Unmute' }));
    expect(video.muted).toBe(false);
  });
});

describe('VideoControls (react-native-web DOM)', () => {
  it('exposes a keyboard-operable seek slider with a spoken time', () => {
    const { onSeek } = renderControls();
    const slider = screen.getByRole('slider', { name: 'Seek' });
    expect(slider.getAttribute('aria-valuenow')).toBe('30');
    expect(slider.getAttribute('aria-valuetext')).toBe('0:30 of 1:40');
    expect(slider.getAttribute('tabindex')).toBe('0');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onSeek).toHaveBeenLastCalledWith(35);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onSeek).toHaveBeenLastCalledWith(0);
  });

  it('opens the speed menu as a menu of checked radio items; Escape closes it', () => {
    const { onPlaybackRateChange } = renderControls();
    const trigger = screen.getByRole('button', { name: 'Playback speed 1x' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menu', { name: 'Playback speed' })).toBeTruthy();
    expect(screen.getByRole('menuitemradio', { name: '1x' }).getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('menuitemradio', { name: '2x' }).getAttribute('aria-checked')).toBe('false');

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    expect(screen.queryByRole('menu')).toBeNull();

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitemradio', { name: '1.5x' }));
    expect(onPlaybackRateChange).toHaveBeenCalledWith(1.5);
  });

  it('labels play / pause, mute and fullscreen by state', () => {
    renderControls({ state: { ...STATE, playing: true, muted: true, fullscreen: true } });
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Exit fullscreen' })).toBeTruthy();
  });
});
