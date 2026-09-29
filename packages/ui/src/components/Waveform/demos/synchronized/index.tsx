import { useState } from 'react';
import { Block, Text, Waveform } from '@platform-blocks/ui';

import { TRACK_TWO_PEAKS, WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  const [progress, setProgress] = useState<number>(0.35);

  return (
    <Block fullWidth>
      <Block>
        <Text variant="small">Narration track</Text>
        <Waveform
          peaks={WAVEFORM_DEMO_PEAKS}
          progress={progress}
          h={80}
          fullWidth
          interactive
          onSeek={setProgress}
        />
      </Block>

      <Block>
        <Text variant="small">Background score</Text>
        <Waveform
          peaks={TRACK_TWO_PEAKS}
          progress={progress}
          h={80}
          fullWidth
          color="secondary"
          interactive
          onSeek={setProgress}
        />
      </Block>
    </Block>
  );
}
