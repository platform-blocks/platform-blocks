import React, { useImperativeHandle, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { isWeb } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveStyleProps, useStyleProps } from '../../core/utils/spacing';
import { warnOnce } from '../../core/utils/logger';
import { VideoControls } from './VideoControls';
import { VideoTimeline } from './VideoTimeline';
import { YouTubePlayer } from './YouTubePlayer';
import { NativeVideoPlayer } from './NativeVideoPlayer';
import type {
  VideoControls as VideoControlsConfig,
  VideoPlayerHandle,
  VideoProps,
  VideoRef,
  VideoState,
  VideoPlaybackRate,
  VideoQuality,
} from './types';

const DEFAULT_CONTROLS: Required<VideoControlsConfig> = {
  play: true,
  pause: true,
  progress: true,
  time: true,
  volume: true,
  fullscreen: true,
  playbackRate: false,
  quality: false,
  autoHide: true,
  autoHideTimeout: 3000,
};

const EMPTY_TIMELINE: NonNullable<VideoProps['timeline']> = [];

const styles = StyleSheet.create({
  // Not `overflow: hidden`: the speed menu opens above the control bar and may
  // extend past a short player.
  root: { position: 'relative' },
});

/**
 * Video player for `url` / `buffer` sources (web `<video>`) and YouTube
 * (iframe on web, react-native-webview on native), with custom labelled
 * controls, timeline events and an imperative `VideoRef`.
 */
