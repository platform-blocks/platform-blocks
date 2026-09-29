import React, { useCallback, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { ViewStyle, StyleProp } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { useLayer } from '../../core/overlay/useLayer';
import { isNative, isWeb } from '../../core/platform';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveFontSize, resolveRadius } from '../../core/theme/tokens';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { MediaSlider } from './MediaSlider';
import { formatTime } from './utils';
import type { VideoControls as VideoControlsConfig, VideoState, VideoPlaybackRate } from './types';

export interface VideoControlsProps {
  config: VideoControlsConfig;
  state: VideoState;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: VideoPlaybackRate) => void;
  onToggleFullscreen: () => void;
  onScrubbingChange?: (isScrubbing: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

const PLAYBACK_RATES: VideoPlaybackRate[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Media chrome: white on a translucent black scrim reads over any frame, in
// either color scheme, so these colors are deliberately not theme roles.
const CHROME_TEXT = '#FFFFFF';
const CHROME_TRACK = 'rgba(255, 255, 255, 0.3)';

/** ≥44pt touch targets on native; 32px on web (≥24 required). */
const TARGET = isNative ? 44 : 32;

const styles = StyleSheet.create({
  bottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    bottom: 0,
    end: 0,
    paddingHorizontal: 4,
    position: 'absolute',
    start: 0,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    minHeight: TARGET,
    minWidth: TARGET,
    padding: 6,
  },
  group: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  loading: {
    alignItems: 'center',
    bottom: 0,
    end: 0,
    justifyContent: 'center',
    position: 'absolute',
    start: 0,
    top: 0,
  },
  playPauseButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 4,
    minHeight: TARGET,
    minWidth: TARGET,
    padding: 8,
  },
  progress: {
    marginHorizontal: 8,
  },
  rateMenu: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    bottom: TARGET + 6,
    end: 0,
    minWidth: 80,
    padding: 4,
    position: 'absolute',
  },
  rateMenuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isNative ? 44 : 28,
    paddingHorizontal: 8,
  },
  relative: {
    position: 'relative',
  },
  time: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 8,
  },
  volumeSlider: {
    width: 80,
  },
});

/**
 * Transport controls drawn over the video: seek bar (`useAdjustable` slider),
 * play/pause, time, speed menu, mute, volume (web) and fullscreen — every
 * control labelled, icons decorative.
 */
