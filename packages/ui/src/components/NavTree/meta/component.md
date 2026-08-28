---
name: NavTree
title: NavTree
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
examples:
  - basic
  - counts
  - search
  - collapsed
since: 1.1.0
---

A sidebar that nests itself.

Hand it the flat list of routes an app already has — with a category on each — and it groups, orders and renders them as a tree. The branches above the current page open on their own, the row for that page is marked and scrolled to, and which branches are open survives a reload.

Rows carrying an `href` render as real `<a>` elements on web, so cmd-click, middle-click, "copy link address" and crawlers all work; a plain left-click goes to `onNavigate` for client-side routing. Omit `onNavigate` and the rows stay ordinary links the browser follows.

Built on [Tree](/components/Tree), so keyboard navigation, guide lines, filtering and the ARIA `tree`/`treeitem` roles come along with it.
