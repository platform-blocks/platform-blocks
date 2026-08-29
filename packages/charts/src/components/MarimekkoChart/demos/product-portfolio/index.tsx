import { MarimekkoChart } from '@platform-blocks/charts';

import { PRODUCT_MIX } from './data';

export function Demo() {
  return (
    <MarimekkoChart
      title="ARR by product tier and motion"
      subtitle="Current quarter"
      width={780}
      height={460}
      data={PRODUCT_MIX}
      segmentBorderRadius={4}
      legend={{ show: true, position: 'right' }}
      yAxis={{ title: 'Revenue share (%)' }}
      categoryLabelFormatter={(category) => `${category.label}\n(${category.data?.region ?? 'Global'})`}
    />
  );
}
