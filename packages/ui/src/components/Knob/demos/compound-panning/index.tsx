import { useMemo, useState } from 'react';

import { Block, Knob, Text } from '@platform-blocks/ui';

// The split arc reads the same on both sides of center: direction is carried by which way
// the arc grows and by the L/R label, not by a color change.
const PAN_COLOR = '#4ade80';

export default function Demo() {
  const [pan, setPan] = useState(-18);

  const readout = useMemo(() => {
    if (pan === 0) return 'Center';
    return pan > 0 ? `Right ${Math.abs(pan)}` : `Left ${Math.abs(pan)}`;
  }, [pan]);

  return (
    <Block align="center">
      <Knob.Root
        min={-100}
        max={100}
        value={pan}
        onChange={setPan}
        step={1}
        size={220}
        appearance={{
          arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
          panning: {
            pivotValue: 0,
            positiveColor: PAN_COLOR,
            negativeColor: PAN_COLOR,
          },
        }}
      >
        <Knob.Fill
          radiusOffset={-28}
          color="#0f172a"
          borderWidth={2}
          borderColor="rgba(148, 163, 184, 0.4)"
        />
        <Knob.Ring color="#0f172a" trailColor="#1f2937" />
        <Knob.Progress mode="split" thickness={14} roundedCaps />
        <Knob.Thumb  color="#f8fafc" strokeWidth={3} strokeColor="#0f172a" />
        <Knob.ValueLabel
          position="center"
          formatter={(value) => `${value > 0 ? 'R' : value < 0 ? 'L' : ''}${Math.abs(Math.round(value))}`}
          textStyle={{ fontSize: 30, fontWeight: '700', color: '#f8fafc' }}
        />
      </Knob.Root>
      <Text size="sm" colorVariant="secondary">
        Stereo balance · {readout}
      </Text>
    </Block>
  );
}
