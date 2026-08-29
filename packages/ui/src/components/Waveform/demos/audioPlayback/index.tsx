import { useState } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Block, Button, Row, Text, Waveform } from '@platform-blocks/ui';

import { CHIME_PEAKS, MELODY_PEAKS, RAIN_PEAKS } from '../data';

const TRACKS = [
  {
    id: 'melody',
    label: 'Arpeggio',
    peaks: MELODY_PEAKS,
    source: require('../../../../assets/sounds/melody.mp3'),
  },
  {
    id: 'chime',
    label: 'Chime',
    peaks: CHIME_PEAKS,
    source: require('../../../../assets/sounds/chime.mp3'),
  },
  {
    id: 'rain',
    label: 'Rainfall',
    peaks: RAIN_PEAKS,
    source: require('../../../../assets/sounds/rain.mp3'),
  },
];

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

export function Demo() {
  const [index, setIndex] = useState(0);
  const track = TRACKS[index];

  // expo-audio rebuilds the player whenever the source changes, so selecting a
  // track loads that clip.
  const player = useAudioPlayer(track.source);
  const status = useAudioPlayerStatus(player);

  const duration = status.duration || 0;
  const progress = duration > 0 ? Math.min(1, status.currentTime / duration) : 0;

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // Replay from the top instead of sitting at the end of a finished clip.
    if (status.didJustFinish || (duration > 0 && status.currentTime >= duration - 0.05)) {
      player.seekTo(0);
    }
    player.play();
  };

  const handleSeek = (position: number) => {
    if (duration > 0) {
      player.seekTo(position * duration);
    }
  };

  return (
    <Block gap="sm">
      <Row gap="xs" wrap="wrap">
        {TRACKS.map((item, itemIndex) => (
          <Button
            key={item.id}
            size="sm"
            variant={itemIndex === index ? 'filled' : 'outline'}
            onPress={() => setIndex(itemIndex)}
          >
            {item.label}
          </Button>
        ))}
      </Row>

      <Waveform
        peaks={track.peaks}
        progress={progress}
        h={96}
        fullWidth
        variant="rounded"
        color="primary"
        interactive
        onSeek={handleSeek}
        showProgressLine
        showTimeStamps
        duration={duration}
        accessibilityLabel={`${track.label} waveform`}
        accessibilityHint="Tap or drag to seek within the clip"
      />

      <Row gap="sm" align="center" wrap="wrap">
        <Button size="sm" onPress={togglePlayback}>
          {status.playing ? 'Pause' : 'Play'}
        </Button>
        <Text variant="small" color="muted">
          {formatTime(status.currentTime)} / {formatTime(duration)}
        </Text>
      </Row>
    </Block>
  );
}