export const Video = factory<{ props: VideoProps; ref: VideoRef }>((props, ref) => {
  const {
    source,
    w: wProp,
    h: hProp,
    aspectRatio = 16 / 9,
    poster,
    autoPlay = false,
    loop = false,
    muted = false,
    volume = 1,
    playbackRate = 1,
    quality = 'auto',
    controls = true,
    timeline = EMPTY_TIMELINE,
    youtubeOptions,
    onPlay,
    onPause,
    onSeek,
    onTimeUpdate,
    onDurationChange,
    onVolumeChange,
    onPlaybackRateChange,
    onQualityChange,
    onFullscreenChange,
    onError,
    onLoad,
    onLoadStart,
    onBuffer,
    onTimelineEvent,
    style,
    videoStyle,
    controlsStyle,
    accessibilityLabel,
    testID,
    ...rest
  } = props;

  const theme = useTheme();
  // `w` / `h` go through `boxStyle` below (a missing one follows
  // `aspectRatio`), not with the other style props.
  const spacingStyles = useStyleProps(rest);

  // Internal state
  const [videoState, setVideoState] = useState<VideoState>({
    currentTime: 0,
    duration: 0,
    playing: false,
    loading: true,
    muted,
    volume,
    playbackRate,
    fullscreen: false,
    quality,
    error: null,
    buffering: false,
  });

  const [showControls, setShowControls] = useState(true);
  const [focusWithin, setFocusWithin] = useState(false);

  // Refs
  const timelineProcessedEvents = useRef<Set<string>>(new Set());
  const hideControlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoPlayerRef = useRef<VideoPlayerHandle | null>(null);
  const hasCalledOnLoad = useRef<boolean>(false);
  const videoStateRef = useRef<VideoState>(videoState);
  const isScrubbingRef = useRef<boolean>(false);

  // Latest state for imperative reads, without re-creating callbacks.
  videoStateRef.current = videoState;

  // Callback props are called from player events: always the latest ones.
  const emitPlay = useLatestCallback(onPlay);
  const emitPause = useLatestCallback(onPause);
  const emitSeek = useLatestCallback(onSeek);
  const emitTimeUpdate = useLatestCallback(onTimeUpdate);
  const emitDurationChange = useLatestCallback(onDurationChange);
  const emitVolumeChange = useLatestCallback(onVolumeChange);
  const emitPlaybackRateChange = useLatestCallback(onPlaybackRateChange);
  const emitQualityChange = useLatestCallback(onQualityChange);
  const emitFullscreenChange = useLatestCallback(onFullscreenChange);
  const emitError = useLatestCallback(onError);
  const emitLoad = useLatestCallback(onLoad);
  const emitBuffer = useLatestCallback(onBuffer);
  const emitTimelineEvent = useLatestCallback(onTimelineEvent);

  // Determine video type
  const videoType = source.youtube ? 'youtube' : source.url || source.buffer ? 'native' : null;

  // Controls configuration
  const controlsConfig = useMemo(() => {
    if (controls === false) return false;
    if (controls === true) return DEFAULT_CONTROLS;
    return { ...DEFAULT_CONTROLS, ...controls };
  }, [controls]);

  if (controlsConfig && controlsConfig.quality) {
    warnOnce('Video.controls.quality', 'Video: `controls.quality` has no effect — YouTube no longer lets players pick a quality.');
  }

  // Timeline event processing reads the latest timeline without re-creating the updater.
  const timelineRef = useRef(timeline);
  timelineRef.current = timeline;

  const processTimelineEvents = useCallback((currentTime: number, state: VideoState) => {
    timelineRef.current.forEach((event) => {
      const eventKey = `${event.id}-${Math.floor(event.time)}`;

      if (
        currentTime >= event.time &&
        currentTime < event.time + 0.5 && // 500ms tolerance
        !timelineProcessedEvents.current.has(eventKey)
      ) {
        timelineProcessedEvents.current.add(eventKey);
        event.callback?.(event, state);
        emitTimelineEvent(event, state);
      }

      // Clean up old events (more than 1 second ago)
      if (currentTime > event.time + 1) {
        timelineProcessedEvents.current.delete(eventKey);
      }
    });
  }, [emitTimelineEvent]);

  // State update handler
  const updateVideoState = useCallback((updates: Partial<VideoState>) => {
    setVideoState(prevState => {
      const newState = { ...prevState, ...updates };

      // Process timeline events if time changed
      if (updates.currentTime !== undefined && updates.currentTime !== prevState.currentTime) {
        processTimelineEvents(updates.currentTime, newState);
      }

      return newState;
    });
  }, [processTimelineEvents]);

  // Control visibility management
  const autoHide = !!controlsConfig && controlsConfig.autoHide;
  const autoHideTimeout = (controlsConfig && controlsConfig.autoHideTimeout) || 3000;
  const showControlsTemporarily = useCallback(() => {
    if (!autoHide) return;

    setShowControls(true);

    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }

    hideControlsTimeout.current = setTimeout(() => {
      if (videoStateRef.current.playing) {
        setShowControls(false);
      }
    }, autoHideTimeout);
  }, [autoHide, autoHideTimeout]);

  useEffect(
    () => () => {
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    },
    []
  );

  // Player control methods
  const play = useCallback(() => {
    videoPlayerRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    videoPlayerRef.current?.pause();
  }, []);

  const seek = useCallback((time: number) => {
    videoPlayerRef.current?.seek(time);
    emitSeek(time, videoStateRef.current);
  }, [emitSeek]);

  const setVolumeLevel = useCallback((vol: number) => {
    videoPlayerRef.current?.setVolume(vol);
    const updates: Partial<VideoState> = { volume: vol };
    // Raising the volume of a muted video unmutes it.
    if (vol > 0 && videoStateRef.current.muted) {
      videoPlayerRef.current?.setMuted(false);
      updates.muted = false;
    }
    updateVideoState(updates);
    emitVolumeChange(vol);
  }, [updateVideoState, emitVolumeChange]);

  const setMuted = useCallback((next: boolean) => {
    videoPlayerRef.current?.setMuted(next);
    updateVideoState({ muted: next });
  }, [updateVideoState]);

  const toggleMute = useCallback(() => {
    setMuted(!(videoStateRef.current.muted || videoStateRef.current.volume === 0));
  }, [setMuted]);

  const setPlaybackRateLevel = useCallback((rate: VideoPlaybackRate) => {
    videoPlayerRef.current?.setPlaybackRate(rate);
    updateVideoState({ playbackRate: rate });
    emitPlaybackRateChange(rate);
  }, [updateVideoState, emitPlaybackRateChange]);

  const toggleFullscreen = useCallback(() => {
    videoPlayerRef.current?.toggleFullscreen();
  }, []);

  const getVideoElement = useCallback(() => {
    if (isWeb) return videoPlayerRef.current?.getVideoElement() ?? null;
    return null;
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    play,
    pause,
    seek,
    setVolume: setVolumeLevel,
    setMuted,
    setPlaybackRate: setPlaybackRateLevel,
    toggleFullscreen,
    getState: () => videoStateRef.current,
    getVideoElement,
  }), [play, pause, seek, setVolumeLevel, setMuted, setPlaybackRateLevel, toggleFullscreen, getVideoElement]);

  // Player event handlers — stable, reading state through the ref.
  const handlePlay = useCallback(() => {
    updateVideoState({ playing: true });
    emitPlay({ ...videoStateRef.current, playing: true });
    showControlsTemporarily();
  }, [updateVideoState, emitPlay, showControlsTemporarily]);

  const handlePause = useCallback(() => {
    updateVideoState({ playing: false });
    setShowControls(true);
    emitPause({ ...videoStateRef.current, playing: false });
  }, [updateVideoState, emitPause]);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    // Skip time updates while user is scrubbing to prevent jittery behavior
    if (isScrubbingRef.current) return;
    updateVideoState({ currentTime });
    emitTimeUpdate({ ...videoStateRef.current, currentTime });
  }, [updateVideoState, emitTimeUpdate]);

  const handleDurationChange = useCallback((duration: number) => {
    updateVideoState({ duration });
    emitDurationChange(duration);
  }, [updateVideoState, emitDurationChange]);

  const handleError = useCallback((error: string) => {
    updateVideoState({ error, loading: false });
    emitError(error);
  }, [updateVideoState, emitError]);

  const handleLoad = useCallback(() => {
    updateVideoState({ loading: false, error: null });
  }, [updateVideoState]);

  const handleBuffer = useCallback((buffering: boolean) => {
    updateVideoState({ buffering });
    emitBuffer(buffering);
  }, [updateVideoState, emitBuffer]);

  const handleQualityChange = useCallback((next: VideoQuality) => {
    updateVideoState({ quality: next });
    emitQualityChange(next);
  }, [updateVideoState, emitQualityChange]);

  const handleFullscreenChange = useCallback((fullscreen: boolean) => {
    updateVideoState({ fullscreen });
    emitFullscreenChange(fullscreen);
  }, [updateVideoState, emitFullscreenChange]);

  // `onLoad` fires once per load, after loading finishes without an error.
  useEffect(() => {
    if (videoState.loading) {
      hasCalledOnLoad.current = false;
      return;
    }
    if (!videoState.error && !hasCalledOnLoad.current) {
      hasCalledOnLoad.current = true;
      emitLoad(videoStateRef.current);
    }
  }, [videoState.loading, videoState.error, emitLoad]);

  // Box: explicit w/h win; a missing dimension follows `aspectRatio`.
  const boxStyle = useMemo<ViewStyle>(() => {
    const { width: w, height: h } = resolveStyleProps({ w: wProp, h: hProp });
    if (w !== undefined && h !== undefined) return { width: w, height: h };
    if (w !== undefined) return typeof w === 'number' ? { width: w, height: w / aspectRatio } : { width: w, aspectRatio };
    if (h !== undefined) return typeof h === 'number' ? { width: h * aspectRatio, height: h } : { height: h, aspectRatio };
    return { width: '100%', aspectRatio };
  }, [wProp, hProp, aspectRatio]);

  const handleScrubbingChange = useCallback((scrubbing: boolean) => {
    isScrubbingRef.current = scrubbing;
  }, []);

  const rootA11y = a11yProps({ role: 'group', label: accessibilityLabel || 'Video player' });

  if (!videoType) {
    return (
      <View
        style={[boxStyle, { backgroundColor: theme.backgrounds.subtle }, spacingStyles, style]}
        testID={testID}
        {...rootA11y}
      />
    );
  }

  // Keyboard users keep the controls while focus is inside them.
  const controlsVisible = showControls || !videoState.playing || focusWithin;

  return (
    <View
      style={[styles.root, boxStyle, spacingStyles, style]}
      // Any press (touch or mouse) inside brings the controls back; returning
      // false leaves the press to whatever was pressed.
      onStartShouldSetResponderCapture={() => {
        showControlsTemporarily();
        return false;
      }}
      onFocus={() => {
        setFocusWithin(true);
        showControlsTemporarily();
      }}
      onBlur={() => setFocusWithin(false)}
      testID={testID}
      {...rootA11y}
    >
      {videoType === 'youtube' ? (
        <YouTubePlayer
          ref={videoPlayerRef}
          source={source}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          volume={volume}
          playbackRate={playbackRate}
          quality={quality}
          youtubeOptions={youtubeOptions}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onError={handleError}
          onLoad={handleLoad}
          onLoadStart={onLoadStart}
          onBuffer={handleBuffer}
          onQualityChange={handleQualityChange}
          onFullscreenChange={handleFullscreenChange}
          style={videoStyle}
          accessibilityLabel={accessibilityLabel}
        />
      ) : (
        <NativeVideoPlayer
          ref={videoPlayerRef}
          source={source}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          volume={volume}
          playbackRate={playbackRate}
          onPlay={handlePlay}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onError={handleError}
          onLoad={handleLoad}
          onLoadStart={onLoadStart}
          onBuffer={handleBuffer}
          onFullscreenChange={handleFullscreenChange}
          style={videoStyle}
          accessibilityLabel={accessibilityLabel}
        />
      )}

      {timeline.length > 0 && (
        <VideoTimeline
          timeline={timeline}
          duration={videoState.duration}
          currentTime={videoState.currentTime}
          onSeek={seek}
        />
      )}

      {controlsConfig && controlsVisible && (
        <VideoControls
          config={controlsConfig}
          state={videoState}
          onPlay={play}
          onPause={pause}
          onSeek={seek}
          onVolumeChange={setVolumeLevel}
          onToggleMute={toggleMute}
          onPlaybackRateChange={setPlaybackRateLevel}
          onToggleFullscreen={toggleFullscreen}
          onScrubbingChange={handleScrubbingChange}
          style={controlsStyle}
        />
      )}
    </View>
  );
}, { displayName: 'Video' });