export function VideoControls({
  config,
  state,
  onPlay,
  onPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
  onScrubbingChange,
  style,
}: VideoControlsProps) {
  const theme = useTheme();
  const [showRateMenu, setShowRateMenu] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubbingValue, setScrubbingValue] = useState(0);
  const rateMenuRef = useRef<View>(null);
  const rateTriggerRef = useRef<View>(null);

  const { duration } = state;
  const progress = isScrubbing ? scrubbingValue : duration > 0 ? state.currentTime / duration : 0;
  // Show the scrub position while dragging, otherwise the playhead.
  const displayTime = isScrubbing ? scrubbingValue * duration : state.currentTime;
  const timeLabel = `${formatTime(displayTime)} of ${formatTime(duration)}`;

  const handleScrubStart = useCallback(() => {
    setIsScrubbing(true);
    onScrubbingChange?.(true);
  }, [onScrubbingChange]);

  const handleScrubEnd = useCallback(
    (value: number) => {
      onSeek(value * duration);
      setIsScrubbing(false);
      onScrubbingChange?.(false);
    },
    [duration, onSeek, onScrubbingChange]
  );

  const closeRateMenu = useCallback(() => setShowRateMenu(false), []);
  useLayer({
    active: showRateMenu,
    onDismiss: closeRateMenu,
    closeOnOutsidePress: true,
    containerRef: rateMenuRef,
    outsidePressIgnoreRefs: [rateTriggerRef],
  });

  const activeRateIndex = Math.max(0, PLAYBACK_RATES.indexOf(state.playbackRate));
  const { getItemProps } = useRovingFocus({
    count: PLAYBACK_RATES.length,
    orientation: 'vertical',
    defaultActiveIndex: activeRateIndex,
  });

  const muted = state.muted || state.volume === 0;
  const chromeText = { color: CHROME_TEXT, fontSize: resolveFontSize(theme, 'sm') };

  return (
    <View style={[styles.container, style]}>
      {config.progress && (
        <MediaSlider
          style={styles.progress}
          value={progress}
          onChange={setScrubbingValue}
          onChangeStart={handleScrubStart}
          onChangeEnd={handleScrubEnd}
          label="Seek"
          valueText={timeLabel}
          step={duration > 0 ? Math.min(1, 5 / duration) : 0.05}
          disabled={duration <= 0}
          trackColor={CHROME_TRACK}
          fillColor={theme.colors.primary[5]}
          thumbColor={CHROME_TEXT}
        />
      )}

      <View style={styles.bottomRow}>
        <View style={styles.group}>
          {(config.play || config.pause) && (
            <Pressable
              style={styles.playPauseButton}
              onPress={state.playing ? onPause : onPlay}
              {...a11yProps({ role: 'button', label: state.playing ? 'Pause' : 'Play' })}
            >
              <Icon name={state.playing ? 'pause' : 'play'} size={24} color={CHROME_TEXT} />
            </Pressable>
          )}

          {config.time && (
            <View style={styles.time} {...a11yProps({ accessible: true, label: timeLabel })}>
              <Text style={[chromeText, { fontFamily: theme.fontFamilyMono }]}>
                {formatTime(displayTime)} / {formatTime(duration)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.group}>
          {config.playbackRate && (
            <View style={styles.relative}>
              <Pressable
                ref={rateTriggerRef}
                style={styles.controlButton}
                onPress={() => setShowRateMenu((open) => !open)}
                {...a11yProps({
                  role: 'button',
                  label: `Playback speed ${state.playbackRate}x`,
                  hasPopup: 'menu',
                  expanded: showRateMenu,
                })}
              >
                <Text style={chromeText}>{state.playbackRate}x</Text>
              </Pressable>

              {showRateMenu && (
                <View
                  ref={rateMenuRef}
                  style={[styles.rateMenu, { borderRadius: resolveRadius(theme, 'sm') }]}
                  {...a11yProps({ role: 'menu', label: 'Playback speed' })}
                >
                  {PLAYBACK_RATES.map((rate, index) => {
                    const selected = state.playbackRate === rate;
                    return (
                      <Pressable
                        key={rate}
                        style={[
                          styles.rateMenuItem,
                          { borderRadius: resolveRadius(theme, 'xs') },
                          selected && { backgroundColor: theme.colors.primary[5] },
                        ]}
                        onPress={() => {
                          onPlaybackRateChange(rate);
                          setShowRateMenu(false);
                        }}
                        {...getItemProps(index)}
                        {...a11yProps({ role: 'menuitemradio', label: `${rate}x`, checked: selected })}
                      >
                        <Text style={chromeText}>{rate}x</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {config.volume && (
            <Pressable
              style={styles.controlButton}
              onPress={onToggleMute}
              {...a11yProps({ role: 'button', label: muted ? 'Unmute' : 'Mute' })}
            >
              <Icon name={muted ? 'volume-off' : 'volume-up'} size={20} color={CHROME_TEXT} />
            </Pressable>
          )}

          {/* Native devices have hardware volume; the slider is web-only. */}
          {config.volume && isWeb && (
            <MediaSlider
              style={styles.volumeSlider}
              value={muted ? 0 : state.volume}
              onChange={onVolumeChange}
              label="Volume"
              valueText={`${Math.round((muted ? 0 : state.volume) * 100)}%`}
              trackColor={CHROME_TRACK}
              fillColor={CHROME_TEXT}
              thumbColor={CHROME_TEXT}
            />
          )}

          {config.fullscreen && (
            <Pressable
              style={styles.controlButton}
              onPress={onToggleFullscreen}
              {...a11yProps({ role: 'button', label: state.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen' })}
            >
              <Icon name={state.fullscreen ? 'compress' : 'expand'} size={20} color={CHROME_TEXT} />
            </Pressable>
          )}
        </View>
      </View>

      {(state.loading || state.buffering) && (
        <View
          style={styles.loading}
          pointerEvents="none"
          {...a11yProps({ role: 'progressbar', label: state.loading ? 'Loading video' : 'Buffering', busy: true, accessible: true })}
        >
          <Icon name="loading" size={24} color={CHROME_TEXT} />
        </View>
      )}
    </View>
  );
}
