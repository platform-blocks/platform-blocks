import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { SoundContextType, SoundAsset, SoundOptions, SoundState, HapticFeedbackOptions } from './types';
import { devLog } from '../utils/logger';

/**
 * Mock sound context for environments without expo-audio support
 * Provides the same API but logs actions instead of playing actual sounds
 */

const MockSoundContext = createContext<SoundContextType | null>(null);

interface MockSoundProviderProps {
  children: React.ReactNode;
  /** Initial sound assets to register */
  initialSounds?: SoundAsset[];
  /** Whether to log sound actions to console */
  enableLogging?: boolean;
}

export const MockSoundProvider: React.FC<MockSoundProviderProps> = ({
  children,
  initialSounds = [],
  enableLogging = true,
}) => {
  const log = useCallback((message: string, data?: unknown) => {
    if (enableLogging) {
      devLog(`[Sound Mock] ${message}`, data || '');
    }
  }, [enableLogging]);

  const contextValue = useMemo<SoundContextType>(() => ({
    enabled: true,
    volume: 1.0,
    respectsReducedMotion: true,
    playSound: async (soundId: string, options?: SoundOptions) => {
      log(`Playing sound: ${soundId}`, options);
    },
    stopSound: async (soundId: string) => {
      log(`Stopping sound: ${soundId}`);
    },
    stopAllSounds: async () => {
      log('Stopping all sounds');
    },
    preloadSounds: async (soundIds: string[]) => {
      log('Preloading sounds', soundIds);
    },
    registerSound: (sound: SoundAsset) => {
      log(`Registering sound: ${sound.id}`, sound);
    },
    unregisterSound: async (soundId: string) => {
      log(`Unregistering sound: ${soundId}`);
    },
    setEnabled: (enabled: boolean) => {
      log(`Setting sounds enabled: ${enabled}`);
    },
    setVolume: (volume: number) => {
      log(`Setting volume: ${volume}`);
    },
    setRespectsReducedMotion: (respects: boolean) => {
      log(`Setting respects reduced motion: ${respects}`);
    },
    getSoundState: (soundId: string): SoundState | null => {
      log(`Getting sound state: ${soundId}`);
      return null;
    },
  }), [log]);

  return (
    <MockSoundContext.Provider value={contextValue}>
      {children}
    </MockSoundContext.Provider>
  );
};

/**
 * Hook to access the mock sound context
 */
export const useMockSound = (): SoundContextType => {
  const context = useContext(MockSoundContext);
  if (!context) {
    throw new Error('useMockSound must be used within a MockSoundProvider');
  }
  return context;
};

/**
 * Mock haptic feedback hook
 */
export const useMockHaptics = () => {
  const prefersReducedMotion = useReducedMotion();

  const triggerHaptic = useCallback(async (options: HapticFeedbackOptions = {}) => {
    const { type = 'light', respectsReducedMotion = true } = options;

    // Check reduced motion preferences
    if (respectsReducedMotion && prefersReducedMotion) {
      devLog('[Haptic Mock] Skipped due to reduced motion preference');
      return;
    }

    devLog(`[Haptic Mock] Triggering haptic: ${type}`);
  }, [prefersReducedMotion]);

  return { triggerHaptic };
};