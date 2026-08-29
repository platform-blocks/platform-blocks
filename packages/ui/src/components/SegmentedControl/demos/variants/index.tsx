import { Block, Card, SegmentedControl, Text } from '@platform-blocks/ui';

import { cadences, frameworks, panes, priorities, publishStates } from '../data';

const variants = [
  {
    key: 'default',
    label: 'Default',
    props: { variant: 'default' as const },
    defaultValue: 'react',
    description: 'Baseline segmented control with tonal contrast.',
    data: frameworks,
  },
  {
    key: 'filledPrimary',
    label: 'Filled',
    props: { variant: 'filled' as const, color: 'primary' as const },
    defaultValue: 'code',
    description: 'Solid background that matches the selected color token.',
    data: panes,
  },
  {
    key: 'filledContrast',
    label: 'Filled with auto-contrast',
    props: {
      variant: 'filled' as const,
      color: 'warning' as const,
      autoContrast: true,
    },
    defaultValue: 'medium',
    description: 'Enable autoContrast when using vivid palettes to keep labels legible.',
    data: priorities,
  },
  {
    key: 'outline',
    label: 'Outline',
    props: { variant: 'outline' as const, color: 'secondary' as const },
    defaultValue: 'weekly',
    description: 'Focus on outlining the chosen tab while keeping the surface quiet.',
    data: cadences,
  },
  {
    key: 'ghost',
    label: 'Ghost',
    props: { variant: 'ghost' as const, color: 'success' as const },
    defaultValue: 'published',
    description: 'Ghost removes the segment background until selection, ideal on tinted surfaces.',
    data: publishStates,
  },
];

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Change the variant to match the surface and emphasis level of the surrounding layout.
        </Text>
        <Block>
          {variants.map((variant) => (
            <Block key={variant.key}>
              <Text size="xs" color="secondary">
                {variant.label}
              </Text>
              <SegmentedControl
                defaultValue={variant.defaultValue}
                data={variant.data}
                {...variant.props}
              />
              <Text size="xs" color="muted">
                {variant.description}
              </Text>
            </Block>
          ))}
        </Block>
      </Block>
    </Card>
  );
}
