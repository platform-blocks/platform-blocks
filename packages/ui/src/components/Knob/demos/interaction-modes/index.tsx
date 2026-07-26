import { useState } from 'react';
import { Block, DataList, Knob, Row, Text, useTheme } from '@platform-blocks/ui';

const MODES = [
  {
    key: 'spin',
    name: 'Spin',
    detail: 'Drag in a circular path. Move away from the thumb for finer adjustments.',
  },
  {
    key: 'vertical-slide',
    name: 'Vertical slide',
    detail: 'Grab either side of the knob and drag up or down for mixer-style throws.',
  },
  {
    key: 'horizontal-slide',
    name: 'Horizontal slide',
    detail: 'Start above or below the center, then drag left or right for sideways sweeps.',
  },
  {
    key: 'scroll',
    name: 'Scroll',
    detail: 'Hover with a mouse or trackpad and use the wheel/two-finger scroll.',
  },
] as const;

type ModeName = (typeof MODES)[number]['key'];

const MODE_LABELS: Record<ModeName, string> = MODES.reduce((acc, mode) => {
  acc[mode.key] = mode.name;
  return acc;
}, {} as Record<ModeName, string>);

export default function Demo() {
  const theme = useTheme();
  const [value, setValue] = useState(12);
  const [activeMode, setActiveMode] = useState<ModeName | null>(null);

  return (
    <Block fullWidth>
      <Row gap="xl" align="center" wrap="wrap">
        <Block align="center">
          <Text size="sm" weight="500">
            Multimodal control
          </Text>
          <Knob
            value={value}
            onChange={setValue}
            min={-100}
            max={100}
            step={1}
            size={180}
            behavior="endless"
            valueLabel={{
              position: 'center',
              formatter: (current) => `${current > 0 ? '+' : ''}${Math.round(current)}`,
              secondary: {
                position: 'bottom',
                formatter: () => (activeMode ? `${MODE_LABELS[activeMode]} mode` : 'Try a gesture'),
              },
            }}
            appearance={{
              arc: { startAngle: -135, sweepAngle: 270, clampInput: true },
              ring: { thickness: 16, color: '#0f172a', trailColor: '#1e293b' },
              fill: { color: '#020617', radiusOffset: -14 },
              progress: {
                mode: 'split',
                roundedCaps: true,
                thickness: 10,
                color: '#38bdf8',
                trailColor: '#475569',
              },
              interaction: {
                modes: MODES.map((mode) => mode.key),
                lockThresholdPx: 32,
                slideRatio: 1.5,
                variancePx: 6,
                spinPrecisionRadius: 80,
                respectStartSide: true,
                scroll: { enabled: true, ratio: 0.8, preventPageScroll: true },
                onModeChange: setActiveMode,
              },
            }}
          />
        </Block>
        <Block style={{ minWidth: 140, flex: 1 }}>
          <DataList spacing="2xl" labelWidth={140}>
            {MODES.map((mode) => (
              <DataList.Item key={mode.key}>
                {/* The mode currently driving the knob is pulled up to full-contrast text. */}
                <DataList.ItemLabel
                  color={activeMode === mode.key ? theme.text.primary : theme.text.muted}
                >
                  {mode.name}
                </DataList.ItemLabel>
                <DataList.ItemValue color={theme.text.secondary}>{mode.detail}</DataList.ItemValue>
              </DataList.Item>
            ))}
          </DataList>
        </Block>
      </Row>
    </Block>
  );
}
