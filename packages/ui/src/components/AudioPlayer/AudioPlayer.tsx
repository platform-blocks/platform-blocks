import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { Waveform } from '../Waveform/Waveform';
import { useSound } from '../../core/sound/context';
import { useTheme } from '../../core/theme';
import { DESIGN_TOKENS } from '../../core';
import { Icon } from '../Icon';
import { resolveOptionalModule } from '../../utils/optionalModule';
import type { 
  AudioPlayerProps, 
  AudioPlayerRef, 
  PlaybackState, 
  ProgressData,
  AudioLoadData,
  AudioError 
} from './types';

const ExpoAudio = resolveOptionalModule<any>('expo-audio', {
  devWarning: 'expo-audio not found; AudioPlayer renders its controls but cannot play audio',
});

/** How often expo-audio reports playback status, in ms. Tight enough for a moving waveform. */
const STATUS_UPDATE_INTERVAL = 100;

/**
 * `PlaybackState`, `ProgressData` and the ref methods are in milliseconds, while
 * expo-audio works in seconds — convert at the boundary rather than in the UI.
 */
const toMs = (seconds: number | undefined) => Math.round((seconds ?? 0) * 1000);

export const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({
  source,
  peaks: providedPeaks,
  autoPlay = false,
  loop = false,
  volume = 1.0,
  rate = 1.0,
  showControls = true,
  controls = {
    playPause: true,
    skip: true,
    volume: true,
    speed: false,
    download: false,
    share: false,
    waveform: true,
  },
  controlsPosition = 'bottom',
  variant = 'full',
  colorScheme = 'auto',
  generateWaveform = true,
  waveformOptions = {
    samples: 200,
    precision: 4,
    channel: 'mix',
  },
  showTime = true,
  timeFormat = 'mm:ss',
  showMetadata = false,
  metadata,
  showSpectrum = false,
  spectrumOptions,
  enableKeyboardShortcuts = true,
  enableGestures = true,
  onLoad,
  onPlaybackStateChange,
  onProgress,
  onEnd,
  onError,
  onBuffer,
  // Waveform props
  w = 300,
  h = 60,
  color = 'primary',
  interactive = true,
  onSeek,
  style,
  ...waveformProps
}, ref) => {
  const theme = useTheme();
  const { playSound } = useSound();
  
  // Refs
  const audioRef = useRef<any>(null);
  const statusSubscriptionRef = useRef<{ remove: () => void } | null>(null);
  const hasLoadedRef = useRef<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformRef = useRef<any>(null);
  
  // State
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isLoading: false,
    isBuffering: false,
    currentTime: 0,
    duration: 0,
    volume: volume,
    rate: rate,
    loop: loop,
  });
  
  const [peaks, setPeaks] = useState<number[]>(providedPeaks || []);
  // Mirrors `peaks` for the status listener, which must not close over stale state.
  const peaksRef = useRef<number[]>(providedPeaks || []);
  peaksRef.current = peaks;
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Audio loading and initialization
  const loadAudio = useCallback(async (audioSource: typeof source) => {
    if (!audioSource) {
      console.warn('AudioPlayer: no audio source provided');
      return;
    }

    if (!ExpoAudio?.createAudioPlayer) {
      const audioError: AudioError = {
        code: 'MODULE_MISSING',
        message: 'expo-audio is required for playback. Install it with `npx expo install expo-audio`.',
        details: null,
      };
      setError(audioError.message);
      onError?.(audioError);
      return;
    }

    try {
      setPlaybackState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      hasLoadedRef.current = false;

      // Release the previous player and its listener before replacing them
      statusSubscriptionRef.current?.remove();
      statusSubscriptionRef.current = null;
      audioRef.current?.remove?.();

      // expo-audio accepts a URI string, a `require()`d asset, or a source object directly
      const player = ExpoAudio.createAudioPlayer(audioSource, {
        updateInterval: STATUS_UPDATE_INTERVAL,
      });

      audioRef.current = player;
      player.loop = loop;
      player.volume = volume;
      if (rate !== 1) {
        player.setPlaybackRate(rate);
      }

      // Status updates drive both the exposed state and the waveform progress
      statusSubscriptionRef.current = player.addListener('playbackStatusUpdate', (status: any) => {
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
        onPlaybackStateChange?.(newState);

        if (durationMs > 0) {
          const newProgress = Math.min(1, currentTimeMs / durationMs);
          setProgress(newProgress);

          const progressData: ProgressData = {
            currentTime: currentTimeMs,
            duration: durationMs,
            progress: newProgress,
            position: newProgress,
            buffered: buffered,
          };
          onProgress?.(progressData);
        }

        // `onLoad` fires once, on the first status that carries a real duration
        if (!hasLoadedRef.current && status.isLoaded) {
          hasLoadedRef.current = true;
          onLoad?.({
            duration: durationMs,
            sampleRate: 44100, // expo-audio does not expose these
            channels: 2,
            peaks: peaksRef.current,
          } as AudioLoadData);
        }

        if (status.didJustFinish && !loop) {
          onEnd?.();
        }
      });

      // Generate waveform if not provided and enabled
      if (!providedPeaks && generateWaveform) {
        const generatedPeaks = await generateWaveformFromAudio(player, waveformOptions);
        setPeaks(generatedPeaks);
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
      onError?.(audioError);
    } finally {
      setPlaybackState(prev => ({ ...prev, isLoading: false }));
    }
  }, [autoPlay, loop, volume, rate, providedPeaks, generateWaveform, waveformOptions, onLoad, onPlaybackStateChange, onProgress, onEnd, onError, buffered]);

  // Placeholder peaks. expo-audio exposes PCM frames only while `setAudioSamplingEnabled`
  // is on and playback is running, so there is no way to analyze a file up front —
  // pass measured `peaks` when the shape of the waveform matters.
  const generateWaveformFromAudio = async (_player: any, options: typeof waveformOptions): Promise<number[]> => {
    const samples = options.samples || 200;
    return Array.from({ length: samples }, () => Math.random() * 0.8 + 0.1);
  };

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
      await playSound('button-press'); // UI feedback
    } catch (err) {
      console.error('Play error:', err);
    }
  }, [playSound]);

  const pause = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      await playSound('button-press'); // UI feedback
    } catch (err) {
      console.error('Pause error:', err);
    }
  }, [playSound]);

  const stop = useCallback(async () => {
    const player = audioRef.current;
    if (!player) return;

    try {
      player.pause();
      await player.seekTo(0);
      setProgress(0);
      await playSound('button-press'); // UI feedback
    } catch (err) {
      console.error('Stop error:', err);
    }
  }, [playSound]);

  /** `time` is in milliseconds, matching `PlaybackState`. */
  const seek = useCallback(async (time: number) => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.seekTo(Math.max(0, time) / 1000);
    } catch (err) {
      console.error('Seek error:', err);
    }
  }, []);

  const setVolumeLevel = useCallback(async (newVolume: number) => {
    if (!audioRef.current) return;

    try {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    } catch (err) {
      console.error('Volume error:', err);
    }
  }, []);

  const setPlaybackRate = useCallback(async (newRate: number) => {
    if (!audioRef.current) return;

    try {
      audioRef.current.setPlaybackRate(Math.max(0.5, Math.min(2.0, newRate)));
    } catch (err) {
      console.error('Rate error:', err);
    }
  }, []);

  // Waveform interaction
  const handleWaveformSeek = useCallback(async (position: number) => {
    if (playbackState.duration > 0) {
      const time = position * playbackState.duration;
      await seek(time);
      onSeek?.(position);
    }
  }, [playbackState.duration, seek, onSeek]);

  // Format time display
  const formatTime = useCallback((milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (timeFormat === 'hh:mm:ss') {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeFormat]);

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
    getPlaybackState: () => playbackState,
    load: loadAudio,
    unload: async () => {
      statusSubscriptionRef.current?.remove();
      statusSubscriptionRef.current = null;
      audioRef.current?.remove?.();
      audioRef.current = null;
      hasLoadedRef.current = false;
    },
    exportAudio: async () => {
      throw new Error('Export not implemented');
    },
    getWaveformPeaks: () => peaks,
    setSelection: () => {}, // TODO: Implement
    clearSelection: () => {}, // TODO: Implement
  }), [play, pause, stop, seek, setVolumeLevel, setPlaybackRate, playbackState, loadAudio, peaks]);

  // Load audio on mount or source change. `loadAudio` is called through a ref so that
  // prop or callback changes do not tear down and reload a playing clip.
  const loadAudioRef = useRef(loadAudio);
  loadAudioRef.current = loadAudio;

  useEffect(() => {
    if (source) {
      loadAudioRef.current(source);
    }

    return () => {
      statusSubscriptionRef.current?.remove();
      statusSubscriptionRef.current = null;
      audioRef.current?.remove?.();
      audioRef.current = null;
    };
  }, [source]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Render controls
  const renderControls = () => {
    if (!showControls || controlsPosition === 'none') return null;

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: DESIGN_TOKENS.spacing.sm,
        paddingVertical: DESIGN_TOKENS.spacing.sm,
      }}>
        {/* Play/Pause Button */}
        {controls.playPause && (
          <Pressable
            onPress={playbackState.isPlaying ? pause : play}
            disabled={playbackState.isLoading}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.primary[5],
              justifyContent: 'center',
              alignItems: 'center',
              opacity: pressed ? 0.8 : playbackState.isLoading ? 0.5 : 1,
            })}
            accessibilityLabel={playbackState.isPlaying ? 'Pause' : 'Play'}
          >
            <Icon
              name={playbackState.isLoading ? 'loader' : playbackState.isPlaying ? 'pause' : 'play'}
              size={20}
              color="white"
            />
          </Pressable>
        )}

        {/* Time Display */}
        {showTime && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ 
              color: theme.colors.gray[7], 
              fontSize: DESIGN_TOKENS.typography.fontSize.sm,
              fontFamily: 'monospace',
            }}>
              {formatTime(playbackState.currentTime)}
            </Text>
            <Text style={{ color: theme.colors.gray[5] }}>/</Text>
            <Text style={{ 
              color: theme.colors.gray[6], 
              fontSize: DESIGN_TOKENS.typography.fontSize.sm,
              fontFamily: 'monospace',
            }}>
              {formatTime(playbackState.duration)}
            </Text>
          </View>
        )}

        {/* Volume Control */}
        {controls.volume && (
          <Pressable
            onPress={() => setVolumeLevel(playbackState.volume > 0 ? 0 : 1)}
            style={{ padding: 8 }}
            accessibilityLabel={playbackState.volume > 0 ? 'Mute' : 'Unmute'}
          >
            <Icon
              name={playbackState.volume > 0 ? 'volume-up' : 'volume-off'}
              size={20}
              color={theme.colors.gray[6]}
            />
          </Pressable>
        )}

        {/* Speed Control */}
        {controls.speed && (
          <Pressable
            onPress={() => {
              const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
              const currentIndex = rates.indexOf(playbackState.rate);
              const nextRate = rates[(currentIndex + 1) % rates.length];
              setPlaybackRate(nextRate);
            }}
            style={{ 
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              backgroundColor: theme.colors.gray[2],
            }}
            accessibilityLabel={`Playback speed: ${playbackState.rate}x`}
          >
            <Text style={{ 
              color: theme.colors.gray[8], 
              fontSize: DESIGN_TOKENS.typography.fontSize.xs,
              fontWeight: '600',
            }}>
              {playbackState.rate}x
            </Text>
          </Pressable>
        )}
      </View>
    );
  };

  // Render metadata
  const renderMetadata = () => {
    if (!showMetadata || !metadata) return null;

    return (
      <View style={{
        paddingVertical: DESIGN_TOKENS.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.gray[2],
        marginBottom: DESIGN_TOKENS.spacing.sm,
      }}>
        {metadata.title && (
          <Text style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.md,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
            color: theme.colors.gray[9],
            marginBottom: 2,
          }}>
            {metadata.title}
          </Text>
        )}
        {metadata.artist && (
          <Text style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.sm,
            color: theme.colors.gray[6],
          }}>
            {metadata.artist}
          </Text>
        )}
      </View>
    );
  };

  // Render error state
  if (error) {
    return (
      <View style={[{
        padding: DESIGN_TOKENS.spacing.md,
        backgroundColor: theme.colors.error[1],
        borderRadius: DESIGN_TOKENS.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.error[3],
      }, style]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="alert-circle" size={20} color={theme.colors.error[6]} />
          <Text style={{ color: theme.colors.error[8], flex: 1 }}>
            {error}
          </Text>
        </View>
        {source && (
          <Pressable
            onPress={() => loadAudio(source)}
            style={{
              marginTop: DESIGN_TOKENS.spacing.sm,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: theme.colors.error[6],
              borderRadius: DESIGN_TOKENS.radius.sm,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: 'white', fontSize: DESIGN_TOKENS.typography.fontSize.sm }}>
              Retry
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={[{ width: '100%' }, style]}>
      {/* Metadata */}
      {controlsPosition === 'top' && renderMetadata()}
      
      {/* Controls (Top) */}
      {controlsPosition === 'top' && renderControls()}

      {/* Waveform */}
      {controls.waveform && peaks.length > 0 && (
        <View style={{ marginVertical: DESIGN_TOKENS.spacing.sm }}>
          <Waveform
            peaks={peaks}
            w={w}
            h={h}
            color={color}
            progress={progress}
            interactive={interactive}
            onSeek={handleWaveformSeek}
            showProgressLine={true}
            progressLineStyle={{
              color: theme.colors.primary[5],
              width: 2,
              opacity: 0.8,
            }}
            accessibilityLabel="Audio waveform"
            accessibilityHint="Tap to seek to a specific position"
            {...waveformProps}
          />
        </View>
      )}

      {/* Controls (Bottom) */}
      {controlsPosition === 'bottom' && renderControls()}
      
      {/* Metadata */}
      {controlsPosition === 'bottom' && renderMetadata()}
    </View>
  );
});

AudioPlayer.displayName = 'AudioPlayer';