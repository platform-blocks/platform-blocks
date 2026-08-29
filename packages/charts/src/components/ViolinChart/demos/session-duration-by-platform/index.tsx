import { ViolinChart } from '@platform-blocks/charts';

import { ENGAGEMENT_BANDS, SESSION_SERIES, STATS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Session duration distribution by platform"
      subtitle="Minutes per active session across major surfaces"
      width={700}
      height={440}
      series={SESSION_SERIES}
      samples={88}
      bandwidth={1.9}
      violinWidthRatio={0.7}
      statsMarkers={STATS}
      valueBands={ENGAGEMENT_BANDS}
      yAxis={{
        title: 'Minutes per session',
        labelFormatter: (value) => `${value.toFixed(1)} min`,
      }}
    />
  );
}
