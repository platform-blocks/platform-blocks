import { Block, Tabs, Text } from '@platform-blocks/ui';

const LOCATIONS = ['start', 'end'] as const;

const ITEMS = [
  {
    key: 'home',
    label: 'Home',
    content: <Text>Home content.</Text>
  },
  {
    key: 'settings',
    label: 'Settings',
    content: <Text>Update your configuration.</Text>
  },
  {
    key: 'profile',
    label: 'Profile',
    content: <Text>Profile information.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      {LOCATIONS.map((location) => (
        <Block key={location} fullWidth>
          <Text variant="small" c="secondary">{location}</Text>
          <Tabs location={location} items={ITEMS} />
        </Block>
      ))}
    </Block>
  );
}
