import { Block, Slider, RangeSlider, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small" c="secondary">Bottom</Text>
        <Slider
          accessibilityLabel="Value label below"
          defaultValue={60}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelOffset={2}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Custom text</Text>
        <Slider
          accessibilityLabel="Custom label text"
          defaultValue={72}
          valueLabelAlwaysOn
          valueLabelProps={{
            ff: 'monospace',
            fw: '700',
            size: 'md',
            c: 'primary',
          }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">Flat</Text>
        <Slider
          accessibilityLabel="Flat value label"
          defaultValue={72}
          valueLabelAlwaysOn
          valueLabelAsCard={false}
          valueLabelStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
          valueLabelProps={{ ff: 'monospace', fw: '600', c: '#fff' }}
        />
      </Block>

      <Block>
        <Text variant="small" c="secondary">RangeSlider</Text>
        <RangeSlider
          accessibilityLabel="Range with labels below"
          defaultValue={[20, 80]}
          valueLabelAlwaysOn
          valueLabelPosition="bottom"
          valueLabelProps={{ fw: '700', size: 'sm' }}
          valueLabel={(v, i) => (i === 0 ? `min ${Math.round(v)}` : `max ${Math.round(v)}`)}
        />
      </Block>

      <Block direction="row" justify="center" gap="xl">
        <Block align="center">
          <Text variant="small" c="secondary">Left</Text>
          <Block style={{ height: 200 }}>
            <Slider
              accessibilityLabel="Vertical, label left"
              defaultValue={40}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="left"
              valueLabelProps={{ fw: '700' }}
            />
          </Block>
        </Block>
        <Block align="center">
          <Text variant="small" c="secondary">Right</Text>
          <Block style={{ height: 200 }}>
            <Slider
              accessibilityLabel="Vertical, label right"
              defaultValue={60}
              orientation="vertical"
              valueLabelAlwaysOn
              valueLabelPosition="right"
              valueLabelProps={{ fw: '700' }}
            />
          </Block>
        </Block>
      </Block>
    </Block>
  );
}
