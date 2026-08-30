import { NetworkChart } from '@platform-blocks/charts';

import { COHORTS, REFERRALS } from './data';

const waveToColor = (wave?: number) => {
  if (wave === 1) return '#34C759';
  if (wave === 2) return '#4DABF7';
  if (wave === 3) return '#FF922B';
  return '#ADB5BD';
};

const waveToOpacity = (wave?: number) => {
  if (wave === 1) return 0.7;
  if (wave === 2) return 0.6;
  if (wave === 3) return 0.55;
  return 0.45;
};

export function Demo() {
  return (
    <NetworkChart
      title="Customer referral influence network"
      subtitle="Referral pathways by activation wave"
      height={430}
      nodes={COHORTS}
      links={REFERRALS}
      showLabels
      nodeRadius={13}
      nodeRadiusRange={[11, 25]}
      linkWidthRange={[1, 3.6]}
      linkColorAccessor={(link) => waveToColor(typeof link.meta?.wave === 'number' ? link.meta.wave : Number(link.meta?.wave))}
      linkOpacityAccessor={(link) => waveToOpacity(typeof link.meta?.wave === 'number' ? link.meta.wave : Number(link.meta?.wave))}
    />
  );
}
