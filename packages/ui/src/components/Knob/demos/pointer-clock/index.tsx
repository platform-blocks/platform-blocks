import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Block, Knob, Text, useTheme } from '@platform-blocks/ui';

const SIZE = 240;
const CENTER = SIZE / 2;
const MINUTES_PER_TURN = 12 * 60;

const HOUR_VALUES = Array.from({ length: 12 }, (_, index) => index * 60);
const HOUR_LABELS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
// 60 minute marks around the dial; hour positions are drawn by the layer above.
const MINUTE_VALUES = Array.from({ length: 60 }, (_, index) => index * 12).filter(
  (value) => value % 60 !== 0
);

const formatTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  return `${hour === 0 ? 12 : hour}:${(minutes % 60).toString().padStart(2, '0')}`;
};

/** Hand pivoting on the dial center: the wrapper is twice the hand length, so it rotates around it. */
const Hand = ({
  angle,
  length,
  width,
  color,
  tail = 0,
}: {
  angle: number;
  length: number;
  width: number;
  color: string;
  tail?: number;
}) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      left: CENTER - width / 2,
      top: CENTER - length,
      width,
      height: length * 2,
      transform: [{ rotate: `${angle}deg` }],
    }}
  >
    <View
      style={{
        width,
        height: length + tail,
        borderRadius: width / 2,
        backgroundColor: color,
      }}
    />
  </View>
);

export default function Demo() {
  const theme = useTheme();
  const face = theme.backgrounds.surface;
  const ink = theme.text.primary;
  const accent = theme.colors.primary[6];

  // Start on a fixed time so server-rendered and client markup match, then sync on mount.
  const [time, setTime] = useState({ minutes: 10 * 60 + 10, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime({
        minutes: (now.getHours() % 12) * 60 + now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Block align="center" gap="sm">
      <View style={{ width: SIZE, height: SIZE }}>
        <Knob.Root
          min={0}
          max={MINUTES_PER_TURN}
          value={time.minutes}
          size={SIZE}
          readOnly
          withLabel={false}
          accessibilityLabel={`Clock showing ${formatTime(time.minutes)}`}
          appearance={{
            arc: { startAngle: 0, sweepAngle: 360, clampInput: true },
          }}
        >
          <Knob.Ring thickness={12} color={ink} trailColor={ink} backgroundColor={face} />
          {/* Chapter ring just inside the minute marks */}
          <Knob.Fill
            color={face}
            radiusOffset={-18}
            borderWidth={1}
            borderColor={theme.backgrounds.border}
          />
          <Knob.Progress visible={false} />
          <Knob.Thumb visible={false} />
          <Knob.TickLayer
            source="values"
            values={MINUTE_VALUES}
            shape="line"
            length={6}
            width={1.5}
            position="inner"
            color={theme.text.muted}
            inactiveColor={theme.text.muted}
          />
          <Knob.TickLayer
            source="values"
            values={HOUR_VALUES}
            shape="line"
            length={12}
            width={3}
            position="inner"
            color={ink}
            inactiveColor={ink}
            label={{
              show: true,
              formatter: (_, index) => HOUR_LABELS[index],
              position: 'inner',
              offset: -26,
              style: { color: ink, fontSize: 15, fontWeight: '600' },
            }}
          />
          {/* Hour hand — the knob value is minutes past 12, so it advances gradually. */}
          <Knob.Pointer visible length={58} width={6} color={ink} counterweight={{ size: 12, color: ink }} />
        </Knob.Root>

        <Hand angle={((time.minutes % 60) / 60) * 360} length={88} width={4} color={ink} />
        <Hand angle={(time.seconds / 60) * 360} length={94} width={1.5} color={accent} tail={18} />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: CENTER - 4,
            top: CENTER - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: accent,
          }}
        />
      </View>

      <Text size="xl" weight="700">
        {formatTime(time.minutes)}
      </Text>
    </Block>
  );
}
