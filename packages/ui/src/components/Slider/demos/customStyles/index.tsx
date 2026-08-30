import { useState } from 'react';
import { Slider, RangeSlider, Text, Card, Block, Flex } from '@platform-blocks/react-ui-library';

export function Demo() {
  const [volume, setVolume] = useState(65);
  const [range, setRange] = useState<[number, number]>([20, 80]);

  return (
    <Block fullWidth>
      <Card>
        <Block>
          <Text size="lg" weight="semibold">Palette-driven slider</Text>
          <Text size="sm" style={{ color: '#555' }}>
            `colorScheme`, sizing overrides, and style props let the slider carry product branding.
          </Text>
          <Slider
            value={volume}
            onChange={setVolume}
            min={0}
            max={100}
            step={1}
            showTicks
            tickColor="rgba(52, 199, 89, 0.2)"
            activeTickColor="#34C759"
            color="success"
            trackSize={12}
            thumbSize={30}
            trackStyle={{ opacity: 0.25 }}
            activeTrackStyle={{
              shadowColor: '#34C759',
              shadowOpacity: 0.35,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
            }}
            thumbStyle={{ borderColor: '#1F5520', borderWidth: 3 }}
            valueLabel={(val) => `${Math.round(val)}%`}
            valueLabelAlwaysOn
            label="Success palette"
          />
          <Flex justify="space-between">
            <Text size="sm">Volume: {Math.round(volume)}%</Text>
            <Text size="sm" style={{ color: '#1F5520' }}>Styled thumb + ticks</Text>
          </Flex>
        </Block>
      </Card>

      <Card>
        <Block>
          <Text size="lg" weight="semibold">Custom range slider</Text>
          <Text size="sm" style={{ color: '#555' }}>
            RangeSlider shares the same overrides, making it easy to mix palettes per context.
          </Text>
          <RangeSlider
            value={range}
            onChange={setRange}
            min={0}
            max={120}
            step={5}
            showTicks
            color="warning"
            trackSize={10}
            thumbSize={26}
            trackStyle={{ opacity: 0.2 }}
            activeTrackStyle={{ opacity: 0.55 }}
            thumbStyle={{ borderColor: '#B45309', borderWidth: 2 }}
            tickColor="rgba(251, 191, 36, 0.25)"
            activeTickColor="#F59E0B"
            valueLabel={(val, idx) => `${idx === 0 ? 'Min' : 'Max'} ${val}`}
            valueLabelAlwaysOn
            label="Warning palette"
          />
          <Flex justify="space-between">
            <Text size="sm">Range: {range[0]} – {range[1]}</Text>
            <Text size="sm" style={{ color: '#B45309' }}>Custom palette + styles</Text>
          </Flex>
        </Block>
      </Card>
    </Block>
  );
}
