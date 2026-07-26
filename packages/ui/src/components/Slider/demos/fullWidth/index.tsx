import { useState } from 'react';
import { Slider, RangeSlider, Text, Block, Card } from '@platform-blocks/ui';

export default function Demo() {
  const [value, setValue] = useState(25);
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80]);

  return (
    <Block fullWidth>
      <Block>
        
        {/* Fixed width vs full width comparison. `fullWidth` defaults to true,
            so the fixed-width side has to opt out explicitly. */}
        <Block>
          <Text size="md" weight="medium">Fixed-width Slider (fullWidth={'{false}'})</Text>
          <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            step={1}
            fullWidth={false}
          />
          <Text size="sm" style={{ color: '#666' }}>
            Value: {value} (fixed 300px track)
          </Text>
        </Block>

        <Block>
          <Text size="md" weight="medium">Full Width Slider</Text>
          <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            step={1}
            fullWidth
          />
          <Text size="sm" style={{ color: '#666' }}>
            Value: {value} (stretches to parent width)
          </Text>
        </Block>

        {/* Range slider example */}
        <Block>
          <Text size="md" weight="medium">Full Width Range Slider</Text>
          <RangeSlider
            value={rangeValue}
            onChange={setRangeValue}
            min={0}
            max={100}
            step={1}
            fullWidth
          />
          <Text size="sm" style={{ color: '#666' }}>
            Range: {rangeValue[0]} - {rangeValue[1]}
          </Text>
        </Block>

        {/* In a constrained container */}
        <Block>
          <Text size="md" weight="medium">Full Width in Constrained Container</Text>
          <Card variant="outline" padding="md" style={{ width: '60%' }}>
            <Block>
              <Text size="sm">60% width container</Text>
              <Slider
                value={value}
                onChange={setValue}
                min={0}
                max={100}
                step={1}
                fullWidth
              />
            </Block>
          </Card>
        </Block>

        {/* Different sizes */}
        <Block>
          <Text size="md" weight="medium">Full Width with Different Sizes</Text>
          <Block>
            <Block>
              <Text size="sm">Small (sm)</Text>
              <Slider
                value={value}
                onChange={setValue}
                min={0}
                max={100}
                step={1}
                size="sm"
                fullWidth
              />
            </Block>
            <Block>
              <Text size="sm">Medium (md) - default</Text>
              <Slider
                value={value}
                onChange={setValue}
                min={0}
                max={100}
                step={1}
                size="md"
                fullWidth
              />
            </Block>
            <Block>
              <Text size="sm">Large (lg)</Text>
              <Slider
                value={value}
                onChange={setValue}
                min={0}
                max={100}
                step={1}
                size="lg"
                fullWidth
              />
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
}