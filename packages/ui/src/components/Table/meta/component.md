---
playground: true
title: Table
description: Simple semantic table primitive for lightweight tabular layouts.
source: ui/src/components/Table
status: experimental
category: data
tags: [table, layout, semantic]
examples: []
---

The Table component offers a minimal semantic wrapper (thead, tbody, tr, th, td) useful for simple static tabular data when the full DataTable is unnecessary.

## Accessibility

`Table` renders with the `table` role, sections as `rowgroup`, `Table.Tr` as `row`, `Table.Th` as `columnheader` and `Table.Td` as `cell` (override any of them with `role`). A string `caption` in `data` mode names the table. `highlightOnHover` highlights rows through hover state (theme hover fill), and a `Table.Tr` with `onPress` becomes a focusable, pressable row.

Cell `align` values follow the layout direction: `left` is the leading edge and `right` the trailing edge, so columns mirror in RTL.
