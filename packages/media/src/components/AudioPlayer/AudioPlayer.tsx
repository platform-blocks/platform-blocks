import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import {
  factory,
  a11yProps,
  useLatestCallback,
  useThemedStyles,
  isNative,
  useTheme,
  onColor,
  resolveFontSize,
  resolveRadius,
  resolveSpacing,
  extractStyleProps,
  useStyleProps,
  devWarn,
  devError,
  resolveOptionalModule,
  webProps,
  Waveform,
  Icon,
} from '@plocks/ui';
import type { WebKeyboardEvent, PlocksTheme } from '@plocks/ui';
import { useSoundOptional } from '../../sound/context';
import type {
  AudioPlayerControls,
  AudioPlayerProps,
  AudioPlayerRef,
  PlaybackState,
  ProgressData,
  AudioLoadData,
  AudioError,
  KeyboardShortcuts,
} from './types';

type AudioSource = NonNullable<AudioPlayerProps['source']>;

/** The expo-audio status fields AudioPlayer reads (seconds). */
interface ExpoAudioStatus {
  duration?: number;
  currentTime?: number;
  playing?: boolean;
  isLoaded?: boolean;
  isBuffering?: boolean;
  playbackRate?: number;
  loop?: boolean;
  didJustFinish?: boolean;
}

/** The slice of expo-audio's `AudioPlayer` this component drives. */
interface ExpoAudioPlayer {
  volume: number;
  loop: boolean;
  muted?: boolean;
  duration: number;
  currentTime: number;
  play(): void;
  pause(): void;
  seekTo(seconds: number): Promise<void> | void;
  setPlaybackRate(rate: number): void;
  addListener(event: 'playbackStatusUpdate', listener: (status: ExpoAudioStatus) => void): { remove(): void };
  remove?(): void;
}

interface ExpoAudioModule {
  createAudioPlayer?: (source: AudioSource, options?: { updateInterval?: number }) => ExpoAudioPlayer;
}

const ExpoAudio = resolveOptionalModule<ExpoAudioModule>('expo-audio', {
  loader: () => { try { return require('expo-audio'); } catch { return null; } },
  devWarning: 'expo-audio not found; AudioPlayer renders its controls but cannot play audio',
});

/** How often expo-audio reports playback status, in ms. Tight enough for a moving waveform. */
const STATUS_UPDATE_INTERVAL = 100;

/** Skip buttons / J-L shortcuts jump this far, in ms. */
const SKIP_INTERVAL_MS = 10_000;

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const DEFAULT_CONTROLS: Required<AudioPlayerControls> = {
  playPause: true,
  skip: true,
  volume: true,
  speed: false,
  waveform: true,
};

const DEFAULT_SHORTCUTS: KeyboardShortcuts = {
  playPause: ' ',
  skipForward: 'l',
  skipBackward: 'j',
  mute: 'm',
};

/** Icon-button footprint: ≥44pt touch target on native, 40px on web (≥24 required). */
const PLAY_BUTTON_SIZE = isNative ? 44 : 40;
const ICON_BUTTON_MIN = isNative ? 44 : 32;

/**
 * `PlaybackState`, `ProgressData` and the ref methods are in milliseconds, while
 * expo-audio works in seconds — convert at the boundary rather than in the UI.
 */
const toMs = (seconds: number | undefined) => Math.round((seconds ?? 0) * 1000);

