---
title: Filterable list
category: basics
order: 10
tags: [combobox, listbox, keyboard, aria-activedescendant]
status: stable
hidden: false
---

Type to filter. ↑/↓ move the highlight (skipping disabled options, and wrapping unless `loop: false`), PageUp/PageDown jump by `pageSize` (default 10), and Enter picks the highlighted option. You own the highlight: pass `activeIndex` / `onActiveChange`, `onSelect`, `getId(i)` and `listId`, then spread the returned `inputProps` (combobox role, `aria-expanded`, `aria-controls`, `aria-activedescendant`), `listProps` and `getOptionProps(i)`. react-native-web reports a `TextInput`'s keys through `onKeyPress`, so the demo moves `inputProps.onKeyDown` there; you can also call `handleKeyDown` yourself. For a popup list, pass `opened`, `onOpen` (↑/↓ open it) and `onClose` (Escape closes it), and set `homeEndKeys` for pickers that have no text caret.
