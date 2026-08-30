import { LineChart } from '@platform-blocks/charts';

import { MILESTONES, SERIES, TARGET_RETENTION } from './data';

export function Demo() {
  return (
    <LineChart
      title="Cohort Retention Across Milestones"
      subtitle="Weekly retention milestones by signup quarter"
      height={440}
      series={SERIES}
      smooth={false}
      showPoints
      grid={{ show: true, style: 'dotted' }}
      legend={{ show: true, position: 'bottom', align: 'center' }}
      tooltip={{
        show: true,
        formatter: (point) => {
          const milestone = point.data?.milestone ?? `Milestone ${point.x + 1}`;
          const cohort = point.data?.cohort ?? 'Cohort';
          return `${cohort} • ${milestone}: ${point.y.toFixed(0)}% retained`;
        },
      }}
      annotations={[
        {
          id: 'target-retention',
          shape: 'horizontal-line',
          y: TARGET_RETENTION,
          label: 'Target 45% Retention',
          color: '#0EA5E9',
          textColor: '#0F172A',
        },
      ]}
      xAxis={{
        show: true,
        title: 'Customer milestone',
        labelFormatter: (value: number) => MILESTONES[Math.round(value)] ?? `Step ${Math.round(value) + 1}`,
      }}
      yAxis={{
        show: true,
        title: 'Percent of original cohort',
        labelFormatter: (value: number) => `${Math.round(value)}%`,
      }}
      enableCrosshair
      liveTooltip
    />
  );
}
