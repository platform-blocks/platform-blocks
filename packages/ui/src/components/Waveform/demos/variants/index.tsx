import { Block, Row, Text, Waveform } from '@platform-blocks/ui';

import { QUIET_WAVEFORM_PEAKS, WAVEFORM_DEMO_PEAKS } from '../data';

const VARIANTS = [
  { variant: 'bars', hint: 'Square bars — the default.' },
  { variant: 'rounded', hint: 'Bars with pill caps.' },
  { variant: 'line', hint: 'Continuous stroked path.' },
  { variant: 'gradient', hint: 'Bars filled with a color ramp.' },
] as const;

export default function Demo() {
  return (
    <Block gap="lg">
      <Block gap="sm">
        <Text variant="small" weight="medium">
          Variant styles
        </Text>
        {VARIANTS.map(({ variant, hint }) => (
          <Block key={variant} gap="xs">
            <Row gap="xs" align="baseline" wrap="wrap">
              <Text variant="small" weight="medium">
                {variant}
              </Text>
              <Text size="xs" colorVariant="secondary">
                {hint}
              </Text>
            </Row>
            <Waveform
              peaks={WAVEFORM_DEMO_PEAKS}
              h={64}
              progress={0.4}
              variant={variant}
              color="primary"
            />
          </Block>
        ))}
        <Text size="xs" colorVariant="secondary">
          The gradient ramp is derived from `color`; pass `gradientColors` to
          supply your own stops.
        </Text>
      </Block>

      <Block gap="sm">
        <Text variant="small" weight="medium">
          Semantic colors
        </Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.25} color="primary" />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.5} color="success" />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.75} color="warning" />
      </Block>

      <Block gap="sm">
        <Text variant="small" weight="medium">
          Normalized quiet tracks
        </Text>
        <Waveform peaks={QUIET_WAVEFORM_PEAKS} h={56} progress={0.45} color="surface" />
        <Waveform
          peaks={QUIET_WAVEFORM_PEAKS}
          h={56}
          progress={0.45}
          normalize
          color="surface"
        />
      </Block>
    </Block>
  );
}
