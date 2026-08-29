import { MarimekkoChart } from '@platform-blocks/charts';

import { PIPELINE_COMPOSITION } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="Pipeline contribution by segment"
      subtitle="Quarter to date"
      width={760}
      height={440}
      data={PIPELINE_COMPOSITION}
      columnGap={16}
      legend={{ show: true, position: 'bottom' }}
      yAxis={{ title: 'Segment share (%)' }}
      grid={{ show: true, style: 'dotted' }}
      categoryLabelFormatter={(category) => category.label}
    />
  );
}
