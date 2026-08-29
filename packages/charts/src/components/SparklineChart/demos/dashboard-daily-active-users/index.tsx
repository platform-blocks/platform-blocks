import { Block, Card, Flex, Text, Title } from '@platform-blocks/ui';
import { SparklineChart } from '@platform-blocks/charts';

import { SURFACE_SERIES } from './data';

const formatUsers = (value: number) => `${Math.round(value).toLocaleString()} users`;

const getDeltaLabel = (series: number[]) => {
  if (series.length < 2) return 'Stable vs yesterday';
  const latest = series[series.length - 1];
  const prior = series[series.length - 2];
  const delta = latest - prior;
  if (delta === 0) return 'Stable vs yesterday';
  const prefix = delta > 0 ? '+' : '-';
  return `${prefix}${Math.abs(delta).toLocaleString()} vs yesterday`;
};

export function Demo() {
  return (
    <Card padding="lg" radius="lg">
      <Block mb="md">
        <Title order={5} text="Daily Active Users" />
        <Text size="sm" c="dimmed">Trailing two weeks, by platform</Text>
      </Block>

      <Flex direction="row" wrap="wrap" gap="md">
        {SURFACE_SERIES.map((series) => {
          const latest = series.data[series.data.length - 1];
          return (
            <Block key={series.id} style={{ width: 200 }}>
              <Text size="sm" weight="semibold">{series.title}</Text>
              <Text size="xs" c="dimmed">
                {latest.toLocaleString()} · {getDeltaLabel(series.data)}
              </Text>
              <SparklineChart
                width={200}
                height={72}
                data={series.data}
                fill
                fillOpacity={0.18}
                smooth
                highlightLast
                valueFormatter={formatUsers}
                domain={{ y: [900, 2300] }}
                thresholds={[{ value: 2100, label: 'Target', dashed: true, color: '#94A3B8', opacity: 0.7, labelPosition: 'right' }]}
              />
            </Block>
          );
        })}
      </Flex>
    </Card>
  );
}
