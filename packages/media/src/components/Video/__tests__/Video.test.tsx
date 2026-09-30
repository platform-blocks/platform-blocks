import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { Video } from '../Video';
import { VideoControls } from '../VideoControls';
import { VideoTimeline } from '../VideoTimeline';
import type { VideoRef, VideoState } from '../types';

const SOURCE = { url: 'https://example.com/clip.mp4' };

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

const FULL_CONFIG = {
  play: true,
  pause: true,
  progress: true,
  time: true,
  volume: true,
  fullscreen: true,
  playbackRate: true,
};

/** How many entries of a (nested) style array set `key`. */
const timesSet = (style: unknown, key: string): number =>
  Array.isArray(style)
    ? style.reduce((n: number, entry) => n + timesSet(entry, key), 0)
    : style != null && typeof style === 'object' && (style as Record<string, unknown>)[key] !== undefined
      ? 1
      : 0;

/** Pressable turns aria-* state into accessibilityState on the host view. */
function a11yState(node: { props: Record<string, unknown> }, key: 'expanded' | 'checked'): unknown {
  const state = node.props.accessibilityState as Record<string, unknown> | undefined;
  return state?.[key] ?? node.props[`aria-${key}`];
}

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
  const utils = render(<VideoControls config={FULL_CONFIG} state={STATE} {...handlers} {...overrides} />);
  return { ...utils, ...handlers };
}

describe('Video', () => {
  it('names the player and honours w / h', () => {
    render(<Video source={SOURCE} w={320} h={180} testID="video" accessibilityLabel="Product tour" />);
    const root = screen.getByTestId('video');
    expect(root.props.role).toBe('group');
    expect(root.props['aria-label']).toBe('Product tour');
    const flat = StyleSheet.flatten(root.props.style);
    expect(flat.width).toBe(320);
    expect(flat.height).toBe(180);
  });

  it('applies w / h to the root once ("full" is 100%)', () => {
    render(<Video source={SOURCE} w="full" h={180} opacity={0.5} testID="video" />);
    const style = screen.getByTestId('video').props.style;
    expect(StyleSheet.flatten(style)).toMatchObject({ width: '100%', height: 180, opacity: 0.5 });
    expect(timesSet(style, 'width')).toBe(1);
    expect(timesSet(style, 'height')).toBe(1);
  });

  it('derives the missing dimension from aspectRatio', () => {
    render(<Video source={SOURCE} w={320} testID="video" />);
    const flat = StyleSheet.flatten(screen.getByTestId('video').props.style);
    expect(flat.height).toBe(180);
  });

  it('renders labelled controls and toggles mute through the ref', () => {
    const ref = React.createRef<VideoRef>();
    render(<Video ref={ref} source={SOURCE} />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Enter fullscreen' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Seek' })).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'Mute' }));
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeTruthy();
    expect(ref.current?.getState().muted).toBe(true);

    act(() => ref.current?.setMuted(false));
    expect(screen.getByRole('button', { name: 'Mute' })).toBeTruthy();
  });

  it('applies spacing props to the root', () => {
    render(<Video source={SOURCE} testID="video" mt={12} />);
    expect(StyleSheet.flatten(screen.getByTestId('video').props.style).marginTop).toBe(12);
  });
});

describe('VideoControls', () => {
  it('exposes the seek bar as a slider with a spoken time value', () => {
    const { onSeek } = renderControls();
    const slider = screen.getByRole('slider', { name: 'Seek' });
    expect(slider.props['aria-valuenow']).toBe(30);
    expect(slider.props['aria-valuetext']).toBe('0:30 of 1:40');

    // Screen-reader increment jumps 5 seconds.
    fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    expect(onSeek).toHaveBeenLastCalledWith(35);
  });

  it('reads the time as "current of total"', () => {
    renderControls();
    expect(screen.getByLabelText('0:30 of 1:40')).toBeTruthy();
  });

  it('switches Play / Pause labels with the playing state', () => {
    const { onPause } = renderControls({ state: { ...STATE, playing: true } });
    fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    expect(onPause).toHaveBeenCalled();
  });

  it('opens the speed menu with checked options', () => {
    const { onPlaybackRateChange } = renderControls();
    const trigger = screen.getByRole('button', { name: 'Playback speed 1x' });
    expect(a11yState(trigger, 'expanded')).toBe(false);

    fireEvent.press(trigger);
    expect(a11yState(screen.getByRole('button', { name: 'Playback speed 1x' }), 'expanded')).toBe(true);
    // The menu container groups the items (it isn't one accessibility element itself).
    expect(screen.getByLabelText('Playback speed').props.role).toBe('menu');
    // Native maps menuitemradio → menuitem.
    const current = screen.getByRole('menuitem', { name: '1x' });
    expect(a11yState(current, 'checked')).toBe(true);

    fireEvent.press(screen.getByRole('menuitem', { name: '1.5x' }));
    expect(onPlaybackRateChange).toHaveBeenCalledWith(1.5);
    expect(screen.queryByLabelText('Playback speed')).toBeNull();
  });

  it('calls onToggleMute and labels by state', () => {
    const { onToggleMute } = renderControls({ state: { ...STATE, muted: true } });
    fireEvent.press(screen.getByRole('button', { name: 'Unmute' }));
    expect(onToggleMute).toHaveBeenCalled();
  });

  it('marks loading as a busy progressbar', () => {
    renderControls({ state: { ...STATE, loading: true } });
    const indicator = screen.getByRole('progressbar', { name: 'Loading video' });
    expect(indicator.props['aria-busy']).toBe(true);
  });
});

describe('VideoTimeline', () => {
  it('labels markers and seeks to them', () => {
    const onSeek = jest.fn();
    render(
      <VideoTimeline
        timeline={[{ id: 'intro', time: 65, type: 'chapter', data: { title: 'Intro' } }]}
        duration={100}
        currentTime={0}
        onSeek={onSeek}
      />
    );
    fireEvent.press(screen.getByRole('button', { name: 'Jump to chapter “Intro” at 1:05' }));
    expect(onSeek).toHaveBeenCalledWith(65);
  });
});
