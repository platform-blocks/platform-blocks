import { MarimekkoChart } from '@platform-blocks/charts';

import { REGIONAL_REVENUE } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="Revenue mix by region"
      subtitle="Trailing twelve months"
      height={440}
      data={REGIONAL_REVENUE}
      columnGap={20}
      legend={{ show: true, position: 'bottom', align: 'start' }}
      grid={{ show: true, style: 'dotted' }}
      yAxis={{ title: 'Share within region (%)' }}
    />
  );
}
