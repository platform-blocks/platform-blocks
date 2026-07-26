import { Block, Tabs, Text } from '@platform-blocks/ui';

const ITEMS = [
  {
    key: 'home',
    label: 'Home',
    content: (
      <Block>
        <Text weight="medium">Welcome back</Text>
        <Text colorVariant="muted">
          Animated transitions ease between dashboard sections and reinforce context shifts.
        </Text>
      </Block>
    )
  },
  {
    key: 'analytics',
    label: 'Analytics',
    content: (
      <Block>
        <Text weight="medium">Analytics overview</Text>
        <Text colorVariant="muted">
          Surface key charts and KPIs while the motion guides attention to new content.
        </Text>
      </Block>
    )
  },
  {
    key: 'settings',
    label: 'Settings',
    content: (
      <Block>
        <Text weight="medium">Account settings</Text>
        <Text colorVariant="muted">
          Manage notifications, billing, and other preferences without abrupt content swaps.
        </Text>
      </Block>
    )
  }
];

export default function Demo() {
  return (
    <Block>
      <Tabs
        variant="line"
        animated
        animationDuration={250}
        items={ITEMS}
      />
      <Text variant="small" colorVariant="muted">
        Enable `animated` to add motion and use `animationDuration` to moderate the easing speed.
      </Text>
    </Block>
  );
}
