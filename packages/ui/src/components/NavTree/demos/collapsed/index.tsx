import React, { useState } from 'react';
import { Column, Icon, NavTree, Switch, type NavTreeItem } from '@platform-blocks/react-ui-library';

const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Components' },
  { label: 'Card', href: '/components/Card', group: 'Components' },
  { label: 'LineChart', href: '/components/LineChart', group: 'Charts' },
  { label: 'BarChart', href: '/components/BarChart', group: 'Charts' },
  { label: 'useHover', href: '/hooks/useHover', group: 'Hooks' },
];

const GROUP_ICONS = {
  Components: <Icon name="grid" size={18} />,
  Charts: <Icon name="chart-bar" size={18} />,
  Hooks: <Icon name="hook" size={18} />,
};

export function Demo() {
  const [collapsed, setCollapsed] = useState(true);
  const [route, setRoute] = useState('/components/Card');

  return (
    <Column gap="md">
      <Switch checked={collapsed} onChange={setCollapsed} label="Collapsed" />
      <NavTree
        items={ROUTES}
        activeHref={route}
        onNavigate={item => setRoute(item.href)}
        groupIcons={GROUP_ICONS}
        collapsed={collapsed}
      />
    </Column>
  );
}
