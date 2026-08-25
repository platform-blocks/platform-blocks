---
name: DataList
description: Display label/value pairs in a semantic description list with horizontal or vertical layout
category: data
subcategory: Data
tags: [datalist, description, definition, key-value, label, value, details]
status: stable
since: 0.10.1
playground: true
platform:
  web: true
  ios: true
  android: true
accessibility:
  - Screen reader compatible
  - Semantic label/value structure
related:
  - Table
  - DataTable
  - Timeline
examples:
  basic: Basic label/value pairs
  vertical: Vertical orientation
  dividers: Dividers between items
  sizes: Various sizes
  data: Data prop shorthand
---

DataList displays a set of label/value pairs, such as user details or metadata, in a clean, aligned layout. Compose items with `DataList.Item`, `DataList.ItemLabel`, and `DataList.ItemValue`, or pass a `data` array for a quick setup.
