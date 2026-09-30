---
playground: true
title: Spotlight
description: Global command palette for fuzzy searching and executing actions.
source: ui/src/components/Spotlight
status: experimental
category: navigation
tags: [command-palette, search, quick actions]
examples: []
accessibility: "A modal dialog (focus moves to the search field, Tab is trapped, Escape / Android back close it and focus returns to the opener). The search field is a combobox controlling a listbox of options; Arrow keys move a virtual highlight announced through aria-activedescendant, Enter runs the highlighted (or first) action."
---

Spotlight provides a searchable command palette for actions, routes, and other items.
