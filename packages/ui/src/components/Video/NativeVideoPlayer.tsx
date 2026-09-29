import React, { forwardRef, useImperativeHandle, useRef, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ImageStyle, StyleProp } from 'react-native';

import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { hasDOM, isWeb } from '../../core/platform';
import { devWarn } from '../../core/utils/logger';
import { Image } from '../Image';
import { Text } from '../Text';
import type { VideoSource, VideoPlaybackRate, VideoPlayerHandle } from './types';

interface NativeVideoPlayerProps {
  source: VideoSource;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: VideoPlaybackRate;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onError?: (error: string) => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onBuffer?: (buffering: boolean) => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

const NO_SOURCE_ERROR = 'No valid video source provided';

// A DOM <video> takes CSS, not RN styles.
const VIDEO_CSS: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };

/**
 * URL for the source: `url`, a data URL `buffer`, or an object URL for an
 * `ArrayBuffer` (revoked when the source changes or the player unmounts).
 */
function useVideoUrl(source: VideoSource): string | null {
  const { url, buffer, type } = source;
  const objectUrl = useMemo(() => {
    if (url || !buffer || typeof buffer === 'string' || !hasDOM) return null;
    return URL.createObjectURL(new Blob([buffer], { type: type || 'video/mp4' }));
  }, [url, buffer, type]);

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  if (url) return url;
  if (typeof buffer === 'string') return buffer;
  return objectUrl;
}

/**
 * Plays `url` / `buffer` sources. Web renders a `<video>` element driven by
 * the custom controls; native renders the poster with a setup note (bring
 * react-native-video / expo-video for native playback).
 */
export const NativeVideoPlayer = forwardRef<VideoPlayerHandle, NativeVideoPlayerProps>(({
  source,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  volume = 1,
  playbackRate = 1,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
  onError,
  onLoad,
  onLoadStart,
  onBuffer,
  onFullscreenChange,
  style,
  accessibilityLabel,
}, ref) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFullscreenRef = useRef(false);

  const videoUrl = useVideoUrl(source);

  // Event callbacks run from DOM listeners: always call the latest props.
  const emitPlay = useLatestCallback(onPlay);
  const emitPause = useLatestCallback(onPause);
  const emitTimeUpdate = useLatestCallback(onTimeUpdate);
  const emitDurationChange = useLatestCallback(onDurationChange);
  const emitError = useLatestCallback(onError);
  const emitLoad = useLatestCallback(onLoad);
  const emitLoadStart = useLatestCallback(onLoadStart);
  const emitBuffer = useLatestCallback(onBuffer);
  const emitFullscreenChange = useLatestCallback(onFullscreenChange);

  useImperativeHandle(ref, () => ({
    play: () => {
      videoRef.current?.play().catch((err: Error) => {
        devWarn('Video play failed:', err);
        emitError(`Play failed: ${err.message}`);
      });
    },
    pause: () => {
      videoRef.current?.pause();
    },
    seek: (time: number) => {
      if (videoRef.current) videoRef.current.currentTime = time;
    },
    setVolume: (vol: number) => {
      if (videoRef.current) videoRef.current.volume = Math.max(0, Math.min(1, vol));
    },
    setMuted: (next: boolean) => {
      if (videoRef.current) videoRef.current.muted = next;
    },
    setPlaybackRate: (rate: VideoPlaybackRate) => {
      if (videoRef.current) videoRef.current.playbackRate = rate;
    },
    toggleFullscreen: () => {
      const video = videoRef.current;
      if (!video || !hasDOM) return;
      if (!isFullscreenRef.current) {
        video.requestFullscreen?.().catch((err: Error) => devWarn('Video fullscreen failed:', err));
      } else {
        document.exitFullscreen?.().catch((err: Error) => devWarn('Video exit fullscreen failed:', err));
      }
    },
    getVideoElement: () => videoRef.current,
  }), [emitError]);

  // Handle fullscreen change events
  useEffect(() => {
    if (!hasDOM) return;

    const handleFullscreenChange = () => {
      const isNowFullscreen = document.fullscreenElement === videoRef.current && videoRef.current !== null;
      if (isNowFullscreen === isFullscreenRef.current) return;
      isFullscreenRef.current = isNowFullscreen;
      emitFullscreenChange(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [emitFullscreenChange]);

  // Media element events. Re-bound when the element changes (new source).
  useEffect(() => {
    const video = videoRef.current;
    if (!isWeb || !video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      emitLoadStart();
    };
    const handleLoadedData = () => {
      setIsLoading(false);
      setError(null);
      emitLoad();
    };
    const handleLoadedMetadata = () => {
      if (video.duration) emitDurationChange(video.duration);
    };
    const handlePlay = () => emitPlay();
    const handlePause = () => emitPause();
    const handleTimeUpdate = () => emitTimeUpdate(video.currentTime);
    const handleWaiting = () => emitBuffer(true);
    const handleCanPlay = () => emitBuffer(false);
    const handleError = () => {
      const errorMsg = video.error ? `Video error: ${video.error.message}` : 'Unknown video error';
      setError(errorMsg);
      setIsLoading(false);
      emitError(errorMsg);
    };

    const listeners: Array<[keyof HTMLVideoElementEventMap, () => void]> = [
      ['loadstart', handleLoadStart],
      ['loadeddata', handleLoadedData],
      ['loadedmetadata', handleLoadedMetadata],
      ['play', handlePlay],
      ['pause', handlePause],
      ['timeupdate', handleTimeUpdate],
      ['waiting', handleWaiting],
      ['canplay', handleCanPlay],
      ['error', handleError],
    ];
    listeners.forEach(([name, handler]) => video.addEventListener(name, handler));
    return () => listeners.forEach(([name, handler]) => video.removeEventListener(name, handler));
  }, [videoUrl, emitLoadStart, emitLoad, emitDurationChange, emitPlay, emitPause, emitTimeUpdate, emitBuffer, emitError]);

  // Set video properties when they change
  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = Math.max(0, Math.min(1, volume));
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (!videoUrl) emitError(NO_SOURCE_ERROR);
  }, [videoUrl, emitError]);

  if (!videoUrl) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>{NO_SOURCE_ERROR}</Text>
      </View>
    );
  }

  if (isWeb) {
    return (
      <View style={[styles.container, style]}>
        {poster && isLoading && <Image src={poster} style={styles.poster} resizeMode="cover" />}

        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={false} // We handle controls ourselves
          style={VIDEO_CSS}
          playsInline
          preload="metadata"
          aria-label={accessibilityLabel}
        />

        {error && (
          <View style={styles.errorOverlay} role="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    );
  }

  // For React Native platforms, use a placeholder or react-native-video
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.messageText}>
        Native video playback requires additional setup for React Native.
        Consider using react-native-video for native platforms.
      </Text>
      {poster && <Image src={poster} style={styles.poster} resizeMode="cover" />}
    </View>
  );
});

// Media chrome: black letterbox and white text are the video surface, not theme roles.
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  poster: {
    bottom: 0,
    end: 0,
    position: 'absolute',
    start: 0,
    top: 0,
    zIndex: 1,
  },
  errorOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    bottom: 0,
    end: 0,
    justifyContent: 'center',
    position: 'absolute',
    start: 0,
    top: 0,
    zIndex: 2,
  },
  errorText: {
    color: '#FFFFFF',
    padding: 20,
    textAlign: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    end: 20,
    padding: 20,
    position: 'absolute',
    start: 20,
    textAlign: 'center',
    top: '50%',
    zIndex: 2,
  },
});

NativeVideoPlayer.displayName = 'NativeVideoPlayer';
