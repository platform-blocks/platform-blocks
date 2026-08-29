import React, { useState } from 'react';
import { NavTree, type NavTreeItem } from '@platform-blocks/ui';

// The whole input: a flat list, with a category on each row. Nothing here
// describes the tree — `NavTree` derives it.
const ROUTES: NavTreeItem[] = [
  { label: 'Getting Started', href: '/getting-started' },
  { label: 'Button', href: '/components/Button', group: ['Components', 'Input'] },
  { label: 'Select', href: '/components/Select', group: ['Components', 'Input'] },
  { label: 'Checkbox', href: '/components/Checkbox', group: ['Components', 'Input'] },
  { label: 'Card', href: '/components/Card', group: ['Components', 'Display'] },
  { label: 'Badge', href: '/components/Badge', group: ['Components', 'Display'] },
  { label: 'Tabs', href: '/components/Tabs', group: ['Components', 'Navigation'] },
];

export function Demo() {
  const [route, setRoute] = useState('/components/Select');

  return (
    <NavTree
      items={ROUTES}
      activeHref={route}
      onNavigate={item => setRoute(item.href)}
      showGuides
    />
  );
}
