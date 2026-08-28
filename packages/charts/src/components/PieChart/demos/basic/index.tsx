import { PieChart } from '@platform-blocks/charts';

import { TRAFFIC_SOURCES } from './data';

export default function Demo() {
  return (
    <PieChart
      title="Traffic sources"
      width={560}
      height={360}
      data={TRAFFIC_SOURCES}
      innerRadius={70}
      outerRadius={150}
      showLabels={true}
      labelPosition="outside"
      showValues={true}
      valueFormatter={(value) => `${value}%`}
      legend={{ show: true, position: 'right' }}
      tooltip={{
        show: true,
        formatter: (segment) => `${segment.label}: ${segment.value}%`,
      }}
      startAngle={-90}
      endAngle={270}
    />
  );
}
