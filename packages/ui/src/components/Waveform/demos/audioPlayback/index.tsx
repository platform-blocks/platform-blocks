import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Block, Button, Waveform } from '@platform-blocks/ui';

import { MELODY_PEAKS } from '../data';

const MELODY_SOURCE = require('../../../../assets/sounds/melody.mp3');

export function Demo() {
  const player = useAudioPlayer(MELODY_SOURCE);
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
    <Block fullWidth>
      <Waveform
        peaks={MELODY_PEAKS}
        progress={progress}
        h={96}
        fullWidth
        interactive
        onSeek={handleSeek}
        showProgressLine
        showTimeStamps
        duration={duration}
        accessibilityLabel="Arpeggio waveform"
        accessibilityHint="Tap or drag to seek within the clip"
      />

      <Button size="sm" onPress={togglePlayback}>
        {status.playing ? 'Pause' : 'Play'}
      </Button>
    </Block>
  );
}
