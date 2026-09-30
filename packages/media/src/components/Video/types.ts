import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

import type { BaseProps } from '@plocks/ui';

export type VideoSource = {
  /** Video URL (mp4, webm, etc.) */
  url?: string;
  /** YouTube video ID or URL */
  youtube?: string;
  /** File buffer (for React Native) */
  buffer?: ArrayBuffer | string;
  /** MIME type for buffer */
  type?: string;
};

export type VideoQuality = 'auto' | 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres';

export type VideoPlaybackRate = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

export interface VideoControls {
  /** Show/hide play button */
  play?: boolean;
  /** Show/hide pause button */
  pause?: boolean;
  /** Show/hide progress bar */
  progress?: boolean;
  /** Show/hide time display */
  time?: boolean;
  /** Show/hide volume control */
  volume?: boolean;
  /** Show/hide fullscreen toggle */
  fullscreen?: boolean;
  /** Show/hide playback speed control */
  playbackRate?: boolean;
  /** Auto-hide controls after inactivity */
  autoHide?: boolean;
  /** Auto-hide timeout in milliseconds */
  autoHideTimeout?: number;
}

export interface VideoState {
  /** Current playback time in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
  /** Is video playing */
  playing: boolean;
  /** Is video loading */
  loading: boolean;
  /** Is video muted */
  muted: boolean;
  /** Volume level (0-1) */
  volume: number;
  /** Current playback rate */
  playbackRate: VideoPlaybackRate;
  /** Is video in fullscreen */
  fullscreen: boolean;
  /** Video quality (YouTube) */
  quality: VideoQuality;
  /** Error state */
  error: string | null;
  /** Is video buffering */
  buffering: boolean;
}

/** Payload of a timeline event. `title` is shown as the marker's tooltip and in its label. */
export interface VideoTimelineEventData {
  title?: string;
  label?: string;
  [key: string]: unknown;
}

export interface VideoTimelineEvent {
  /** Event ID */
  id: string;
  /** Time in seconds when event should trigger */
  time: number;
  /** Event type */
  type: 'marker' | 'chapter' | 'annotation' | 'cue' | 'custom';
  /** Event data */
  data?: VideoTimelineEventData;
  /** Callback function */
  callback?: (event: VideoTimelineEvent, state: VideoState) => void;
}

export interface VideoProps extends BaseProps<ViewStyle> {
  /** Video source configuration */
  source: VideoSource;

  /**
   * Width / height ratio used when `w` or `h` is missing: with only one of
   * them the other follows this ratio; with neither the player fills the
   * width. @default 16 / 9
   */
  aspectRatio?: number;
  poster?: string;
  
  /** Playback configuration */
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: VideoPlaybackRate;
  quality?: VideoQuality;
  
  /** Controls configuration */
  controls?: boolean | VideoControls;
  
  /** Timeline events for synchronization */
  timeline?: VideoTimelineEvent[];
  
  /** YouTube specific options */
  youtubeOptions?: {
    /** Start time in seconds */
    start?: number;
    /** End time in seconds */
    end?: number;
    /** Hide YouTube branding */
    modestbranding?: boolean;
    /** Disable related videos */
    rel?: boolean;
    /** Show video annotations */
    iv_load_policy?: number;
  };
  
  /** Event handlers */
  onPlay?: (state: VideoState) => void;
  onPause?: (state: VideoState) => void;
  onSeek?: (time: number, state: VideoState) => void;
  onTimeUpdate?: (state: VideoState) => void;
  onDurationChange?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onPlaybackRateChange?: (rate: VideoPlaybackRate) => void;
  /** YouTube reported a quality change. */
  onQualityChange?: (quality: VideoQuality) => void;
  /** Entered / left fullscreen (web). */
  onFullscreenChange?: (fullscreen: boolean) => void;
  onError?: (error: string) => void;
  onLoad?: (state: VideoState) => void;
  onLoadStart?: () => void;
  onBuffer?: (buffering: boolean) => void;
  onTimelineEvent?: (event: VideoTimelineEvent, state: VideoState) => void;
  
  /** Styling */
  videoStyle?: StyleProp<ImageStyle>;
  controlsStyle?: StyleProp<ViewStyle>;

  /** Accessible name of the video (default "Video player") */
  accessibilityLabel?: string;
}

export interface VideoRef {
  /** Play the video */
  play: () => void;
  /** Pause the video */
  pause: () => void;
  /** Seek to specific time */
  seek: (time: number) => void;
  /** Set volume (0-1) */
  setVolume: (volume: number) => void;
  /** Mute or unmute */
  setMuted: (muted: boolean) => void;
  /** Set playback rate */
  setPlaybackRate: (rate: VideoPlaybackRate) => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Get current state */
  getState: () => VideoState;
  /** Get video element (web) */
  getVideoElement: () => HTMLVideoElement | null;
}

/**
 * @internal The imperative API both players (web `<video>` and YouTube) give
 * `Video`. Not exported from the package.
 */
export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: VideoPlaybackRate) => void;
  toggleFullscreen: () => void;
  getVideoElement: () => HTMLVideoElement | null;
}
