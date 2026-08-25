---
playground: true
title: Tree
category: navigation
description: A hierarchical tree component for displaying nested data structures with expand/collapse functionality, selection, and filtering capabilities.
package: platform-blocks
since: 1.0.0
---

Tree component for displaying hierarchical data structures like file systems, navigation menus, or any nested content. Supports expansion/collapse, single/multiple/range selection, cascading checkboxes, filtering with highlight, lazy-loaded branches, guide lines, density steps, and custom row rendering.

Rows come from a flat list of everything currently visible, which is also what keyboard navigation, range selection, striping and virtualization read from. On web the tree exposes `tree`/`treeitem` roles with roving focus and supports arrow-key navigation, Home/End, Enter, Space, type-ahead, and Cmd/Ctrl+A in multiple-selection mode.
