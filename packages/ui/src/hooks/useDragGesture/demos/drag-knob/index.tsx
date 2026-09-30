import { useState } from 'react';
import { Block, Text, useDragGesture } from '@plocks/ui';
import type { DragPoint } from '@plocks/ui';

const KNOB = 28;
// Children of the surface let the press through, so it always lands on the surface itself.
const PASS_THROUGH = { pointerEvents: 'none' } as const;

export function Demo() {
  const [ratio, setRatio] = useState(0.5);
  const [trackWidth, setTrackWidth] = useState(0);

  const follow = (point: DragPoint) => {
    const travel = point.width - KNOB;
    if (travel <= 0) return;
    setRatio(Math.min(1, Math.max(0, (point.x - KNOB / 2) / travel)));
  };

  const drag = useDragGesture({
    axis: 'x',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onStart: follow,
    onMove: follow,
  });

  return (
    <Block fullWidth maw={360}>
      <Block
        ref={drag.ref}
        onLayout={(event) => {
          drag.onLayout(event);
          setTrackWidth(event.nativeEvent.layout.width);
        }}
        style={drag.surfaceStyle}
        {...drag.panHandlers}
        h={KNOB}
        justify="center"
      >
        <Block h={4} radius="full" bg="border" style={PASS_THROUGH} />
        <Block
          position="absolute"
          top={0}
          left={ratio * Math.max(0, trackWidth - KNOB)}
          w={KNOB}
          h={KNOB}
          radius="full"
          bg="primary.5"
          opacity={drag.isDragging ? 0.8 : 1}
          style={PASS_THROUGH}
        />
      </Block>

      <Text ta="center" ff="monospace">
        {Math.round(ratio * 100)}%
      </Text>
    </Block>
  );
}
