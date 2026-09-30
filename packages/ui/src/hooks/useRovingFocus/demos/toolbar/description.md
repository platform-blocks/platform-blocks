---
title: Toolbar with one tab stop
category: basics
order: 10
tags: [keyboard, focus, toolbar]
status: stable
hidden: false
---

Tab reaches the toolbar once. ←/→ move between the buttons (wrapping at the ends, and swapped under RTL), Home/End jump to the first and last, and Tab leaves the group. `useRovingFocus({ count })` returns `getItemProps(i)` (`tabIndex`, `ref`, `onKeyDown`, `onFocus`) to spread on each item, plus `activeIndex`, `focusItem` and `handleKeyDown` for items that route keys themselves. Other options: `orientation` (`'vertical'`, or `'both'` with `columns` for a grid where ↑/↓ move by a row), `loop`, controlled `activeIndex` / `onActiveChange`, `isDisabled` to skip items, and `typeahead: (i) => label` to jump to an item by typing its first letters. Keys and DOM focus are web-only; on native the item props are inert apart from `tabIndex`.
