import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef } from 'react';
import {
  useOptionalHapticsSettings,
  useReducedMotion,
  resolveOptionalModule,
  devWarn,
  devError,
  warnOnce,
} from '@plocks/ui';
import type { SoundContextType, SoundAsset, SoundOptions, SoundSource, SoundState, HapticFeedbackOptions } from './types';

/**
 * An expo-audio `AudioPlayer`. Typed structurally (only what this provider
 * touches) because expo-audio is an optional dependency.
 */
interface AudioPlayerLike {
  play: () => void;
  pause: () => void;
  remove: () => void;
  seekTo: (seconds: number) => Promise<void> | void;
  volume: number;
  loop: boolean;
  playbackRate: number;
  muted?: boolean;
  duration?: number;
}

/** The part of expo-audio this provider calls. */
interface ExpoAudioModule {
  setAudioModeAsync?: (mode: {
    allowsRecording?: boolean;
    playsInSilentMode?: boolean;
    shouldPlayInBackground?: boolean;
    interruptionModeAndroid?: string;
    shouldRouteThroughEarpiece?: boolean;
  }) => Promise<void>;
  createAudioPlayer?: (source: SoundSource) => AudioPlayerLike;
}

/** The part of expo-haptics `useHaptics` calls. */
interface ExpoHapticsModule {
  impactAsync: (style: string) => Promise<void>;
  notificationAsync: (type: string) => Promise<void>;
  selectionAsync: () => Promise<void>;
  ImpactFeedbackStyle: { Light: string; Medium: string; Heavy: string };
  NotificationFeedbackType: { Success: string; Warning: string; Error: string };
}

// Each optional require sits in its own try/catch so Metro treats it as optional.
const Audio = resolveOptionalModule<ExpoAudioModule>('expo-audio', {
  loader: () => { try { return require('expo-audio'); } catch { return null; } },
  devWarning: 'expo-audio not found, using mock sound implementation',
});

const Haptics = resolveOptionalModule<ExpoHapticsModule>('expo-haptics', {
  devWarning: 'expo-haptics not found, using mock haptic implementation',
});

interface SoundProviderState {
  enabled: boolean;
  volume: number;
  respectsReducedMotion: boolean;
  sounds: Map<string, SoundAsset>;
  soundStates: Map<string, SoundState>;
}

type SoundAction =
  | { type: 'SET_ENABLED'; payload: boolean }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_RESPECTS_REDUCED_MOTION'; payload: boolean }
  | { type: 'REGISTER_SOUND'; payload: SoundAsset }
  | { type: 'UNREGISTER_SOUND'; payload: string }
  | { type: 'UPDATE_SOUND_STATE'; payload: { soundId: string; state: Partial<SoundState> } };

const initialState: SoundProviderState = {
  enabled: true,
  volume: 1.0,
  respectsReducedMotion: true,
  sounds: new Map(),
  soundStates: new Map(),
};

const soundReducer = (state: SoundProviderState, action: SoundAction): SoundProviderState => {
  switch (action.type) {
    case 'SET_ENABLED':
      return { ...state, enabled: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.payload)) };
    case 'SET_RESPECTS_REDUCED_MOTION':
      return { ...state, respectsReducedMotion: action.payload };
    case 'REGISTER_SOUND':
      return {
        ...state,
        sounds: new Map(state.sounds).set(action.payload.id, action.payload),
      };
    case 'UNREGISTER_SOUND': {
      // The player itself is paused and removed by `unregisterSound` before this
      // dispatch (players live in a ref, not in reducer state).
      const newSounds = new Map(state.sounds);
      const newSoundStates = new Map(state.soundStates);
      newSounds.delete(action.payload);
      newSoundStates.delete(action.payload);
      return { ...state, sounds: newSounds, soundStates: newSoundStates };
    }
    case 'UPDATE_SOUND_STATE': {
      const updatedStates = new Map(state.soundStates);
      const currentState = updatedStates.get(action.payload.soundId);
      updatedStates.set(action.payload.soundId, {
        ...currentState,
        ...action.payload.state,
      } as SoundState);
      return { ...state, soundStates: updatedStates };
    }
    default:
      return state;
  }
};

const SoundContext = createContext<SoundContextType | null>(null);

interface SoundProviderProps {
  children: React.ReactNode;
  /** Initial sound assets to register */
  initialSounds?: SoundAsset[];
  /** Whether to enable audio mode on iOS */
  enableAudioMode?: boolean;
}

const NO_SOUNDS: SoundAsset[] = [];

const releasePlayer = (player: AudioPlayerLike, soundId: string) => {
  try {
    player.pause();
    player.remove();
  } catch (error) {
    devWarn(`Failed to clean up sound "${soundId}":`, error);
  }
};

