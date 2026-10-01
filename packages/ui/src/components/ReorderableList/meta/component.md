---
name: ReorderableList
description: Reorder a controlled list by dragging or using accessible move controls
category: data
subcategory: Data
tags: [list, reorder, drag, sort]
status: beta
playground: true
platform:
  web: true
  ios: true
  android: true
accessibility:
  - Arrow keys move items on web
  - Screen reader move actions on native
examples:
  basic: Reorder tasks
---

ReorderableList accepts an ordered `data` array and calls `onReorder({ data, from, to })` after a move. Update your state with the returned array. On native, long press the handle to drag; on web, drag a row or focus its handle and press Up or Down. Native drag gestures need `GestureHandlerRootView` at the application root.

Use `scrollEnabled={false}` for short native lists embedded in a parent ScrollView. Set `w="100%"` when placing the list in a column that aligns children to the start.
