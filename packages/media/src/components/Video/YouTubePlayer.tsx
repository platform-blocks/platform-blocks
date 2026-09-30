import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ImageStyle, StyleProp, ViewStyle } from 'react-native';

import {
  useLatestCallback,
  hasDOM,
  isWeb,
  devWarn,
  resolveOptionalModule,
  Image,
  Text,
} from '@plocks/ui';
import type { VideoSource, VideoPlaybackRate, VideoQuality, VideoPlayerHandle } from './types';

/** The react-native-webview surface this player uses. */
interface WebViewHandle {
  postMessage(message: string): void;
  injectJavaScript(script: string): void;
}
interface WebViewMessageEvent {
  nativeEvent: { data: string };
}
interface WebViewProps {
  source: { uri: string };
  style?: StyleProp<ViewStyle>;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  startInLoadingState?: boolean;
  onMessage?: (event: WebViewMessageEvent) => void;
  onLoadStart?: () => void;
  onError?: () => void;
  allowsInlineMediaPlayback?: boolean;
  mediaPlaybackRequiresUserAction?: boolean;
  allowsFullscreenVideo?: boolean;
  accessibilityLabel?: string;
}
type WebViewComponent = React.ComponentType<WebViewProps & React.RefAttributes<WebViewHandle>>;

// Platform-specific imports
const WebView = !isWeb
  ? resolveOptionalModule<WebViewComponent>('react-native-webview', {
      loader: () => { try { return require('react-native-webview'); } catch { return null; } },
      accessor: (module: { WebView?: WebViewComponent } | null | undefined) => module?.WebView,
      devWarning: 'react-native-webview not found. YouTube videos will only work on web platform.',
    })
  : null;

/** A message from the hosted player page: an iframe `MessageEvent` or a WebView message. */
type PlayerMessage = { data?: unknown; nativeEvent?: { data?: unknown } };

interface PlayerEventData {
  state?: number;
  currentTime?: number;
  duration?: number;
  volume?: number;
  muted?: boolean;
  playing?: boolean;
  quality?: VideoQuality;
}

interface PlayerEvent {
  eventType?: string;
  data?: PlayerEventData | number | string;
}

const eventData = (data: PlayerEvent['data']): PlayerEventData =>
  data && typeof data === 'object' ? data : {};

