import { Block, Tabs, Text } from '@platform-blocks/react-ui-library';

type Location = 'start' | 'end';

const SECTIONS: Array<{ label: string; location: Location; helper: string }> = [
  {
    label: 'Tabs above content (start)',
    location: 'start',
    helper: 'Default placement keeps triggers directly above the active view.'
  },
  {
    label: 'Tabs below content (end)',
    location: 'end',
    helper: 'Use end placement when the content should lead and controls follow.'
  }
];

const buildItems = (location: Location) => [
  {
    key: 'home',
    label: 'Home',
    content: (
      <Text>
        Home content rendered with tabs {location === 'start' ? 'above' : 'below'} the panel.
      </Text>
    )
  },
  {
    key: 'settings',
    label: 'Settings',
    content: (
      <Text>
        Update configurations while keeping the tabs {location === 'start' ? 'up top' : 'after the details'}.
      </Text>
    )
  },
  {
    key: 'profile',
    label: 'Profile',
    content: (
      <Text>
        Profile information with navigation {location === 'start' ? 'leading into' : 'following'} the content.
      </Text>
    )
  }
];

export function Demo() {
  return (
    <Block>
      {SECTIONS.map(({ label, location, helper }) => (
        <Block key={location}>
          <Text weight="medium">{label}</Text>
          <Tabs variant="line" location={location} items={buildItems(location)} />
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
