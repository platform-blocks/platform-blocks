import { ViolinChart } from '@platform-blocks/charts';

import { FULFILLMENT_CENTERS, SLA_WINDOW, STATS_MARKERS } from './data';

export function Demo() {
  return (
    <ViolinChart
      title="Delivery time spread by fulfillment center"
      subtitle="Distribution of hours from order capture to doorstep delivery"
      height={460}
      series={FULFILLMENT_CENTERS}
      samples={96}
      bandwidth={1.6}
      violinWidthRatio={0.82}
      statsMarkers={STATS_MARKERS}
      valueBands={SLA_WINDOW}
      yAxis={{ title: 'Hours to deliver', show: true, labelFormatter: (value) => `${value.toFixed(0)}h` }}
    />
  );
}
