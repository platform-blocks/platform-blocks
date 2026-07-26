import { Block, Tabs, Text } from '@platform-blocks/ui';

type Orientation = 'horizontal' | 'vertical';

const buildItems = (orientation: Orientation) => [
  {
    key: 'general',
    label: 'General',
    content: (
      <Text>
        Broad overview content rendered with a {orientation} tab list.
      </Text>
    )
  },
  {
    key: 'security',
    label: 'Security',
    content: (
      <Text>
        Security controls and permissions laid out for a {orientation} arrangement.
      </Text>
    )
  },
  {
    key: 'notifications',
    label: 'Notifications',
    content: (
      <Text>
        Configure alerts and digests with triggers stacked {orientation === 'vertical' ? 'in a column' : 'in a row'}.
      </Text>
    )
  }
];

const ORIENTATIONS: Array<{ label: string; orientation: Orientation; helper: string }> = [
  {
    label: 'Horizontal orientation',
    orientation: 'horizontal',
    helper: 'Default layout presents tabs in a row for top-level navigation.'
  },
  {
    label: 'Vertical orientation',
    orientation: 'vertical',
    helper: 'Vertical tab lists are ideal for settings sidebars and dense menus.'
  }
];

export default function Demo() {
  return (
    <Block>
      {ORIENTATIONS.map(({ label, orientation, helper }) => (
        <Block key={orientation}>
          <Text weight="medium">{label}</Text>
          <Tabs orientation={orientation} items={buildItems(orientation)} />
          <Text variant="small" colorVariant="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
