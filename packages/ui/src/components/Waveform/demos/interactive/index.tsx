import { useState } from 'react';
import { Block, Text, Waveform } from '@platform-blocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  const [progress, setProgress] = useState<number>(0.2);

  return (
    <Block fullWidth>
      <Waveform
        peaks={WAVEFORM_DEMO_PEAKS}
        progress={progress}
        fullWidth
        h={72}
        interactive
        showProgressLine
        onSeek={setProgress}
        onDrag={setProgress}
        accessibilityLabel="Audio timeline"
        accessibilityHint="Drag or tap to seek"
      />

      <Text variant="small">Progress: {Math.round(progress * 100)}%</Text>
    </Block>
  );
}
