import React, { useState } from 'react';
import { Badge, NavTree, type NavTreeItem } from '@platform-blocks/ui';

const ROUTES: NavTreeItem[] = [
  { label: 'Button', href: '/components/Button', group: 'Input' },
  { label: 'Select', href: '/components/Select', group: 'Input' },
  { label: 'Checkbox', href: '/components/Checkbox', group: 'Input' },
  { label: 'Card', href: '/components/Card', group: 'Display' },
  { label: 'Badge', href: '/components/Badge', group: 'Display' },
  { label: 'Tabs', href: '/components/Tabs', group: 'Navigation' },
];

export function Demo() {
  const [route, setRoute] = useState('/components/Card');

  return (
    <NavTree
      items={ROUTES}
      activeHref={route}
      onNavigate={item => setRoute(item.href)}
      // Curate the order that matters and let the rest sort themselves.
      groupOrder={['Input', 'Display']}
      openDepth={0}
      renderEndSection={node =>
        node.children ? <Badge size="xs" variant="light">{node.children.length}</Badge> : null
      }
    />
  );
}
