import { useState } from 'react';
import { Block, Slider, Waveform } from '@platform-blocks/react-ui-library';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  const [progress, setProgress] = useState<number>(0.3);

  return (
    <Block fullWidth>
      <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={progress} h={64} fullWidth />
      <Slider
        value={Math.round(progress * 100)}
        onChange={(percent) => setProgress(percent / 100)}
        min={0}
        max={100}
        step={1}
        valueLabel={(percent) => `${percent}%`}
      />
    </Block>
  );
}
