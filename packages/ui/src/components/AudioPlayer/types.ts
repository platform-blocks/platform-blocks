import type { WaveformProps } from '../Waveform/types';

/** Which controls AudioPlayer renders. Unset keys fall back to the defaults. */
export interface AudioPlayerControls {
  /** Play / pause button. @default true */
  playPause?: boolean;
  /** Skip back / forward 10 seconds buttons. @default true */
  skip?: boolean;
  /** Mute / unmute button. @default true */
  volume?: boolean;
  /** Playback speed button (cycles 0.5x–2x). @default false */
  speed?: boolean;
  /** The seekable waveform. @default true */
  waveform?: boolean;
}

export interface AudioPlayerProps
  extends Omit<WaveformProps, 'peaks' | 'progress' | 'variant' | 'onKeyDown' | 'duration'> {
  /** Audio source - can be URL, local file, or asset */
  source?: string | number | { uri: string };
  /** Pre-computed waveform peaks (optional - placeholder peaks are generated if not provided) */
  peaks?: number[];
  /** Waveform width in px — not the player's, which fills its parent. @default 300 */
  w?: number;
  /** Waveform height in px. @default 60 */
  h?: number;
  /** Whether to auto-play when loaded */
  autoPlay?: boolean;
  /** Whether to loop the audio */
  loop?: boolean;
  /** Initial volume (0-1) */
  volume?: number;
  /** Playback rate (0.5-2.0) */
  rate?: number;
  /** Whether to show player controls */
  showControls?: boolean;
  /** Which controls to display; merged over the defaults. */
  controls?: AudioPlayerControls;
  /**
   * Where the controls sit: above or below the waveform, laid over it, or
   * hidden. Metadata renders above the waveform for `overlay` and `none`.
   */
  controlsPosition?: 'top' | 'bottom' | 'overlay' | 'none';

  // Audio Events
  /** Called when audio is loaded and ready */
  onLoad?: (data: AudioLoadData) => void;
  /** Called when playback state changes */
  onPlaybackStateChange?: (state: PlaybackState) => void;
  /** Called during playback with current time */
  onProgress?: (data: ProgressData) => void;
  /** Called when playback finishes */
  onEnd?: () => void;
  /** Called on playback error */
  onError?: (error: AudioError) => void;

  // Waveform Generation
  /**
   * Draw placeholder peaks when `peaks` is omitted. expo-audio can't analyze a
   * file up front, so pass measured `peaks` when the waveform's shape matters.
   */
  generateWaveform?: boolean;
  /** Placeholder waveform options */
  waveformOptions?: {
    /** Number of placeholder bars. @default 200 */
    samples?: number;
  };

  // Visual Features
  /** Show time labels */
  showTime?: boolean;
  /**
   * Time format: `mm:ss`, `hh:mm:ss`, or `relative` (elapsed / `-remaining`).
   */
  timeFormat?: 'mm:ss' | 'hh:mm:ss' | 'relative';
  /** Show audio metadata */
  showMetadata?: boolean;
  /** Audio metadata */
  metadata?: AudioMetadata;

  // Interaction
  /**
   * Keyboard shortcuts while the waveform (seek slider) has focus (web):
   * Space play/pause, J / L skip back / forward, M mute. Arrow keys, Page
   * Up/Down and Home/End seek. @default true
   */
  enableKeyboardShortcuts?: boolean;
  /** Override the shortcut keys (`KeyboardEvent.key` values, case-insensitive). */
  keyboardShortcuts?: KeyboardShortcuts;
}

export interface AudioLoadData {
  duration: number;
  sampleRate: number;
  channels: number;
  bitrate?: number;
  format?: string;
  peaks?: number[];
}

export interface PlaybackState {
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  rate: number;
  loop: boolean;
}

export interface ProgressData {
  currentTime: number;
  duration: number;
  progress: number; // 0-1
  position: number; // 0-1 for waveform
  /** Always 0: expo-audio doesn't report buffered ranges. */
  buffered: number;
}

/** @deprecated AudioPlayer never reported buffering ranges; `onBuffer` was removed. */
export interface BufferData {
  buffered: number; // 0-1
  bufferedRanges: { start: number; end: number }[];
}

export interface AudioError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  artwork?: string;
  duration?: number;
  genre?: string;
  year?: number;
}

/** @deprecated AudioPlayer has no spectrum analyzer; `showSpectrum` / `spectrumOptions` were removed. */
export interface SpectrumOptions {
  fftSize?: number;
  smoothingTimeConstant?: number;
  minDecibels?: number;
  maxDecibels?: number;
  bands?: number;
  style?: 'bars' | 'line' | 'circular';
}

/** Shortcut keys (`KeyboardEvent.key` values). Unset actions keep their defaults; `volumeUp` / `volumeDown` have none. */
export interface KeyboardShortcuts {
  /** @default ' ' (Space) */
  playPause?: string;
  /** @default 'l' */
  skipForward?: string;
  /** @default 'j' */
  skipBackward?: string;
  volumeUp?: string;
  volumeDown?: string;
  /** @default 'm' */
  mute?: string;
}

/** @deprecated AudioPlayer never read gesture options; `enableGestures` / `gestureConfig` were removed. */
export interface GestureConfig {
  doubleTapToPlay?: boolean;
  swipeToSeek?: boolean;
  pinchToZoom?: boolean;
  longPressToScrub?: boolean;
}

/** @deprecated AudioPlayer never applied effects; `enableEffects` / `effects` were removed. */
export interface AudioEffects {
  equalizer?: EqualizerSettings;
  reverb?: ReverbSettings;
  compressor?: CompressorSettings;
  filters?: FilterSettings[];
}

export interface EqualizerSettings {
  enabled: boolean;
  bands: { frequency: number; gain: number }[];
  preset?: 'rock' | 'pop' | 'jazz' | 'classical' | 'electronic' | 'custom';
}

export interface ReverbSettings {
  enabled: boolean;
  roomSize: number;
  dampening: number;
  wetLevel: number;
  dryLevel: number;
}

export interface CompressorSettings {
  enabled: boolean;
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
}

export interface FilterSettings {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'notch';
  frequency: number;
  q: number;
  gain?: number;
}

/** @deprecated AudioPlayer never supported playlists; `playlist` / `currentTrack` / `onTrackChange` were removed. */
export interface PlaylistItem {
  id: string;
  source: string | number | { uri: string };
  title?: string;
  artist?: string;
  duration?: number;
  artwork?: string;
  peaks?: number[];
  metadata?: AudioMetadata;
}

export interface AudioPlayerRef {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setLoop: (loop: boolean) => Promise<void>;
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
  getPlaybackState: () => PlaybackState;
  load: (source: string | number | { uri: string }) => Promise<void>;
  unload: () => Promise<void>;
  getWaveformPeaks: () => number[];
  /** Highlight a time range (milliseconds) on the waveform. */
  setSelection: (start: number, end: number) => void;
  /** Remove the highlighted range. */
  clearSelection: () => void;
  /** The highlighted range in milliseconds, or null. */
  getSelection: () => { start: number; end: number } | null;
}