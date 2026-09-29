import { ChartThemeProvider, HistogramChart } from '@platform-blocks/charts';

import { BASKET_TOTALS, BRAND_PALETTE } from './data';

export function Demo() {
  // No color props on the chart: bars take palette slot 1 and the density line
  // slot 2 from the nearest ChartThemeProvider. A nested provider re-themes just
  // its own subtree and inherits everything else from the app's theme.
  return (
    <ChartThemeProvider value={{ colors: { accentPalette: BRAND_PALETTE } }}>
      <HistogramChart
        title="Checkout basket size"
        subtitle="Colored entirely by the surrounding theme's palette"
        h={320}
        data={BASKET_TOTALS}
        bins={12}
        showDensity
        legend={{ show: true }}
        xAxis={{
          title: 'Basket total (USD)',
          labelFormatter: (value) => `$${value.toFixed(0)}`,
        }}
        yAxis={{
          title: 'Probability density',
          labelFormatter: (value) => value.toFixed(3),
        }}
        grid={{ show: true }}
        tooltip={{
          show: true,
          formatter: (bin) => `${bin.count} baskets between $${bin.start.toFixed(0)}–$${bin.end.toFixed(0)}`,
        }}
        valueFormatter={(count) => `${count} baskets`}
      />
    </ChartThemeProvider>
  );
}
