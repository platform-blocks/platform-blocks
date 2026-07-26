import { useState } from 'react';
import { Block, Row, Slider, RangeSlider, Text } from '@platform-blocks/ui';

export default function Demo() {
  const [a, setA] = useState(40);
  const [b, setB] = useState(60);
  const [c, setC] = useState(72);
  const [d, setD] = useState<[number, number]>([20, 80]);

  return (
    <Block>
      <Text weight="semibold">Value label position & styling</Text>

      <Block>
        <Text size="sm" colorVariant="muted">Default — tooltip above the thumb</Text>
        <Slider value={a} onChange={setA} valueLabelAlwaysOn />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">valueLabelPosition="bottom"</Text>
        <Slider
          value={b}
          onChange={setB}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelOffset={2}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Custom Text styling — `ff`, `weight`, `size`, `colorVariant`
        </Text>
        <Slider
          value={c}
          onChange={setC}
          valueLabelAlwaysOn
          valueLabelProps={{
            ff: 'monospace',
            weight: '700',
            size: 'md',
            colorVariant: 'primary',
          }}
          valueLabel={(v) => `${Math.round(v)}%`}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          Flat tooltip (no Card) with custom wrapper style
        </Text>
        <Slider
          value={c}
          onChange={setC}
          valueLabelAlwaysOn
          valueLabelAsCard={false}
          valueLabelStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
          valueLabelProps={{ ff: 'monospace', weight: '600', color: '#fff' }}
        />
      </Block>

      <Block>
        <Text size="sm" colorVariant="muted">
          RangeSlider — both thumbs share placement + styling
        </Text>
        <RangeSlider
          value={d}
          onChange={setD}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelProps={{ weight: '700', size: 'sm' }}
          valueLabel={(v, i) => (i === 0 ? `min ${Math.round(v)}` : `max ${Math.round(v)}`)}
        />
      </Block>

      <Block align="center" direction="row">

        <Block style={{ height: 200 }}>
            <Slider
              value={a}
              onChange={setA}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="left"
              valueLabelProps={{ weight: '700' }}
              minH={80}
            />
          </Block>
        <Block style={{ height: 200 }}>
            <Slider
              value={b}
              onChange={setB}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="right"
              valueLabelProps={{ weight: '700' }}
            />
            <Text size="xs" colorVariant="muted">right</Text>
          </Block>
      </Block>
    </Block>
  );
}
