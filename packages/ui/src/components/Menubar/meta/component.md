---
title: Menubar
description: A horizontal group of menus for application commands.
source: "@plocks/ui"
status: "beta"
category: navigation
accessibility: "The root has menubar orientation. Targets are menuitems; Left/Right and Home/End move between them, with RTL direction reversal. Dropdowns use Menu keyboard navigation."
related:
  - "Menu"
props:
  - name: "trigger"
    type: "'click' | 'hover'"
    description: "How menus first open."
    default: "click"
  - name: "openIndex"
    type: "number | null"
    description: "Controlled open menu."
  - name: "loop"
    type: boolean
    description: "Wrap keyboard navigation."
    default: true
examples:
  - basic
---

Menubar wraps the existing Menu dropdowns and keeps only one menu open at a time.
