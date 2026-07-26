import { useState } from 'react';
import { Block, Button, Row, Text, Waveform } from '@platform-blocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

const SEEK_PRESETS: number[] = [0.25, 0.5, 0.75];

export default function Demo() {
  const [progress, setProgress] = useState<number>(0.2);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  const handleSeek = (value: number) => {
    setProgress(value);
  };

  return (
    <Block>
      <Waveform
        peaks={WAVEFORM_DEMO_PEAKS}
        progress={progress}
        fullWidth
        h={72}
        color="primary"
        interactive
        showProgressLine
        onSeek={handleSeek}
        onDragStart={() => setIsScrubbing(true)}
        onDrag={handleSeek}
        onDragEnd={(value) => {
          setIsScrubbing(false);
          handleSeek(value);
        }}
        accessibilityLabel="Audio timeline"
        accessibilityHint="Drag or tap to seek"
      />

      <Row gap="sm" wrap="wrap">
        {SEEK_PRESETS.map((value) => (
          <Button key={value} variant="outline" onPress={() => handleSeek(value)}>
            Jump to {Math.round(value * 100)}%
          </Button>
        ))}
      </Row>

      <Text variant="small">
        {isScrubbing ? 'Scrubbing…' : 'Progress:'} {Math.round(progress * 100)}%
      </Text>
    </Block>
  );
}


