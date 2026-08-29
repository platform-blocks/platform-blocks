import { Block, Text, Timeline } from '@platform-blocks/ui';

const phases = ['Start', 'Plan', 'Build'];

const variantExamples = [
  { label: 'Solid (default)', variant: undefined },
  { label: 'Dashed', variant: 'dashed' as const },
  { label: 'Dotted', variant: 'dotted' as const },
];

const releaseFlow = [
  { title: 'Planning', variant: 'solid' as const },
  { title: 'Design', variant: 'dashed' as const },
  { title: 'Development', variant: 'dotted' as const },
  { title: 'QA', variant: 'dashed' as const },
  { title: 'Launch', variant: 'solid' as const },
];

export function Demo() {
  return (
    <Block direction="row" justify="space-between" fullWidth>
      {variantExamples.map((example) => (
        <Block key={example.label}>
          <Text weight="semibold">{example.label}</Text>
          <Timeline>
            {phases.map((title) => (
              <Timeline.Item key={`${example.label}-${title}`} title={title} lineVariant={example.variant} />
            ))}
          </Timeline>
        </Block>
      ))}
      <Block>
        <Text weight="semibold">Mix line variants</Text>
        <Timeline>
          {releaseFlow.map((step) => (
            <Timeline.Item key={step.title} title={step.title} lineVariant={step.variant} />
          ))}
        </Timeline>
      </Block>
    </Block>
  );
}
