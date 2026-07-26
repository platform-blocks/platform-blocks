import { useState } from 'react';
import { Block, GradientText, Slider } from '@platform-blocks/ui';

export default function Demo() {
  const [position, setPosition] = useState(0);

  return (
    <Block>
      <GradientText
        value="Controlled Gradient"
        position={position}
        colors={['#ff76ba', '#FF0080', '#7928CA', '#4F46E5']}
        size="3xl"
      />
      <Slider
        value={position}
        onChange={setPosition}
        min={0}
        max={1}
        step={0.01}
      />
    </Block>
  );
}
