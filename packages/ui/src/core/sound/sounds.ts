import type { SoundAsset, SoundSource } from './types';

/**
 * Utility functions for working with sound collections
 * These are used by apps to organize their own sound configurations
 */

/**
 * Get all sounds from a sound collection as an array
 */
export const getAllSounds = (sounds: Record<string, SoundAsset>): SoundAsset[] => {
  return Object.values(sounds);
};

/**
 * Get sounds by category from a sound collection
 */
export const getSoundsByCategory = (
  sounds: Record<string, SoundAsset>, 
  category: SoundAsset['category']
): SoundAsset[] => {
  return Object.values(sounds).filter(sound => sound.category === category);
};

/**
 * Create a sound asset with sensible defaults
 */
export const createSound = (
  id: string,
  source: SoundSource,
  options: Partial<Omit<SoundAsset, 'id' | 'source'>>
): SoundAsset => {
  return {
    id,
    source,
    name: options.name || id,
    category: options.category || 'ui',
    respectsReducedMotion: options.respectsReducedMotion ?? true,
    defaultOptions: {
      volume: 0.5,
      ...options.defaultOptions,
    },
    ...options,
  };
};