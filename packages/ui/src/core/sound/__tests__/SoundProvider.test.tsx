import React from 'react';
import { act, render, renderHook } from '@testing-library/react-native';

type FakePlayer = {
  play: jest.Mock;
  pause: jest.Mock;
  remove: jest.Mock;
  seekTo: jest.Mock;
  volume: number;
  loop: boolean;
  playbackRate: number;
};

// expo-audio / expo-haptics are optional; hand the provider fakes. Built inside
// the factory because the provider resolves them while it is being imported.
jest.mock('../../../utils/optionalModule', () => {
  const players: unknown[] = [];
  const audio = {
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    createAudioPlayer: jest.fn(() => {
      const player = {
        play: jest.fn(),
        pause: jest.fn(),
        remove: jest.fn(),
        seekTo: jest.fn(() => Promise.resolve()),
        volume: 1,
        loop: false,
        playbackRate: 1,
      };
      players.push(player);
      return player;
    }),
  };
  const haptics = {
    impactAsync: jest.fn(() => Promise.resolve()),
    notificationAsync: jest.fn(() => Promise.resolve()),
    selectionAsync: jest.fn(() => Promise.resolve()),
    ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
    NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  };
  return {
    resolveOptionalModule: (name: string) => (name === 'expo-audio' ? audio : name === 'expo-haptics' ? haptics : null),
    __fakes: { players, audio, haptics },
  };
});

const { __fakes } = jest.requireMock('../../../utils/optionalModule') as {
  __fakes: { players: FakePlayer[]; haptics: { impactAsync: jest.Mock } };
};
const players = __fakes.players;
const fakeHaptics = __fakes.haptics;

import { HapticsProvider, useHapticsSettings } from '../../haptics/HapticsProvider';
import { resetWarnOnce } from '../../utils/logger';
import { SoundProvider, useHaptics, useSound, useSoundOptional } from '../context';

const sounds = [
  { id: 'a', source: 1 },
  { id: 'b', source: 2 },
];

beforeEach(() => {
  players.length = 0;
  jest.clearAllMocks();
});

describe('SoundProvider', () => {
  it('keeps loaded players alive when more sounds load, and releases them all on unmount', async () => {
    let api: ReturnType<typeof useSound> | null = null;
    const Grab = () => {
      api = useSound();
      return null;
    };
    const { unmount } = render(
      <SoundProvider initialSounds={sounds}>
        <Grab />
      </SoundProvider>
    );

    await act(async () => {
      await api!.playSound('a');
    });
    await act(async () => {
      await api!.playSound('b');
    });
    expect(players).toHaveLength(2);
    // Loading "b" must not tear down "a" (the old cleanup ran on every player change).
    expect(players[0].remove).not.toHaveBeenCalled();
    expect(players[0].play).toHaveBeenCalled();

    unmount();
    expect(players[0].remove).toHaveBeenCalledTimes(1);
    expect(players[1].remove).toHaveBeenCalledTimes(1);
  });

  it('removes the player when a sound is unregistered', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SoundProvider initialSounds={sounds}>{children}</SoundProvider>
    );
    const { result } = renderHook(() => useSound(), { wrapper });
    await act(async () => {
      await result.current.playSound('a');
    });
    await act(async () => {
      await result.current.unregisterSound('a');
    });
    expect(players[0].pause).toHaveBeenCalled();
    expect(players[0].remove).toHaveBeenCalledTimes(1);
  });

  it('keeps the context value stable while sounds play', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SoundProvider initialSounds={sounds}>{children}</SoundProvider>
    );
    const { result } = renderHook(() => useSound(), { wrapper });
    const first = result.current;
    await act(async () => {
      await result.current.playSound('a');
    });
    expect(result.current).toBe(first);
    expect(result.current.getSoundState('a')?.playing).toBe(true);

    act(() => result.current.setVolume(0.5));
    expect(result.current.volume).toBe(0.5);
    expect(result.current.playSound).toBe(first.playSound);
  });

  it('works without an AccessibilityProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <SoundProvider>{children}</SoundProvider>;
    expect(() => renderHook(() => useSound(), { wrapper })).not.toThrow();
  });
});

describe('without a SoundProvider', () => {
  beforeEach(() => resetWarnOnce());

  it('useSoundOptional returns null (and the provider value inside one)', () => {
    expect(renderHook(() => useSoundOptional()).result.current).toBeNull();
    const wrapper = ({ children }: { children: React.ReactNode }) => <SoundProvider>{children}</SoundProvider>;
    expect(renderHook(() => useSoundOptional(), { wrapper }).result.current).not.toBeNull();
  });

  it('useSound returns a silent no-op implementation and warns once', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { result, rerender } = renderHook(() => useSound());
    rerender({});
    const api = result.current;
    expect(api.enabled).toBe(false);
    await expect(api.playSound('a')).resolves.toBeUndefined();
    await expect(api.stopAllSounds()).resolves.toBeUndefined();
    expect(() => api.setVolume(0.2)).not.toThrow();
    expect(api.getSoundState('a')).toBeNull();
    expect(players).toHaveLength(0);
    const noProvider = warn.mock.calls.filter(([message]) => String(message).includes('SoundProvider'));
    expect(noProvider).toHaveLength(1);
    warn.mockRestore();
  });
});

describe('useHaptics (sound)', () => {
  it('respects the HapticsProvider switch', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <HapticsProvider>{children}</HapticsProvider>;
    const { result } = renderHook(() => ({ haptics: useHaptics(), settings: useHapticsSettings() }), { wrapper });

    await act(async () => {
      await result.current.haptics.triggerHaptic({ type: 'light' });
    });
    expect(fakeHaptics.impactAsync).toHaveBeenCalledTimes(1);

    act(() => result.current.settings.setEnabled(false));
    await act(async () => {
      await result.current.haptics.triggerHaptic({ type: 'light' });
    });
    expect(fakeHaptics.impactAsync).toHaveBeenCalledTimes(1);
  });
});
