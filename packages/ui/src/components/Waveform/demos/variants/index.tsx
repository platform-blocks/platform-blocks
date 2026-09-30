import { Block, Text, Waveform } from '@plocks/ui';

import { QUIET_WAVEFORM_PEAKS, WAVEFORM_DEMO_PEAKS } from '../data';

const VARIANTS = ['bars', 'rounded', 'line', 'gradient'] as const;

export function Demo() {
  return (
    <Block fullWidth gap="lg">
      <Block>
        {VARIANTS.map((variant) => (
          <Block key={variant} gap="xs">
            <Text variant="small">{variant}</Text>
            <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={64} progress={0.4} variant={variant} fullWidth />
          </Block>
        ))}
      </Block>

      <Block>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.25} color="primary" fullWidth />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.5} color="success" fullWidth />
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} h={56} progress={0.75} color="warning" fullWidth />
      </Block>

      <Block>
        <Block gap="xs">
          <Text variant="small">Default</Text>
          <Waveform peaks={QUIET_WAVEFORM_PEAKS} h={56} progress={0.45} color="surface" fullWidth />
        </Block>
        <Block gap="xs">
          <Text variant="small">normalize</Text>
          <Waveform peaks={QUIET_WAVEFORM_PEAKS} h={56} progress={0.45} normalize color="surface" fullWidth />
        </Block>
      </Block>
    </Block>
  );
}
