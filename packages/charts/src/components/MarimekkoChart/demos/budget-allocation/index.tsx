import { MarimekkoChart } from '@platform-blocks/charts';

import { BUDGET_PLAN } from './data';

export default function Demo() {
  return (
    <MarimekkoChart
      title="FY26 budget allocation"
      subtitle="Percentage of total discretionary spend"
      width={720}
      height={420}
      data={BUDGET_PLAN}
      segmentBorderRadius={3}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      yAxis={{ title: 'Share of category (%)' }}
      categoryLabelFormatter={(category) => `${category.label} (${category.segments.reduce((sum, seg) => sum + seg.value, 0)}%)`}
    />
  );
}
