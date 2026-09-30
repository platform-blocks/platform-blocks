---
title: EmojiPicker
description: Searchable emoji picker for chats, reactions, and other Unicode emoji selection.
source: "@plocks/emoji-picker"
status: "beta"
category: input
tags: [emoji, reactions, chat, picker, search]
accessibility: "Search field, category tabs, skin tone buttons, and individually named emoji buttons."
related:
  - "Input"
  - "Popover"
  - "Dialog"
props:
  - name: "onSelect"
    type: "(selection: EmojiPickerSelection) => void"
    description: "Receives the selected Unicode emoji and its metadata."
  - name: "emojis"
    type: "EmojiPickerItem[]"
    description: "Replace the built-in catalog with app-specific emoji."
  - name: "categoryLabels"
    type: "Record<string, string>"
    description: "Labels for custom category keys."
  - name: "skinTone / defaultSkinTone"
    type: "0 | 1 | 2 | 3 | 4 | 5"
    description: "Controlled or initial skin tone. Zero uses the default emoji."
  - name: "onSkinToneChange"
    type: "(tone: EmojiSkinTone) => void"
    description: "Called when a skin tone is selected."
  - name: "recent / defaultRecent"
    type: "string[]"
    description: "Controlled or initial list of recently selected Unicode emoji."
  - name: "onRecentChange"
    type: "(recent: string[]) => void"
    description: "Called when recent selections change; save this in the host app for persistence."
  - name: "maxRecent"
    type: "number"
    description: "Maximum recent selections kept."
    default: 24
  - name: "searchPlaceholder"
    type: "string"
    description: "Search field placeholder and accessible name."
  - name: "emptyText"
    type: "string"
    description: "Text shown when a search has no matches."
---

EmojiPicker lets users browse and select Unicode emoji.
