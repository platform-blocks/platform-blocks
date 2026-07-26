import { Block, Text } from '@platform-blocks/ui';
import { AudioPlayer } from '../../AudioPlayer';

// Peaks measured from the same bundled clip the player loads.
import { MELODY_PEAKS } from '../../../Waveform/demos/data';

export default function Demo() {
  return (
    <Block gap="sm" w="100%" maxW={520}>
      <AudioPlayer
        source={require('../../../../assets/sounds/melody.mp3')}
        peaks={MELODY_PEAKS}
        h={72}
        showMetadata
        metadata={{ title: 'Arpeggio', artist: 'Demo Tones' }}
        controlsPosition="top"
        controls={{ playPause: true, volume: true, speed: true, waveform: true }}
      />
      <Text variant="small" colorVariant="muted">
        Playback runs through `expo-audio`. Pass `peaks` to draw the real waveform, then tap it to
        seek — the progress line follows playback either way.
      </Text>
    </Block>
  );
}
