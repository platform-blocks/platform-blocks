import React from 'react';
import { type LayoutChangeEvent } from 'react-native';
import { Block, Card, Grid, GridItem, type ResponsiveProp } from '@plocks/ui';
import { AreaChart, BarChart, PieChart } from '@plocks/charts';

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

function ChartCard({ children }: { title: string; children: (width: number) => React.ReactNode }) {
  const [width, setWidth] = React.useState(0);

  const handleLayout = React.useCallback((event: LayoutChangeEvent) => {
    const next = Math.round(event.nativeEvent.layout.width);
    setWidth((prev) => (prev === next ? prev : next));
  }, []);

  return (
    <Card variant="ghost">
      <Block {...({ onLayout: handleLayout } as any)} gap={0} w="full" h={CHART_CARD_HEIGHT}>
        {width > 0 ? children(width) : null}
      </Block>
    </Card>
  );
}

export interface ChartDemosProps {
  cols: ResponsiveProp<number>;
}

export default function ChartDemos({ cols }: ChartDemosProps) {
  return (
    <Grid columns={cols} gap="lg" fullWidth mb="xl">

      <GridItem span={1}>
        <ChartCard title="Revenue trend">
          {(width) => (
            <AreaChart
              w={width}
              h={CHART_CARD_HEIGHT}
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
              w={width}
              h={CHART_CARD_HEIGHT}
              data={BAR_DATA}
              xAxis={{ show: true }}
              yAxis={{ show: true }}
              liveTooltip
              enableCrosshair
            />
          )}
        </ChartCard>
      </GridItem>

      <GridItem span={1} {...({ dataSet: { plocksShellDesktopOnly: 'true' } } as any)}>
        <ChartCard title="Traffic sources">
          {(width) => (
            <PieChart
              w={width}
              h={CHART_CARD_HEIGHT}
              data={PIE_DATA}
              legend={{ show: true }}
            />
          )}
        </ChartCard>
      </GridItem>

    </Grid>
  );
}
