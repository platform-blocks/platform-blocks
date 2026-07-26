import { GroupedBarChart } from '../../';

import { SERIES } from './data';

export default function Demo() {
  return (
    <GroupedBarChart
      title="Feature usage by platform"
      subtitle="Weekly active users per capability (in thousands)"
      width={600}
      height={360}
      series={SERIES}
      barSpacing={0.18}
      innerBarSpacing={0.16}
      xAxis={{
        show: true,
        title: 'Product capability',
      }}
      yAxis={{
        show: true,
        title: 'Weekly active users (thousands)',
        labelFormatter: (value) => `${value}k`,
      }}
      grid={{ show: true }}
      legend={{ show: true, position: 'bottom' }}
      valueLabels={{
        show: true,
        position: 'inside',
        formatter: ({ value }) => `${value}k`,
        color: 'rgba(255,255,255,0.96)',
        fontWeight: '600',
        minBarHeightForInside: 24,
      }}
      animation={{ duration: 420 }}
    />
  );
}
