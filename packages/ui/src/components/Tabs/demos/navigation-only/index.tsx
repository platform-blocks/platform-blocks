import { useMemo, useState } from 'react';
import { Block, Tabs, Text, useTheme } from '@platform-blocks/react-ui-library';

const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'products', label: 'Products' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' }
] as const;

const CONTENT_COPY: Record<typeof NAV_ITEMS[number]['key'], string> = {
  home: 'Welcome back! Navigation only mode keeps the tab strip separated from the view.',
  products: 'Highlight product cards, filters, or category grids below the navigation.',
  about: 'Share the company story, values, and milestones alongside persistent tabs.',
  contact: 'Surface support channels and locations while the navigation stays fixed.'
};

export function Demo() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<typeof NAV_ITEMS[number]['key']>('home');

  const items = useMemo(
    () => NAV_ITEMS.map(({ key, label }) => ({ key, label, content: null })),
    []
  );

  return (
    <Block>
      <Tabs
        items={items}
        activeTab={activeTab}
        onTabChange={(tabKey) => setActiveTab(tabKey as typeof NAV_ITEMS[number]['key'])}
        variant="chip"
        navigationOnly
      />
      <Block bg={theme.backgrounds.surface} borderColor={theme.backgrounds.border} radius="lg" p="lg">
        <Text>{CONTENT_COPY[activeTab]}</Text>
      </Block>
      <Text variant="small" color="muted">
        `navigationOnly` renders just the triggers so you can manage layout and transitions for the content area yourself.
      </Text>
    </Block>
  );
}