export const SoundProvider: React.FC<SoundProviderProps> = ({
  children,
  initialSounds = NO_SOUNDS,
  enableAudioMode = true,
}) => {
  const [state, dispatch] = useReducer(soundReducer, initialState);
  const prefersReducedMotion = useReducedMotion();
  const initializationRef = useRef(false);
  // Players are imperative handles, not render state: kept in a ref so callbacks
  // always see the latest set and loading one doesn't re-render the tree.
  const playersRef = useRef(new Map<string, AudioPlayerLike>());
  // Latest state/preferences for the stable callbacks below.
  const stateRef = useRef(state);
  stateRef.current = state;
  const reducedMotionRef = useRef(prefersReducedMotion);
  reducedMotionRef.current = prefersReducedMotion;

  // Initialize audio mode
  React.useEffect(() => {
    if (!initializationRef.current && enableAudioMode && Audio?.setAudioModeAsync) {
      Audio.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionModeAndroid: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      }).catch(devWarn);
      initializationRef.current = true;
    }
  }, [enableAudioMode]);

  // Register initial sounds
  React.useEffect(() => {
    initialSounds.forEach(sound => {
      dispatch({ type: 'REGISTER_SOUND', payload: sound });
    });
  }, [initialSounds]);

  // Release every player once, on unmount (not whenever the player set changes).
  React.useEffect(() => {
    const players = playersRef.current;
    return () => {
      players.forEach((player, soundId) => releasePlayer(player, soundId));
      players.clear();
    };
  }, []);

  const loadSound = useCallback(async (soundId: string): Promise<AudioPlayerLike | null> => {
    try {
      const soundAsset = stateRef.current.sounds.get(soundId);
      if (!soundAsset || !soundAsset.source) {
        devWarn(`Sound with ID "${soundId}" not found or has no source`);
        return null;
      }

      // expo-audio isn't installed: sounds are a silent no-op (resolveOptionalModule
      // already warned once, in development, when the module failed to load).
      if (!Audio?.createAudioPlayer) {
        return null;
      }

      let audioPlayer = playersRef.current.get(soundId);

      if (!audioPlayer) {
        audioPlayer = Audio.createAudioPlayer(soundAsset.source);
        playersRef.current.set(soundId, audioPlayer);

        // Note: expo-audio uses different status tracking
        // We'll track basic state manually since status events work differently
        dispatch({
          type: 'UPDATE_SOUND_STATE',
          payload: {
            soundId,
            state: {
              playing: false,
              isLoaded: true, // Assume loaded after creation
              currentTime: 0,
              duration: audioPlayer.duration || 0,
              volume: audioPlayer.volume || 1,
              muted: audioPlayer.muted || false,
              loop: audioPlayer.loop || false,
              playbackRate: audioPlayer.playbackRate || 1,
            },
          },
        });
      }

      return audioPlayer;
    } catch (error) {
      devError(`Failed to load sound "${soundId}":`, error);
      return null;
    }
  }, []);

  const playSound = useCallback(async (soundId: string, options: SoundOptions = {}) => {
    const current = stateRef.current;
    // Check if sounds are globally disabled
    if (!current.enabled) return;

    const soundAsset = current.sounds.get(soundId);
    if (!soundAsset) {
      devWarn(`Sound with ID "${soundId}" not found`);
      return;
    }

    // Check reduced motion preferences
    if (current.respectsReducedMotion &&
        soundAsset.respectsReducedMotion &&
        reducedMotionRef.current) {
      return;
    }

    try {
      const audioPlayer = await loadSound(soundId);
      if (!audioPlayer) {
        // No player (expo-audio missing, or the sound failed to load): no-op.
        return;
      }

      // Merge options with defaults
      const finalOptions = { ...soundAsset.defaultOptions, ...options };
      const volume = (finalOptions.volume ?? 1) * stateRef.current.volume;

      // Apply options to the player
      audioPlayer.volume = volume;
      audioPlayer.loop = finalOptions.loop ?? false;

      if (finalOptions.rate) {
        audioPlayer.playbackRate = finalOptions.rate;
      }

      // Seek to position if specified
      if (finalOptions.seekTo !== undefined) {
        await audioPlayer.seekTo(finalOptions.seekTo);
      } else {
        // Reset to beginning for expo-audio (it doesn't auto-reset)
        await audioPlayer.seekTo(0);
      }

      // Apply delay if specified
      if (finalOptions.delay) {
        setTimeout(() => {
          audioPlayer.play();
        }, finalOptions.delay);
      } else {
        audioPlayer.play();
      }

      // Update state to reflect playing
      dispatch({
        type: 'UPDATE_SOUND_STATE',
        payload: {
          soundId,
          state: {
            playing: true,
            volume: audioPlayer.volume,
            loop: audioPlayer.loop,
            playbackRate: audioPlayer.playbackRate,
          },
        },
      });

    } catch (error) {
      devError(`Failed to play sound "${soundId}":`, error);
    }
  }, [loadSound]);

  const stopSound = useCallback(async (soundId: string) => {
    try {
      const audioPlayer = playersRef.current.get(soundId);
      if (audioPlayer) {
        audioPlayer.pause();
        dispatch({
          type: 'UPDATE_SOUND_STATE',
          payload: {
            soundId,
            state: { playing: false },
          },
        });
      }
    } catch (error) {
      devError(`Failed to stop sound "${soundId}":`, error);
    }
  }, []);

  const stopAllSounds = useCallback(async () => {
    try {
      playersRef.current.forEach(player => {
        try {
          player.pause();
        } catch (error) {
          devWarn('Failed to stop audio player:', error);
        }
      });

      // Update all states to not playing
      Array.from(stateRef.current.sounds.keys()).forEach(soundId => {
        dispatch({
          type: 'UPDATE_SOUND_STATE',
          payload: {
            soundId,
            state: { playing: false },
          },
        });
      });
    } catch (error) {
      devError('Failed to stop all sounds:', error);
    }
  }, []);

  const preloadSounds = useCallback(async (soundIds: string[]) => {
    try {
      await Promise.all(soundIds.map(soundId => loadSound(soundId)));
    } catch (error) {
      devError('Failed to preload sounds:', error);
    }
  }, [loadSound]);

  const registerSound = useCallback((sound: SoundAsset) => {
    dispatch({ type: 'REGISTER_SOUND', payload: sound });
  }, []);

  const unregisterSound = useCallback(async (soundId: string) => {
    const audioPlayer = playersRef.current.get(soundId);
    if (audioPlayer) {
      releasePlayer(audioPlayer, soundId);
      playersRef.current.delete(soundId);
    }
    dispatch({ type: 'UNREGISTER_SOUND', payload: soundId });
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_ENABLED', payload: enabled });

    // Stop all sounds if disabling
    if (!enabled) {
      stopAllSounds();
    }
  }, [stopAllSounds]);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const setRespectsReducedMotion = useCallback((respects: boolean) => {
    dispatch({ type: 'SET_RESPECTS_REDUCED_MOTION', payload: respects });
  }, []);

  /** Snapshot getter: reads the latest state; it doesn't subscribe the caller to changes. */
  const getSoundState = useCallback((soundId: string): SoundState | null => {
    return stateRef.current.soundStates.get(soundId) || null;
  }, []);

  // Only the settings are reactive; every function above is stable, so playing a
  // sound (which updates per-sound state) doesn't re-render `useSound()` consumers.
  const contextValue = useMemo<SoundContextType>(() => ({
    enabled: state.enabled,
    volume: state.volume,
    respectsReducedMotion: state.respectsReducedMotion,
    playSound,
    stopSound,
    stopAllSounds,
    preloadSounds,
    registerSound,
    unregisterSound,
    setEnabled,
    setVolume,
    setRespectsReducedMotion,
    getSoundState,
  }), [
    state.enabled,
    state.volume,
    state.respectsReducedMotion,
    playSound,
    stopSound,
    stopAllSounds,
    preloadSounds,
    registerSound,
    unregisterSound,
    setEnabled,
    setVolume,
    setRespectsReducedMotion,
    getSoundState,
  ]);

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};

