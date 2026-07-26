import { Block, Text, Waveform } from '@platform-blocks/ui';

import { WAVEFORM_DEMO_PEAKS } from '../data';

export default function Demo() {
  return (
    <Block>
      <Block w="100%" maxW={320}>
        <Text variant="small">Fixed width waveform</Text>
        <Waveform peaks={WAVEFORM_DEMO_PEAKS} progress={0.35} h={56} />
      </Block>

      <Block w="100%">
        <Text variant="small">`fullWidth` stretches to the container</Text>
        <Waveform
          peaks={WAVEFORM_DEMO_PEAKS}
          progress={0.6}
          h={56}
          fullWidth
          color="primary"
        />
      </Block>
    </Block>
  );
}