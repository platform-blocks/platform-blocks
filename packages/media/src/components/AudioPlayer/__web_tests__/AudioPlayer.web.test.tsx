import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

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

async function renderLoaded(props: Partial<React.ComponentProps<typeof AudioPlayer>> = {}) {
  render(<AudioPlayer source="https://example.com/a.mp3" peaks={PEAKS} {...props} />);
  await act(async () => {});
  const player = mockPlayers[mockPlayers.length - 1];
  act(() => {
    player.listener?.({ isLoaded: true, duration: 100, currentTime: 10, playing: false });
  });
  return player;
}

describe('AudioPlayer (react-native-web DOM)', () => {
  beforeEach(() => {
    mockPlayers.length = 0;
  });

  it('is a named group with labelled transport buttons', async () => {
    await renderLoaded({ metadata: { title: 'Arpeggio' } });
    expect(screen.getByRole('group', { name: 'Audio player: Arpeggio' })).toBeTruthy();
    for (const name of ['Play', 'Skip back 10 seconds', 'Skip forward 10 seconds', 'Mute']) {
      expect(screen.getByRole('button', { name })).toBeTruthy();
    }
  });

  it('seeks from the keyboard on the waveform slider', async () => {
    const player = await renderLoaded();
    const slider = screen.getByRole('slider', { name: 'Seek' });
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
    expect(slider.getAttribute('aria-valuetext')).toBe('0:10 of 1:40');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    await act(async () => {});
    expect(player.seekTo).toHaveBeenLastCalledWith(15);
  });

  it('handles Space / L / M shortcuts on the focused slider', async () => {
    const player = await renderLoaded();
    const slider = screen.getByRole('slider', { name: 'Seek' });

    fireEvent.keyDown(slider, { key: ' ' });
    await act(async () => {});
    expect(player.play).toHaveBeenCalled();

    fireEvent.keyDown(slider, { key: 'l' });
    expect(player.seekTo).toHaveBeenLastCalledWith(20);

    fireEvent.keyDown(slider, { key: 'M' });
    expect(player.muted).toBe(true);
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeTruthy();
  });

  it('can turn the shortcuts off', async () => {
    const player = await renderLoaded({ enableKeyboardShortcuts: false });
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Seek' }), { key: 'l' });
    expect(player.seekTo).not.toHaveBeenCalled();
  });
});
