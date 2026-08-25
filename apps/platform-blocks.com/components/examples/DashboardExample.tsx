import React from 'react';
import { ScrollView } from 'react-native';
import { Card, Chip, Column, Flex, Text, Title, useTheme } from '@platform-blocks/ui';
import { SparklineChart } from '@platform-blocks/charts';

interface Stat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  trend: number[];
}

const STATS: Stat[] = [
  {
    label: 'Revenue',
    value: '$48,210',
    change: '+12.4%',
    positive: true,
    trend: [31, 35, 33, 41, 44, 42, 49, 53, 51, 58, 62, 66],
  },
  {
    label: 'Active users',
    value: '9,382',
    change: '+4.1%',
    positive: true,
    trend: [58, 61, 60, 63, 62, 66, 65, 69, 68, 70, 73, 74],
  },
  {
    label: 'Conversion',
    value: '3.9%',
    change: '-0.6%',
    positive: false,
    trend: [52, 50, 51, 48, 49, 46, 47, 44, 45, 43, 42, 41],
  },
  {
    label: 'Avg. session',
    value: '4m 12s',
    change: '+18s',
    positive: true,
    trend: [39, 40, 42, 41, 44, 46, 45, 47, 50, 49, 53, 55],
  },
];

/** KPI tiles with trend sparklines, laid out with wrapping flexbox. */
export function DashboardExample() {
  const theme = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgrounds.base }}
      contentContainerStyle={{ padding: 20, gap: 16, maxWidth: 1080, width: '100%', alignSelf: 'center' }}
    >
      <Column gap="xs">
        <Title order={2}>Overview</Title>
        <Text variant="small" colorVariant="secondary">Last 12 weeks</Text>
      </Column>

      <Flex direction="row" wrap="wrap" gap="md">
        {STATS.map(stat => (
          <Card key={stat.label} variant="elevated" p="lg" style={{ flexBasis: 240, flexGrow: 1 }}>
            <Column gap="sm">
              <Flex direction="row" align="center" justify="space-between">
                <Text variant="small" colorVariant="secondary">{stat.label}</Text>
                <Chip
                  size="sm"
                  variant="light"
                  color={stat.positive ? 'success' : 'error'}
                >
                  {stat.change}
                </Chip>
              </Flex>
              <Title order={3}>{stat.value}</Title>
              <SparklineChart
                width={200}
                height={48}
                data={stat.trend}
                fill
                fillOpacity={0.15}
                smooth
                showPoints={false}
                strokeWidth={2}
              />
            </Column>
          </Card>
        ))}
      </Flex>
    </ScrollView>
  );
}
