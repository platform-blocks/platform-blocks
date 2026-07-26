import React from 'react';
import { View } from 'react-native';
import { Card, Grid, GridItem } from '@platform-blocks/ui';
import type { ChartDemosProps } from './ChartDemos';

// Web entry point for the home-page chart demos.
//
// The charts library (+ react-native-svg) is heavy and lives below the hero,
// so we code-split it off the home route's initial bundle with React.lazy.
// The static import lives in ChartDemos.tsx; native builds resolve
// ChartDemosSection.tsx instead (static re-export) to stay compatible with
// EAS export:embed eager bundling.
const ChartDemos = React.lazy(() => import('./ChartDemos'));

// Keep this in sync with CHART_CARD_HEIGHT in ChartDemos.tsx. The fallback
// reserves the same footprint the loaded charts occupy so the lazy swap does
// not shift layout (baseline CLS is 0 and should stay there).
const CHART_CARD_HEIGHT = 180;

function ChartDemosFallback({ cols, isMobile }: ChartDemosProps) {
  const count = isMobile ? 2 : 3;
  return (
    <Grid columns={cols} gap="lg" style={{ width: '100%', marginBottom: 32 }}>
      {Array.from({ length: count }).map((_, i) => (
        <GridItem key={i} span={1}>
          {/* Mirrors ChartCard exactly — same variant, no title row — so the
              swap to the loaded charts costs nothing in layout shift. */}
          <Card variant="ghost">
            <View style={{ width: '100%', height: CHART_CARD_HEIGHT }} />
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
}

export type { ChartDemosProps };

export default function ChartDemosSection(props: ChartDemosProps) {
  return (
    <React.Suspense fallback={<ChartDemosFallback {...props} />}>
      <ChartDemos {...props} />
    </React.Suspense>
  );
}
