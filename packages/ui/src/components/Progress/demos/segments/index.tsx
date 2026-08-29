import { Block, ColorSwatch, Progress, Row, Text } from '@platform-blocks/ui';

const USAGE = [
  { label: 'Documents', value: 32, color: '#4c6ef5' },
  { label: 'Music', value: 24, color: '#12b886' },
  { label: 'Code', value: 14, color: '#fab005' },
  { label: 'Video Games', value: 9, color: '#fa5252' }
];

const TOTAL_GB = 500;
const used = USAGE.reduce((sum, segment) => sum + segment.value, 0);

const formatSize = (percent: number) => {
  const gb = (percent / 100) * TOTAL_GB;
  return gb < 1 ? `${Math.round(gb * 1024)} MB` : `${Math.round(gb)} GB`;
};

export function Demo() {
  return (
    <Block gap="md" fullWidth>
      <Row justify="space-between" align="center">
        <Text weight="600">Project storage</Text>
        <Text variant="small" color="muted">
          {formatSize(used)} of {TOTAL_GB} GB used
        </Text>
      </Row>

      <Progress.Root size="lg" radius="xl">
        {USAGE.map((segment) => (
          <Progress.Section
            key={segment.label}
            value={segment.value}
            color={segment.color}
            tooltip={{
              label: `${segment.label} — ${formatSize(segment.value)} (${segment.value}%)`,
              withArrow: true
            }}
          >
            <Progress.Label>{formatSize(segment.value)}</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>

      <Block gap="lg" direction="row" justify="center">
        {USAGE.map((segment) => (
          <Row key={segment.label} gap="xs" align="center">
            <ColorSwatch color={segment.color} size={12} />
            <Text variant="small">{segment.label}</Text>
            <Text variant="small" color="muted">
              {segment.value}%
            </Text>
          </Row>
        ))}
      </Block>
    </Block>
  );
}