function formatClock(milliseconds: number, withHours: boolean): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (withHours) {
    const hours = Math.floor(minutes / 60);
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const matchesKey = (pressed: string, binding: string | undefined) =>
  !!binding && (pressed === binding || pressed.toLowerCase() === binding.toLowerCase());

// Placeholder peaks. expo-audio exposes PCM frames only while `setAudioSamplingEnabled`
// is on and playback is running, so there is no way to analyze a file up front —
// pass measured `peaks` when the shape of the waveform matters.
const placeholderPeaks = (samples: number): number[] =>
  Array.from({ length: samples }, () => Math.random() * 0.8 + 0.1);

/** Style table for one theme (memoized per theme by `useThemedStyles`). */
function createAudioPlayerStyles(t: PlocksTheme) {
  const styles = StyleSheet.create({
    controlsRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: resolveSpacing(t, 'sm') as number,
      paddingVertical: resolveSpacing(t, 'sm') as number,
    },
    overlay: {
      alignItems: 'center',
      bottom: 0,
      end: 0,
      justifyContent: 'center',
      position: 'absolute',
      start: 0,
      top: 0,
    },
    iconButton: {
      alignItems: 'center',
      borderRadius: resolveRadius(t, 'full'),
      justifyContent: 'center',
      minHeight: ICON_BUTTON_MIN,
      minWidth: ICON_BUTTON_MIN,
      padding: 6,
    },
    playButton: {
      alignItems: 'center',
      backgroundColor: t.colors.primary[5],
      borderRadius: PLAY_BUTTON_SIZE / 2,
      height: PLAY_BUTTON_SIZE,
      justifyContent: 'center',
      width: PLAY_BUTTON_SIZE,
    },
    time: { alignItems: 'center', flexDirection: 'row', gap: 4 },
    timeText: { color: t.text.secondary, fontFamily: t.fontFamilyMono, fontSize: resolveFontSize(t, 'sm') },
    timeSeparator: { color: t.text.muted },
    speedButton: {
      backgroundColor: t.backgrounds.subtle,
      borderRadius: resolveRadius(t, 'sm'),
      justifyContent: 'center',
      minHeight: isNative ? 44 : 24,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    speedText: { color: t.text.primary, fontSize: resolveFontSize(t, 'xs'), fontWeight: '600' },
    metadata: {
      borderBottomColor: t.backgrounds.border,
      borderBottomWidth: 1,
      marginBottom: resolveSpacing(t, 'sm') as number,
      paddingVertical: resolveSpacing(t, 'sm') as number,
    },
    title: { color: t.text.primary, fontSize: resolveFontSize(t, 'md'), fontWeight: '600', marginBottom: 2 },
    artist: { color: t.text.secondary, fontSize: resolveFontSize(t, 'sm') },
    waveform: { marginVertical: resolveSpacing(t, 'sm') as number },
    error: {
      backgroundColor: t.colors.error[1],
      borderColor: t.colors.error[3],
      borderRadius: resolveRadius(t, 'md'),
      borderWidth: 1,
      padding: resolveSpacing(t, 'md') as number,
    },
    errorRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
    errorText: { color: t.colors.error[8], flex: 1 },
    retry: {
      alignSelf: 'flex-start',
      backgroundColor: t.colors.error[6],
      borderRadius: resolveRadius(t, 'sm'),
      marginTop: resolveSpacing(t, 'sm') as number,
      minHeight: isNative ? 44 : 24,
      justifyContent: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    retryText: { color: onColor(t, t.colors.error[6]), fontSize: resolveFontSize(t, 'sm') },
  });
  return styles;
}

export const AudioPlayer = factory<{ props: AudioPlayerProps; ref: AudioPlayerRef }>((props, ref) => {
  // `w` / `h` size the waveform, not the player, so they stay out of the
  // style props applied to the root.
  const { w = 300, h = 60, ...propsWithoutSize } = props;
  const { styleProps, otherProps } = extractStyleProps(propsWithoutSize);
  const {
    source,
    peaks: providedPeaks,
    autoPlay = false,
    loop = false,
    volume = 1.0,
    rate = 1.0,
    showControls = true,
    controls: controlsProp,
    controlsPosition = 'bottom',
    generateWaveform = true,
    waveformOptions,
    showTime = true,
    timeFormat = 'mm:ss',
    showMetadata = false,
    metadata,
    enableKeyboardShortcuts = true,
    keyboardShortcuts,
    onLoad,
    onPlaybackStateChange,
    onProgress,
    onEnd,
    onError,
    // Waveform props
    color = 'primary',
    interactive = true,
    onSeek,
    selection: selectionProp,
    onSelectionChange,
    accessibilityLabel,
    style,
    testID,
    ...waveformProps
  } = otherProps;

  const theme = useTheme();
  const spacingStyles = useStyleProps(styleProps);
  // UI click sounds only when the app mounted a SoundProvider.
  const sound = useSoundOptional();
  const controls = useMemo(() => ({ ...DEFAULT_CONTROLS, ...controlsProp }), [controlsProp]);
  const samples = waveformOptions?.samples ?? 200;

  const styles = useThemedStyles(createAudioPlayerStyles, []);

  // Refs
  const audioRef = useRef<ExpoAudioPlayer | null>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const hasLoadedRef = useRef<boolean>(false);

  // State
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isLoading: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume,
    rate,
    loop,
  });
  const playbackStateRef = useRef(playbackState);
  playbackStateRef.current = playbackState;

  // Placeholder peaks, only used when `peaks` isn't provided.
  const [generatedPeaks, setGeneratedPeaks] = useState<number[]>([]);
  const peaks = providedPeaks ?? generatedPeaks;
  // Mirrors `peaks` for the status listener, which must not close over stale state.
  const peaksRef = useRef<number[]>(peaks);
  peaksRef.current = peaks;
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  /** Highlighted range in ms (`setSelection`, or Shift+drag on the waveform). */
  const [selectionMs, setSelectionMs] = useState<{ start: number; end: number } | null>(null);

  // Callback props run from the player's status listener: read the latest.
  const emitLoad = useLatestCallback(onLoad);
  const emitPlaybackState = useLatestCallback(onPlaybackStateChange);
  const emitProgress = useLatestCallback(onProgress);
  const emitEnd = useLatestCallback(onEnd);
  const emitError = useLatestCallback(onError);

  const releasePlayer = useCallback(() => {
    statusSubscriptionRef.current?.remove();
    statusSubscriptionRef.current = null;
    audioRef.current?.remove?.();
    audioRef.current = null;
  }, []);

  // Audio loading and initialization
  const loadAudio = useCallback(async (audioSource: AudioPlayerProps['source']) => {
    if (!audioSource) {
      devWarn('AudioPlayer: no audio source provided');
      return;
    }

    if (!ExpoAudio?.createAudioPlayer) {
      const audioError: AudioError = {
        code: 'MODULE_MISSING',
        message: 'expo-audio is required for playback. Install it with `npx expo install expo-audio`.',
        details: null,
      };
      setError(audioError.message);
      emitError(audioError);
      return;
    }

    try {
      setPlaybackState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      hasLoadedRef.current = false;

      // Release the previous player and its listener before replacing them
      releasePlayer();

      // expo-audio accepts a URI string, a `require()`d asset, or a source object directly
      const player = ExpoAudio.createAudioPlayer(audioSource, { updateInterval: STATUS_UPDATE_INTERVAL });

      audioRef.current = player;
      player.loop = loop;
      player.volume = volume;
      if (rate !== 1) {
        player.setPlaybackRate(rate);
      }

      // Status updates drive both the exposed state and the waveform progress
      statusSubscriptionRef.current = player.addListener('playbackStatusUpdate', (status) => {
        const durationMs = toMs(status.duration);
        const currentTimeMs = toMs(status.currentTime);

        const newState: PlaybackState = {
          isPlaying: status.playing ?? false,
          isLoading: !status.isLoaded,
          isBuffering: status.isBuffering ?? false,
          currentTime: currentTimeMs,
          duration: durationMs,
          volume: player.volume ?? volume,
          rate: status.playbackRate ?? rate,
          loop: status.loop ?? loop,
        };

        setPlaybackState(newState);
        emitPlaybackState(newState);

        if (durationMs > 0) {
          const newProgress = Math.min(1, currentTimeMs / durationMs);
          setProgress(newProgress);

          const progressData: ProgressData = {
            currentTime: currentTimeMs,
            duration: durationMs,
            progress: newProgress,
            position: newProgress,
            buffered: 0,
          };
          emitProgress(progressData);
        }

        // `onLoad` fires once, on the first status that carries a real duration
        if (!hasLoadedRef.current && status.isLoaded) {
          hasLoadedRef.current = true;
          const loadData: AudioLoadData = {
            duration: durationMs,
            sampleRate: 44100, // expo-audio does not expose these
            channels: 2,
            peaks: peaksRef.current,
          };
          emitLoad(loadData);
        }

        if (status.didJustFinish && !player.loop) {
          emitEnd();
        }
      });

      if (!providedPeaks && generateWaveform) {
        setGeneratedPeaks(placeholderPeaks(samples));
      }

      if (autoPlay) {
        player.play();
      }
    } catch (err) {
      const audioError: AudioError = {
        code: 'LOAD_ERROR',
        message: err instanceof Error ? err.message : 'Failed to load audio',
        details: err,
      };
      setError(audioError.message);
      emitError(audioError);
    } finally {
      setPlaybackState(prev => ({ ...prev, isLoading: false }));
    }
  }, [autoPlay, loop, volume, rate, providedPeaks, generateWaveform, samples, releasePlayer, emitError, emitPlaybackState, emitProgress, emitLoad, emitEnd]);

  // Playback controls
  const play = useCallback(async () => {
    const player = audioRef.current;
    if (!player) return;

    try {
      // Restart instead of sitting at the end of a finished clip
      if (player.duration > 0 && player.currentTime >= player.duration - 0.05) {
        await player.seekTo(0);
      }
      player.play();
      await sound?.playSound('button-press'); // UI feedback
    } catch (err) {
      devError('Play error:', err);
    }
  }, [sound]);

  const pause = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      await sound?.playSound('button-press'); // UI feedback
    } catch (err) {
      devError('Pause error:', err);
    }
  }, [sound]);

  const togglePlayback = useCallback(() => {
    if (playbackStateRef.current.isPlaying) void pause();
    else void play();
  }, [play, pause]);

  const stop = useCallback(async () => {
    const player = audioRef.current;
    if (!player) return;

    try {
      player.pause();
      await player.seekTo(0);
      setProgress(0);
      await sound?.playSound('button-press'); // UI feedback
    } catch (err) {
      devError('Stop error:', err);
    }
  }, [sound]);

  /** `time` is in milliseconds, matching `PlaybackState`. */
  const seek = useCallback(async (time: number) => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.seekTo(Math.max(0, time) / 1000);
    } catch (err) {
      devError('Seek error:', err);
    }
  }, []);

  const skipBy = useCallback((deltaMs: number) => {
    const { currentTime, duration } = playbackStateRef.current;
    const target = Math.max(0, duration > 0 ? Math.min(duration, currentTime + deltaMs) : currentTime + deltaMs);
    if (duration > 0) setProgress(target / duration);
    void seek(target);
  }, [seek]);

  const setVolumeLevel = useCallback(async (newVolume: number) => {
    if (!audioRef.current) return;

    try {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
      setPlaybackState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, newVolume)) }));
    } catch (err) {
      devError('Volume error:', err);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const player = audioRef.current;
    const next = !muted;
    setMuted(next);
    if (!player) return;
    try {
      if ('muted' in player) player.muted = next;
      else player.volume = next ? 0 : playbackStateRef.current.volume || 1;
    } catch (err) {
      devError('Mute error:', err);
    }
  }, [muted]);

  const setPlaybackRate = useCallback(async (newRate: number) => {
    if (!audioRef.current) return;

    try {
      const clamped = Math.max(0.5, Math.min(2.0, newRate));
      audioRef.current.setPlaybackRate(clamped);
      setPlaybackState(prev => ({ ...prev, rate: clamped }));
    } catch (err) {
      devError('Rate error:', err);
    }
  }, []);

  const cycleRate = useCallback(() => {
    const index = PLAYBACK_RATES.indexOf(playbackStateRef.current.rate);
    void setPlaybackRate(PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length]);
  }, [setPlaybackRate]);

  // Waveform interaction
  const handleWaveformSeek = useCallback(async (position: number) => {
    const { duration } = playbackStateRef.current;
    if (duration > 0) {
      setProgress(position);
      await seek(position * duration);
      onSeek?.(position);
    }
  }, [seek, onSeek]);

  const handleSelectionChange = useCallback((range: [number, number]) => {
    const { duration } = playbackStateRef.current;
    if (duration > 0) setSelectionMs({ start: range[0] * duration, end: range[1] * duration });
    onSelectionChange?.(range);
  }, [onSelectionChange]);

  const waveformSelection = useMemo<[number, number] | undefined>(() => {
    if (selectionProp) return selectionProp;
    const { duration } = playbackState;
    if (!selectionMs || duration <= 0) return undefined;
    const clamp = (v: number) => Math.max(0, Math.min(1, v / duration));
    return [clamp(selectionMs.start), clamp(selectionMs.end)];
  }, [selectionProp, selectionMs, playbackState]);

  // Keyboard shortcuts, attached to the focused seek slider (web).
  const shortcuts = useMemo(() => ({ ...DEFAULT_SHORTCUTS, ...keyboardShortcuts }), [keyboardShortcuts]);
  const handleShortcut = useCallback((event: WebKeyboardEvent) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    const { key } = event;
    const volumeNow = playbackStateRef.current.volume;
    if (matchesKey(key, shortcuts.playPause) || (shortcuts.playPause === ' ' && key === 'Spacebar')) togglePlayback();
    else if (matchesKey(key, shortcuts.skipForward)) skipBy(SKIP_INTERVAL_MS);
    else if (matchesKey(key, shortcuts.skipBackward)) skipBy(-SKIP_INTERVAL_MS);
    else if (matchesKey(key, shortcuts.mute)) toggleMute();
    else if (matchesKey(key, shortcuts.volumeUp)) void setVolumeLevel(volumeNow + 0.1);
    else if (matchesKey(key, shortcuts.volumeDown)) void setVolumeLevel(volumeNow - 0.1);
    else return;
    event.preventDefault();
  }, [shortcuts, togglePlayback, skipBy, toggleMute, setVolumeLevel]);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    play,
    pause,
    stop,
    seek,
    setVolume: setVolumeLevel,
    setRate: setPlaybackRate,
    setLoop: async (newLoop: boolean) => {
      if (audioRef.current) {
        audioRef.current.loop = newLoop;
      }
    },
    getCurrentTime: async () => toMs(audioRef.current?.currentTime),
    getDuration: async () => toMs(audioRef.current?.duration),
    getPlaybackState: () => playbackStateRef.current,
    load: loadAudio,
    unload: async () => {
      releasePlayer();
      hasLoadedRef.current = false;
    },
    getWaveformPeaks: () => peaksRef.current,
    setSelection: (start: number, end: number) => {
      setSelectionMs({ start: Math.max(0, Math.min(start, end)), end: Math.max(start, end) });
    },
    clearSelection: () => setSelectionMs(null),
    getSelection: () => selectionMs,
  }), [play, pause, stop, seek, setVolumeLevel, setPlaybackRate, loadAudio, releasePlayer, selectionMs]);

  // Load audio on mount or source change. `loadAudio` is called through a ref so that
  // prop or callback changes do not tear down and reload a playing clip.
  const loadAudioRef = useRef(loadAudio);
  loadAudioRef.current = loadAudio;

  useEffect(() => {
    if (source) {
      void loadAudioRef.current(source);
    }
    return releasePlayer;
  }, [source, releasePlayer]);

  // Keep a loaded player in sync with prop changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);

  useEffect(() => {
    audioRef.current?.setPlaybackRate?.(rate);
  }, [rate]);

  const { isPlaying, isLoading, currentTime, duration } = playbackState;
  const withHours = timeFormat === 'hh:mm:ss';
  const elapsedText = formatClock(currentTime, withHours);
  const totalText = timeFormat === 'relative'
    ? `-${formatClock(Math.max(0, duration - currentTime), false)}`
    : formatClock(duration, withHours);
  const timeLabel = timeFormat === 'relative'
    ? `${elapsedText} elapsed, ${formatClock(Math.max(0, duration - currentTime), false)} remaining`
    : `${elapsedText} of ${totalText}`;

  const renderControls = () => {
    if (!showControls || controlsPosition === 'none') return null;

    return (
      <View style={styles.controlsRow} pointerEvents={controlsPosition === 'overlay' ? 'box-none' : 'auto'}>
        {controls.skip && (
          <Pressable
            onPress={() => skipBy(-SKIP_INTERVAL_MS)}
            style={styles.iconButton}
            disabled={isLoading}
            {...a11yProps({ role: 'button', label: 'Skip back 10 seconds', disabled: isLoading })}
          >
            <Icon name="undo" size={18} color={theme.text.secondary} />
          </Pressable>
        )}

        {controls.playPause && (
          <Pressable
            onPress={togglePlayback}
            disabled={isLoading}
            style={({ pressed }) => [styles.playButton, { opacity: pressed ? 0.8 : isLoading ? 0.5 : 1 }]}
            {...a11yProps({
              role: 'button',
              label: isLoading ? 'Loading' : isPlaying ? 'Pause' : 'Play',
              disabled: isLoading,
              busy: isLoading,
            })}
          >
            <Icon
              name={isLoading ? 'loader' : isPlaying ? 'pause' : 'play'}
              size={20}
              color={theme.text.onPrimary ?? onColor(theme, theme.colors.primary[5])}
            />
          </Pressable>
        )}

        {controls.skip && (
          <Pressable
            onPress={() => skipBy(SKIP_INTERVAL_MS)}
            style={styles.iconButton}
            disabled={isLoading}
            {...a11yProps({ role: 'button', label: 'Skip forward 10 seconds', disabled: isLoading })}
          >
            <Icon name="redo" size={18} color={theme.text.secondary} />
          </Pressable>
        )}

        {showTime && (
          <View style={styles.time} {...a11yProps({ accessible: true, label: timeLabel })}>
            <Text style={styles.timeText}>{elapsedText}</Text>
            <Text style={[styles.timeText, styles.timeSeparator]} aria-hidden>
              /
            </Text>
            <Text style={styles.timeText}>{totalText}</Text>
          </View>
        )}

        {controls.volume && (
          <Pressable
            onPress={toggleMute}
            style={styles.iconButton}
            {...a11yProps({ role: 'button', label: muted ? 'Unmute' : 'Mute' })}
          >
            <Icon name={muted ? 'volume-off' : 'volume-up'} size={20} color={theme.text.secondary} />
          </Pressable>
        )}

        {controls.speed && (
          <Pressable
            onPress={cycleRate}
            style={styles.speedButton}
            {...a11yProps({ role: 'button', label: `Playback speed ${playbackState.rate}x`, hint: 'Changes the playback speed' })}
          >
            <Text style={styles.speedText}>{playbackState.rate}x</Text>
          </Pressable>
        )}
      </View>
    );
  };

  const renderMetadata = () => {
    if (!showMetadata || !metadata) return null;

    return (
      <View style={styles.metadata}>
        {metadata.title && (
          <Text style={styles.title} role="heading">
            {metadata.title}
          </Text>
        )}
        {metadata.artist && <Text style={styles.artist}>{metadata.artist}</Text>}
      </View>
    );
  };

  const progressLineStyle = useMemo(
    () => ({ color: theme.colors.primary[5], width: 2, opacity: 0.8 }),
    [theme.colors.primary]
  );

  const playerName = accessibilityLabel ?? (metadata?.title ? `Audio player: ${metadata.title}` : 'Audio player');

  // Render error state
  if (error) {
    return (
      <View style={[styles.error, spacingStyles, style]} testID={testID} role="alert">
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={20} color={theme.colors.error[6]} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
        {source && (
          <Pressable onPress={() => void loadAudio(source)} style={styles.retry} {...a11yProps({ role: 'button', label: 'Retry' })}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const metadataOnTop = controlsPosition !== 'bottom';

  return (
    <View
      style={[{ width: '100%' }, spacingStyles, style]}
      testID={testID}
      {...a11yProps({ role: 'group', label: playerName })}
    >
      {metadataOnTop && renderMetadata()}

      {controlsPosition === 'top' && renderControls()}

      {controls.waveform && peaks.length > 0 && (
        <View style={styles.waveform}>
          <Waveform
            peaks={peaks}
            w={w}
            h={h}
            color={color}
            progress={progress}
            interactive={interactive}
            onSeek={handleWaveformSeek}
            selection={waveformSelection}
            onSelectionChange={handleSelectionChange}
            duration={duration > 0 ? duration / 1000 : undefined}
            showProgressLine
            progressLineStyle={progressLineStyle}
            accessibilityLabel="Seek"
            accessibilityHint="Tap or drag to seek"
            {...webProps({ onKeyDown: enableKeyboardShortcuts ? handleShortcut : undefined })}
            testID={testID ? `${testID}-waveform` : undefined}
            {...waveformProps}
          />
          {controlsPosition === 'overlay' && (
            <View style={styles.overlay} pointerEvents="box-none">
              {renderControls()}
            </View>
          )}
        </View>
      )}

      {controlsPosition === 'overlay' && !(controls.waveform && peaks.length > 0) && renderControls()}

      {controlsPosition === 'bottom' && renderControls()}

      {controlsPosition === 'bottom' && renderMetadata()}
    </View>
  );
}, { displayName: 'AudioPlayer' });
