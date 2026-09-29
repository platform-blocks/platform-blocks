import { Block, Text, Waveform } from '@platform-blocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export function Demo() {
  return (
    <Block fullWidth>
      <Block>
        <Text variant="small">Default</Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={0.35} h={56} />
      </Block>

      <Block>
        <Text variant="small">fullWidth</Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={0.6} h={56} fullWidth />
      </Block>
    </Block>
  );
}
