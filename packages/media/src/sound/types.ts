export interface SoundOptions {
  /** Volume level (0.0 to 1.0) */
  volume?: number;
  /** Whether to loop the sound */
  loop?: boolean;
  /** Playback rate (0.5 to 2.0) */
  rate?: number;
  /** Delay before playing (in milliseconds) */
  delay?: number;
  /** Seek to specific position before playing (in seconds) */
  seekTo?: number;
}

/**
 * A sound's source, in the forms expo-audio accepts: a bundled asset
 * (`require('./tap.mp3')`), a URL, or a source object (`{ uri, headers }`).
 */
export type SoundSource =
  | number
  | string
  | { uri?: string; headers?: Record<string, string>; assetId?: number; name?: string };

export interface SoundAsset {
  /** Unique identifier for the sound */
  id: string;
  /** Path to the sound file */
  source: SoundSource;
  /** Default options for this sound */
  defaultOptions?: SoundOptions;
  /** Human-readable name */
  name?: string;
  /** Category for organization */
  category?: SoundCategory;
  /** Whether this sound respects reduced motion preferences */
  respectsReducedMotion?: boolean;
}

export type SoundCategory = 
  | 'ui' 
  | 'feedback' 
  | 'notification' 
  | 'alert' 
  | 'success' 
  | 'error' 
  | 'navigation' 
  | 'ambient'
  | 'custom';

export interface SoundContextType {
  /** Whether sounds are globally enabled */
  enabled: boolean;
  /** Global volume (0.0 to 1.0) */
  volume: number;
  /** Whether reduced motion preference affects sounds */
  respectsReducedMotion: boolean;
  /** Play a sound by ID */
  playSound: (soundId: string, options?: SoundOptions) => Promise<void>;
  /** Stop a specific sound */
  stopSound: (soundId: string) => Promise<void>;
  /** Stop all sounds */
  stopAllSounds: () => Promise<void>;
  /** Preload sounds for better performance */
  preloadSounds: (soundIds: string[]) => Promise<void>;
  /** Register a new sound asset */
  registerSound: (sound: SoundAsset) => void;
  /** Unregister a sound asset */
  unregisterSound: (soundId: string) => Promise<void>;
  /** Enable/disable sounds globally */
  setEnabled: (enabled: boolean) => void;
  /** Set global volume */
  setVolume: (volume: number) => void;
  /** Set reduced motion respect */
  setRespectsReducedMotion: (respects: boolean) => void;
  /** Get current sound state */
  getSoundState: (soundId: string) => SoundState | null;
}

export interface SoundState {
  /** Whether the sound is currently playing */
  playing: boolean;
  /** Whether the sound is loaded and ready to play */
  isLoaded: boolean;
  /** Current position in seconds */
  currentTime: number;
  /** Duration in seconds */
  duration: number;
  /** Current volume */
  volume: number;
  /** Whether the sound is muted */
  muted: boolean;
  /** Whether the sound is looping */
  loop: boolean;
  /** Current playback rate */
  playbackRate: number;
}

export interface HapticFeedbackOptions {
  /** Type of haptic feedback */
  type?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';
  /** Whether to respect reduced motion preferences */
  respectsReducedMotion?: boolean;
}