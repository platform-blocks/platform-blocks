import React, { useState } from 'react';
import { NavTree, type NavTreeItem } from '@platform-blocks/ui';

const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Input' },
  { label: 'Checkbox', href: '/components/Checkbox', group: 'Input' },
  { label: 'Select', href: '/components/Select', group: 'Input' },
  { label: 'TextArea', href: '/components/TextArea', group: 'Input' },
  { label: 'Badge', href: '/components/Badge', group: 'Display' },
  { label: 'Card', href: '/components/Card', group: 'Display' },
  { label: 'Breadcrumbs', href: '/components/Breadcrumbs', group: 'Navigation' },
  { label: 'Tabs', href: '/components/Tabs', group: 'Navigation' },
];

export default function Demo() {
  const [route, setRoute] = useState('/components/Card');

  return (
    <NavTree
      items={ROUTES}
      activeHref={route}
      onNavigate={item => setRoute(item.href)}
      searchable
      searchPlaceholder="Filter components…"
    />
  );
}