interface YouTubePlayerProps {
  source: VideoSource;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  playbackRate?: VideoPlaybackRate;
  quality?: VideoQuality;
  /** Override the hosted player page URL. Defaults to DEFAULT_PLAYER_BASE_URL. */
  playerBaseUrl?: string;
  youtubeOptions?: {
    start?: number;
    end?: number;
    modestbranding?: boolean;
    rel?: boolean;
    iv_load_policy?: number;
  };
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onVolumeChange?: (volume: number) => void;
  onMute?: () => void;
  onUnmute?: () => void;
  onError?: (error: string) => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onBuffer?: (buffering: boolean) => void;
  onQualityChange?: (quality: VideoQuality) => void;
  onFullscreenChange?: (fullscreen: boolean) => void;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

/** The player handle plus YouTube-only extras (state polling snapshot, mute helpers). */
interface YouTubePlayerRef extends VideoPlayerHandle {
  mute: () => void;
  unmute: () => void;
  getState: () => {
    currentTime: number;
    duration: number;
    playing: boolean;
    muted: boolean;
    volume: number;
    loaded: boolean;
  };
}

// Helper function to extract YouTube video ID from various URL formats
const extractYouTubeId = (input: string): string | null => {
  // If it's already just an ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// Default host for the player iframe. The hosted page wraps the YouTube IFrame
// API and relays events via postMessage. Override per-instance with the
// `playerBaseUrl` prop (e.g. to self-host instead of depending on this domain).
const DEFAULT_PLAYER_BASE_URL = 'https://joshstovall.github.io/yt/test.html';

export const YouTubePlayer = forwardRef<VideoPlayerHandle, YouTubePlayerProps>(({
  source,
  poster,
  autoPlay = false,
  loop = false,
  muted = false,
  volume = 1,
  playbackRate = 1,
  quality,
  playerBaseUrl = DEFAULT_PLAYER_BASE_URL,
  youtubeOptions,
  onPlay,
  onPause,
  onTimeUpdate,
  onDurationChange,
  onVolumeChange,
  onMute,
  onUnmute,
  onError,
  onLoad,
  onLoadStart,
  onBuffer,
  onQualityChange,
  onFullscreenChange,
  style,
  accessibilityLabel,
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hot playback values that drive NO UI. Kept in refs (not state) so the
  // 250ms polling cadence doesn't re-render the component — and so the message
  // handler never calls setState during render (the root cause of the
  // "Cannot update a component while rendering a different component" warning).
  // Read only by the imperative getState() and re-emitted via callbacks.
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const currentVolumeRef = useRef(volume);
  const isMutedRef = useRef(muted);

  const webViewRef = useRef<WebViewHandle | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFullscreenRef = useRef(false);

  // Refs for polling to avoid dependency issues
  const isPlayingRef = useRef(isPlaying);
  const isLoadedRef = useRef(isLoaded);
  isPlayingRef.current = isPlaying;
  isLoadedRef.current = isLoaded;

  // The message handler stays referentially stable regardless of parents
  // passing fresh inline callbacks: it calls the latest ones.
  const emitPlay = useLatestCallback(onPlay);
  const emitPause = useLatestCallback(onPause);
  const emitTimeUpdate = useLatestCallback(onTimeUpdate);
  const emitDurationChange = useLatestCallback(onDurationChange);
  const emitVolumeChange = useLatestCallback(onVolumeChange);
  const emitMute = useLatestCallback(onMute);
  const emitUnmute = useLatestCallback(onUnmute);
  const emitLoad = useLatestCallback(onLoad);
  const emitError = useLatestCallback(onError);
  const emitBuffer = useLatestCallback(onBuffer);
  const emitQualityChange = useLatestCallback(onQualityChange);
  const emitFullscreenChange = useLatestCallback(onFullscreenChange);

  // Extract YouTube video ID
  const videoId = useMemo(() =>
    source.youtube ? extractYouTubeId(source.youtube) : null,
    [source.youtube]
  );

  // Generate YouTube iframe URL using hosted player - MEMOIZED to prevent infinite re-renders
  const youtubeUrl = useMemo(() => {
    if (!videoId) return null;

    const config = {
      videoId_s: videoId,
      start: youtubeOptions?.start || 0,
      end: youtubeOptions?.end || null,
      modestbranding_s: youtubeOptions?.modestbranding ? 1 : 0,
      rel_s: youtubeOptions?.rel ? 1 : 0,
      iv_load_policy: youtubeOptions?.iv_load_policy || 1,
      controls_s: 0, // Disable YouTube's native controls so our custom controls show
      loop_s: loop ? 1 : 0,
      autoplay: autoPlay ? 1 : 0,
      mute: muted ? 1 : 0,
      color: 'red',
      playsinline: 1,
      preventFullScreen_s: 0,
      cc_load_policy: 0,
      progressUpdateInterval: 250, // Request updates every 250ms for smooth progress
    };

    const dataParam = encodeURIComponent(JSON.stringify(config));
    return `${playerBaseUrl}?data=${dataParam}`;
  }, [videoId, youtubeOptions, loop, autoPlay, muted, playerBaseUrl]);

  const hasValidSource = Boolean(videoId && youtubeUrl);
  useEffect(() => {
    if (hasValidSource) return;
    emitError('Invalid YouTube video ID or URL');
  }, [hasValidSource, emitError]);

  const invalidSourceContent = (
    <View style={[styles.container, style]} role="alert">
      <View style={styles.errorOverlay}>
        <Text style={styles.errorText}>Invalid YouTube URL</Text>
        <Text style={styles.errorSubtext}>Please provide a valid YouTube video ID or URL.</Text>
      </View>
    </View>
  );

  // Polling functions to get real-time state
  const requestPlayerState = useCallback(() => {
    if (isWeb && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ eventName: 'getPlayerState' }), '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ eventName: 'getPlayerState' }));
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling

    pollingIntervalRef.current = setInterval(() => {
      // Use refs to avoid dependencies on state that changes frequently
      // Always poll if loaded, but more frequently when playing
      if (isLoadedRef.current) {
        requestPlayerState();
      }
    }, isPlayingRef.current ? 250 : 1000); // Poll every 250ms when playing, 1s when paused
  }, [requestPlayerState]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Start polling when loaded; restart when `isPlaying` flips so the interval
  // follows it (250ms playing, 1s paused). Both helpers are stable.
  useEffect(() => {
    if (isLoaded) {
      stopPolling();
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [isPlaying, isLoaded, startPolling, stopPolling]);

  // Handle messages from WebView/iframe
  const handleWebViewMessage = useCallback((event: PlayerMessage) => {
    try {
      // WebView sends string data that needs parsing; the web iframe may send objects.
      const rawData = event.nativeEvent?.data ?? event.data;
      let data: PlayerEvent;
      if (typeof rawData === 'string') {
        data = JSON.parse(rawData) as PlayerEvent;
      } else if (typeof rawData === 'object' && rawData !== null) {
        data = rawData as PlayerEvent;
      } else {
        return;
      }

      const d = eventData(data.data);

      switch (data.eventType) {
        case 'playerReady':
          setIsLoaded(true);
          if (d.duration && d.duration !== durationRef.current) {
            durationRef.current = d.duration;
            emitDurationChange(d.duration);
          }
          emitLoad();
          break;

        case 'playerStateChange': {
          const state = typeof data.data === 'number' ? data.data : d.state;
          const isNowPlaying = state === 1; // YT.PlayerState.PLAYING
          const isPaused = state === 2; // YT.PlayerState.PAUSED
          const isBuffering = state === 3; // YT.PlayerState.BUFFERING
          const isEnded = state === 0; // YT.PlayerState.ENDED

          setIsPlaying(isNowPlaying);

          // Update time/duration from additional data if available.
          if (d.currentTime !== undefined) currentTimeRef.current = d.currentTime;
          if (d.duration !== undefined) durationRef.current = d.duration;

          if (isNowPlaying) {
            emitPlay();
            emitBuffer(false);
          } else if (isPaused || isEnded) {
            emitPause();
          } else if (isBuffering) {
            emitBuffer(true);
          }
          break;
        }

        case 'timeUpdate':
        case 'progress':
        case 'playerState': {
          // These arrive ~4x/sec while playing. They feed refs + callbacks
          // only (no rendered state), so there's no re-render.

          // Time — emit only on a meaningful change to avoid micro-updates.
          if (d.currentTime !== undefined && Math.abs(d.currentTime - currentTimeRef.current) > 0.1) {
            currentTimeRef.current = d.currentTime;
            emitTimeUpdate(d.currentTime);
          }
          if (d.duration !== undefined && d.duration > 0 && d.duration !== durationRef.current) {
            durationRef.current = d.duration;
            emitDurationChange(d.duration);
          }
          // Volume — YouTube sends 0-100, we use 0-1.
          if (d.volume !== undefined) {
            const volumeLevel = d.volume / 100;
            if (Math.abs(volumeLevel - currentVolumeRef.current) > 0.01) {
              currentVolumeRef.current = volumeLevel;
              emitVolumeChange(volumeLevel);
            }
          }
          if (d.muted !== undefined && d.muted !== isMutedRef.current) {
            isMutedRef.current = d.muted;
            if (d.muted) emitMute();
            else emitUnmute();
          }
          // Playing — real state; drives the polling interval.
          if (d.playing !== undefined && d.playing !== isPlayingRef.current) {
            setIsPlaying(d.playing);
            if (d.playing) emitPlay();
            else emitPause();
          }
          break;
        }

        case 'playerError': {
          setHasError(true);
          const errorMessages: Record<number, string> = {
            2: 'Invalid video ID',
            5: 'HTML5 player error',
            100: 'Video not found or private',
            101: 'Video not allowed in embedded players',
            150: 'Video not allowed in embedded players',
          };
          const code = typeof data.data === 'number' ? data.data : Number(data.data);
          emitError(errorMessages[code] || `YouTube error: ${String(data.data)}`);
          break;
        }

        case 'playbackRateChange':
          // Acknowledged; no local state mirrors the rate.
          break;

        case 'playerQualityChange': {
          const quality = typeof data.data === 'string' ? (data.data as VideoQuality) : d.quality;
          if (quality) emitQualityChange(quality);
          break;
        }
      }
    } catch (err) {
      devWarn('Failed to parse YouTube player message:', err);
    }
  }, [emitDurationChange, emitLoad, emitPlay, emitBuffer, emitPause, emitTimeUpdate, emitVolumeChange, emitMute, emitUnmute, emitError, emitQualityChange]);

  // Send command to player
  const sendCommand = useCallback((eventName: string, meta: Record<string, unknown> = {}) => {
    const message = JSON.stringify({ eventName, meta });

    if (isWeb && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    } else if (webViewRef.current) {
      // React Native WebView uses injectJavaScript to trigger the message event
      const escapedMessage = message.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
      webViewRef.current.injectJavaScript(`
        (function() {
          try {
            var event = new MessageEvent('message', {
              data: '${escapedMessage}',
              origin: window.location.origin
            });
            window.dispatchEvent(event);
          } catch (e) {
            // Runs inside the WebView page, where library logging isn't available.
          }
        })();
        true;
      `);
    } else {
      devWarn('[YouTubePlayer] No iframe or WebView ref available');
    }
  }, []);

  // Imperative API
  useImperativeHandle(ref, (): YouTubePlayerRef => ({
    play: () => {
      sendCommand('playVideo');
      // State will be updated via polling/events
    },
    pause: () => {
      sendCommand('pauseVideo');
      // State will be updated via polling/events
    },
    seek: (time: number) => sendCommand('seekTo', { seconds: time, allowSeekAhead: true }),
    setVolume: (vol: number) => sendCommand('setVolume', { volume: vol * 100 }), // YouTube expects 0-100
    setPlaybackRate: (rate: VideoPlaybackRate) => sendCommand('setPlaybackRate', { playbackRate: rate }),
    setMuted: (next: boolean) => sendCommand(next ? 'muteVideo' : 'unMuteVideo'),
    mute: () => sendCommand('muteVideo'),
    unmute: () => sendCommand('unMuteVideo'),
    toggleFullscreen: () => {
      // Web: fullscreen the iframe. Native WebViews go fullscreen from the
      // player's own UI (`allowsFullscreenVideo`).
      const frame = iframeRef.current;
      if (!frame || !hasDOM) return;
      if (!isFullscreenRef.current) {
        frame.requestFullscreen?.().catch((err: Error) => devWarn('YouTube fullscreen failed:', err));
      } else {
        document.exitFullscreen?.().catch((err: Error) => devWarn('YouTube exit fullscreen failed:', err));
      }
    },
    getVideoElement: () => null, // YouTube player doesn't expose direct video element
    // Current state for debugging/synchronization — reads refs so the handle
    // stays stable across the 250ms polling cadence.
    getState: () => ({
      currentTime: currentTimeRef.current,
      duration: durationRef.current,
      playing: isPlayingRef.current,
      muted: isMutedRef.current,
      volume: currentVolumeRef.current,
      loaded: isLoadedRef.current,
    }),
  }), [sendCommand]);

  // Push playbackRate / quality to the player once it's ready and whenever the
  // props change. (Previously these props were accepted but never applied.)
  useEffect(() => {
    if (!isLoaded) return;
    sendCommand('setPlaybackRate', { playbackRate });
  }, [isLoaded, playbackRate, sendCommand]);

  useEffect(() => {
    if (!isLoaded || !quality) return;
    sendCommand('setPlaybackQuality', { quality });
  }, [isLoaded, quality, sendCommand]);

  // Note: We don't need useEffect hooks to call onPlay/onPause/onTimeUpdate/etc
  // because they're already called within handleWebViewMessage when state changes occur
  // This prevents duplicate callback invocations and infinite render loops

  // Set up message listener for web platform
  useEffect(() => {
    if (!isWeb || !hasDOM) return;
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (event.source === iframeRef.current?.contentWindow) {
        handleWebViewMessage({ data: event.data });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleWebViewMessage]);

  // Web fullscreen of the iframe
  useEffect(() => {
    if (!isWeb || !hasDOM) return;
    const handleFullscreenChange = () => {
      const isNowFullscreen = document.fullscreenElement === iframeRef.current && iframeRef.current !== null;
      if (isNowFullscreen === isFullscreenRef.current) return;
      isFullscreenRef.current = isNowFullscreen;
      emitFullscreenChange(isNowFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [emitFullscreenChange]);

  if (!hasValidSource) {
    return invalidSourceContent;
  }

  if (hasError) {
    return (
      <View style={[styles.container, style]} role="alert">
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Video Unavailable</Text>
          <Text style={styles.errorSubtext}>This video could not be played.</Text>
        </View>
        {poster && <Image src={poster} style={styles.poster} resizeMode="cover" />}
      </View>
    );
  }

  if (isWeb) {
    // Web implementation using iframe
    return (
      <View style={[styles.container, style]}>
        <iframe
          ref={iframeRef}
          src={youtubeUrl ?? undefined}
          title={accessibilityLabel || 'YouTube video player'}
          style={IFRAME_CSS}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
        {poster && !isLoaded && (
          <Image
            src={poster}
            style={styles.poster}
            resizeMode="cover"
          />
        )}
      </View>
    );
  } else {
    // React Native implementation using WebView
    if (!WebView) {
      return (
        <View style={[styles.container, style]} role="alert">
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>WebView Required</Text>
            <Text style={styles.errorSubtext}>
              Please install react-native-webview to use YouTube videos:{'\n\n'}
              npm install react-native-webview
            </Text>
          </View>
          {poster && (
            <Image
              src={poster}
              style={styles.poster}
              resizeMode="cover"
            />
          )}
        </View>
      );
    }

    return (
      <View style={[style, styles.fill]}>
        <WebView
          ref={webViewRef}
          source={{ uri: youtubeUrl ?? '' }}
          accessibilityLabel={accessibilityLabel || 'YouTube video player'}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
          onLoadStart={() => onLoadStart?.()}
          onError={() => {
            setHasError(true);
            emitError('Failed to load YouTube player');
          }}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
        />
        {poster && !isLoaded && (
          <Image
            src={poster}
            style={styles.poster}
            resizeMode="cover"
          />
        )}
      </View>
    );
  }
});

// A DOM <iframe> takes CSS, not RN styles.
const IFRAME_CSS: React.CSSProperties = { width: '100%', height: '100%', border: 'none', backgroundColor: '#000000' };

// Media chrome: black letterbox and light text are the video surface, not theme roles.
const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  errorOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    bottom: 0,
    end: 0,
    justifyContent: 'center',
    padding: 20,
    position: 'absolute',
    start: 0,
    top: 0,
    zIndex: 2,
  },
  errorSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  poster: {
    bottom: 0,
    end: 0,
    position: 'absolute',
    start: 0,
    top: 0,
    zIndex: 1,
  },
  webView: {
    backgroundColor: '#000000',
    flex: 1,
  },
});

YouTubePlayer.displayName = 'YouTubePlayer';
