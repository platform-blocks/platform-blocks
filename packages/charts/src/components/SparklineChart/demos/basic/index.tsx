import { SparklineChart } from '@platform-blocks/charts';

import { DAILY_SIGNUPS } from './data';

export function Demo() {
  return (
    // TODO: cant see gradient fill on this one, investigate
    <SparklineChart
      width={180}
      height={72}
      data={DAILY_SIGNUPS}
      fill
      fillOpacity={0.18}
      smooth
      showPoints={false}
      pointSize={4}
      strokeWidth={2.5}
      highlightLast={false}
      valueFormatter={(value) => `${value} signups`}
      domain={{ y: [20, 80] }}
    />
  );
}
