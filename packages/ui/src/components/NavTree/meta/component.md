---
name: NavTree
title: NavTree
summary: Sidebar navigation that groups a flat list of routes into a collapsible tree, opening and marking the current page
category: navigation
tags: [navigation, sidebar, tree, menu, routes]
playground: true
props:
  items: Flat list of `{ label, href, group?, icon?, order?, disabled?, data? }` destinations
  activeHref: Current route — marks its row, opens the groups above it, scrolls it into view
  onNavigate: Called with the original item on a row press; omit it to leave rows as plain links
  group: Per item — the grouping path, outermost first (`'Input'` or `['Components', 'Input']`)
  groupOrder: Curated order for group labels; anything unlisted follows alphabetically
  groupIcons: Leading icon per group label
  sortLeaves: '`alpha` (default) or `none` to keep the given order'
  openDepth: Groups shallower than this start open (default 1 — top level open, categories closed)
  openGroups: Group labels or `A/B` paths to open regardless of depth
  getGroupNode: Decorate each group row — counts, badges, an index `href`
  collapsed: Rail mode — only the top level renders, as icons
  searchable: Show a filter field above the tree, wired to `filterQuery`
  searchPlaceholder: Placeholder for the filter field
  highlightMatches: Mark the matched substring in row labels (default true)
  persistKey: Remember which branches are open across reloads (web)
  size: Row density
  renderLabel: Custom row label — `(node, depth, isOpen, state) => ReactNode`, as on Tree
examples:
  - basic
  - counts
  - search
  - collapsed
---

NavTree turns a flat route list into a collapsible sidebar navigation tree.
