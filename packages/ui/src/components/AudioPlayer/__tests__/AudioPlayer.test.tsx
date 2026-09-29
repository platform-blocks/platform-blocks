import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import type { AudioPlayerRef } from '../types';

// A stand-in for expo-audio's AudioPlayer: records calls and lets the test push
// `playbackStatusUpdate` events.
type Status = Record<string, unknown>;
const mockPlayers: MockPlayer[] = [];
class MockPlayer {
  volume = 1;
  loop = false;
  muted = false;
  duration = 0;
  currentTime = 0;
  listener: ((status: Status) => void) | null = null;
  play = jest.fn();
  pause = jest.fn();
  seekTo = jest.fn(async (seconds: number) => {
    this.currentTime = seconds;
  });
  setPlaybackRate = jest.fn();
  remove = jest.fn();
  addListener = jest.fn((_event: string, listener: (status: Status) => void) => {
    this.listener = listener;
    return { remove: jest.fn() };
  });
  emit(status: Status) {
    this.duration = (status.duration as number) ?? this.duration;
    this.currentTime = (status.currentTime as number) ?? this.currentTime;
    this.listener?.(status);
  }
}

jest.mock(
  'expo-audio',
  () => ({
    createAudioPlayer: jest.fn(() => {
      const player = new MockPlayer();
      mockPlayers.push(player);
      return player;
    }),
  }),
  { virtual: true }
);

import { AudioPlayer } from '../AudioPlayer';

const PEAKS = Array.from({ length: 40 }, (_, i) => ((i % 7) + 1) / 8);

/** How many entries of a (nested) style array set `key`. */
const timesSet = (style: unknown, key: string): number =>
  Array.isArray(style)
    ? style.reduce((n: number, entry) => n + timesSet(entry, key), 0)
    : style != null && typeof style === 'object' && (style as Record<string, unknown>)[key] !== undefined
      ? 1
      : 0;

async function renderPlayer(props: Partial<React.ComponentProps<typeof AudioPlayer>> = {}) {
  const ref = React.createRef<AudioPlayerRef>();
  const utils = render(<AudioPlayer ref={ref} source="https://example.com/a.mp3" peaks={PEAKS} {...props} />);
  await act(async () => {});
  const player = mockPlayers[mockPlayers.length - 1];
  return { ...utils, ref, player };
}

function loaded(player: MockPlayer, extra: Status = {}) {
  act(() => {
    player.emit({ isLoaded: true, duration: 100, currentTime: 10, playing: false, ...extra });
  });
}

describe('AudioPlayer', () => {
  beforeEach(() => {
    mockPlayers.length = 0;
  });

  it('sizes the waveform from w / h, not the player root', async () => {
    await renderPlayer({ testID: 'player', w: 400, h: 80, maw: 500 });
    const rootStyle = screen.getByTestId('player').props.style;
    expect(StyleSheet.flatten(rootStyle)).toMatchObject({ width: '100%', maxWidth: 500 });
    expect(timesSet(rootStyle, 'width')).toBe(1);
    expect(timesSet(rootStyle, 'height')).toBe(0);
    expect(StyleSheet.flatten(screen.getByTestId('player-waveform').props.style).width).toBe(400);
  });

  it('labels the transport controls and toggles play / pause', async () => {
    const { player } = await renderPlayer();
    loaded(player);

    fireEvent.press(screen.getByRole('button', { name: 'Play' }));
    await act(async () => {});
    expect(player.play).toHaveBeenCalled();

    act(() => player.emit({ isLoaded: true, duration: 100, currentTime: 12, playing: true }));
    fireEvent.press(screen.getByRole('button', { name: 'Pause' }));
    await act(async () => {});
    expect(player.pause).toHaveBeenCalled();
  });

  it('reads the time as "elapsed of total"', async () => {
    const { player } = await renderPlayer();
    loaded(player);
    expect(screen.getByLabelText('0:10 of 1:40')).toBeTruthy();
  });

  it('supports the relative time format', async () => {
    const { player } = await renderPlayer({ timeFormat: 'relative' });
    loaded(player);
    expect(screen.getByText('-1:30')).toBeTruthy();
  });

  it('skips by 10 seconds and mutes', async () => {
    const { player } = await renderPlayer();
    loaded(player);

    fireEvent.press(screen.getByRole('button', { name: 'Skip forward 10 seconds' }));
    expect(player.seekTo).toHaveBeenLastCalledWith(20);
    fireEvent.press(screen.getByRole('button', { name: 'Skip back 10 seconds' }));
    expect(player.seekTo).toHaveBeenLastCalledWith(0);

    fireEvent.press(screen.getByRole('button', { name: 'Mute' }));
    expect(player.muted).toBe(true);
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeTruthy();
  });

  it('exposes the waveform as a seek slider with a spoken time value', async () => {
    const { player } = await renderPlayer();
    loaded(player);

    const slider = screen.getByRole('slider', { name: 'Seek' });
    expect(slider.props['aria-valuenow']).toBe(10);
    expect(slider.props['aria-valuetext']).toBe('0:10 of 1:40');

    // Screen-reader increment moves 5 seconds.
    fireEvent(slider, 'accessibilityAction', { nativeEvent: { actionName: 'increment' } });
    await act(async () => {});
    expect(player.seekTo).toHaveBeenLastCalledWith(15);
  });

  it('implements setSelection / clearSelection on the ref', async () => {
    const { ref, player } = await renderPlayer();
    loaded(player);

    act(() => ref.current?.setSelection(50_000, 20_000));
    expect(ref.current?.getSelection()).toEqual({ start: 20_000, end: 50_000 });

    act(() => ref.current?.clearSelection());
    expect(ref.current?.getSelection()).toBeNull();
  });

  it('merges partial controls over the defaults', async () => {
    const { player } = await renderPlayer({ controls: { speed: true } });
    loaded(player);
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Playback speed 1x' }));
    expect(player.setPlaybackRate).toHaveBeenLastCalledWith(1.25);
  });

  it('reports load, progress and end through the latest callbacks', async () => {
    const onLoad = jest.fn();
    const onProgress = jest.fn();
    const onEnd = jest.fn();
    const { player } = await renderPlayer({ onLoad, onProgress, onEnd });
    loaded(player);
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({ duration: 100_000 }));
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ currentTime: 10_000, progress: 0.1 }));

    act(() => player.emit({ isLoaded: true, duration: 100, currentTime: 100, didJustFinish: true }));
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('renders the metadata title as a heading and names the player group', async () => {
    const { player } = await renderPlayer({ showMetadata: true, metadata: { title: 'Arpeggio', artist: 'Demo' } });
    loaded(player);
    expect(screen.getByRole('heading', { name: 'Arpeggio' })).toBeTruthy();
    expect(screen.getByLabelText('Audio player: Arpeggio')).toBeTruthy();
  });
});