const noopAsync = async (): Promise<void> => {};

/**
 * What `useSound()` returns outside a `SoundProvider`: sounds disabled, every
 * method a no-op. `PlocksProvider` doesn't mount a SoundProvider, so
 * components and hooks must work without one.
 */
const NOOP_SOUND_CONTEXT: SoundContextType = Object.freeze({
  enabled: false,
  volume: 1,
  respectsReducedMotion: true,
  playSound: noopAsync,
  stopSound: noopAsync,
  stopAllSounds: noopAsync,
  preloadSounds: noopAsync,
  registerSound: () => {},
  unregisterSound: noopAsync,
  setEnabled: () => {},
  setVolume: () => {},
  setRespectsReducedMotion: () => {},
  getSoundState: () => null,
});

/**
 * The sound context, or `null` when no `SoundProvider` is mounted — for
 * components that play sounds only when the app opted in.
 */
export const useSoundOptional = (): SoundContextType | null => useContext(SoundContext);

/**
 * Hook to access the sound context. Outside a `SoundProvider` it returns a
 * silent no-op implementation (and warns once in development) instead of
 * throwing; use `useSoundOptional()` to detect the provider.
 */
export const useSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    warnOnce(
      'useSound:no-provider',
      '[plocks] useSound() was called outside a <SoundProvider>; sounds are disabled. ' +
        'Mount a <SoundProvider> to play sounds, or use useSoundOptional() to check for one.'
    );
    return NOOP_SOUND_CONTEXT;
  }
  return context;
};

/**
 * Hook for haptic feedback
 */
export const useHaptics = () => {
  const prefersReducedMotion = useReducedMotion();
  const hapticsSettings = useOptionalHapticsSettings();
  const hapticsEnabled = hapticsSettings?.enabled ?? true;

  const triggerHaptic = useCallback(async (options: HapticFeedbackOptions = {}) => {
    const { type = 'light', respectsReducedMotion = true } = options;

    // The app-level HapticsProvider switch (also used by `temporarilyDisable`).
    if (!hapticsEnabled) {
      return;
    }

    // Check reduced motion preferences
    if (respectsReducedMotion && prefersReducedMotion) {
      return;
    }

    // expo-haptics isn't installed: haptics are a silent no-op (resolveOptionalModule
    // already warned once, in development, when the module failed to load).
    if (!Haptics) {
      return;
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
      }
    } catch (error) {
      devWarn('Haptic feedback failed:', error);
    }
  }, [prefersReducedMotion, hapticsEnabled]);

  return { triggerHaptic };
};