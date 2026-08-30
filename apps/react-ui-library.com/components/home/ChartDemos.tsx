import React from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Card, Grid, GridItem, type ResponsiveProp } from '@platform-blocks/react-ui-library';
import { AreaChart, BarChart, PieChart } from '@platform-blocks/charts';

/* ------------------------------------------------------------------ */
/*  Live chart demos for the home page.                               */
/*                                                                    */
/*  These used to sit behind a React.lazy boundary on web, held back  */
/*  until after hydration so the prerender and the hydration pass     */
/*  agreed on the fallback. It bought nothing: the web export is a    */
/*  single bundle for every route, and the chart routes, the showcase */
/*  and playground registries and the dashboard example all import    */
/*  the charts barrel into it already — the split chunk came out at   */
/*  1.8 KB. All it did was hold the demos back until hydration had    */
/*  finished and then spend a round trip fetching them, ~900ms of     */
/*  empty cards after the page was on screen.                         */
/* ------------------------------------------------------------------ */

const AREA_DATA = [
  { x: 0, y: 4200, label: 'Jan' },
  { x: 1, y: 5800, label: 'Feb' },
  { x: 2, y: 5100, label: 'Mar' },
  { x: 3, y: 7200, label: 'Apr' },
  { x: 4, y: 6800, label: 'May' },
  { x: 5, y: 9100, label: 'Jun' },
];

const BAR_DATA = [
  { category: 'Q1', value: 42, color: '#3b82f6' },
  { category: 'Q2', value: 58, color: '#8b5cf6' },
  { category: 'Q3', value: 35, color: '#06b6d4' },
  { category: 'Q4', value: 71, color: '#10b981' },
];

const PIE_DATA = [
  { label: 'Mobile', value: 45, color: '#3b82f6' },
  { label: 'Desktop', value: 35, color: '#8b5cf6' },
  { label: 'Tablet', value: 20, color: '#06b6d4' },
];

const CHART_CARD_HEIGHT = 180;

/**
 * Charts render to SVG and need a pixel width, so measure the card's content
 * box and hand that width to the chart. Renders nothing until measured.
 */
function ChartCard({ children }: { title: string; children: (width: number) => React.ReactNode }) {
  const [width, setWidth] = React.useState(0);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setWidth((prev) => (prev === next ? prev : next));
  }, []);

  // The wrapper is what gets measured, so it has to stay mounted even while
  // `width` is 0 — the chart is the only thing gated on the measurement.
  return (
    <Card variant="ghost">
      <View style={{ width: '100%', height: CHART_CARD_HEIGHT }} onLayout={handleLayout}>
        {width > 0 ? children(width) : null}
      </View>
    </Card>
  );
}

export interface ChartDemosProps {
  /** Responsive so `Grid` resolves it in CSS rather than from a settled breakpoint. */
  cols: ResponsiveProp<number>;
}

export default function ChartDemos({ cols }: ChartDemosProps) {
  return (
    <Grid columns={cols} gap="lg" style={{ width: '100%', marginBottom: 32 }}>
      <GridItem span={1}>
        <ChartCard title="Revenue trend">
          {(width) => (
            <AreaChart
              width={width}
              height={CHART_CARD_HEIGHT}
              data={AREA_DATA}
              xAxis={{ show: true, labelFormatter: (v) => AREA_DATA[v]?.label ?? '' }}
              yAxis={{ show: true }}
              liveTooltip
            />
          )}
        </ChartCard>
      </GridItem>
      <GridItem span={1}>
        <ChartCard title="Quarterly results">
          {(width) => (
            <BarChart
              width={width}
              height={CHART_CARD_HEIGHT}
              data={BAR_DATA}
              xAxis={{ show: true }}
              yAxis={{ show: true }}
              liveTooltip
              enableCrosshair
            />
          )}
        </ChartCard>
      </GridItem>
      {/* The third card is a width the prerender cannot know: rendering it or
          not by breakpoint means the static page and the hydrated one disagree
          about how many children this grid has, which React answers by throwing
          the tree away. It always renders; the stylesheet hides it where two
          cards is all that fits. */}
      <GridItem span={1} {...({ dataSet: { pbShellDesktopOnly: 'true' } } as any)}>
        <ChartCard title="Traffic sources">
          {(width) => (
            <PieChart
              width={width}
              height={CHART_CARD_HEIGHT}
              data={PIE_DATA}
              legend={{ show: true }}
            />
          )}
        </ChartCard>
      </GridItem>
    </Grid>
  );
}
