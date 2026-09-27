---
title: Heights
category: usage
order: 50
tags: [line-height, spacing]
status: stable
since: 1.0.0
hidden: false
---

Line height control for text content using the `lineHeight` prop.

## Usage

The `lineHeight` prop accepts:
- **Multipliers** (e.g., `1.5`) - multiplied by the font size
- **Absolute values** (e.g., `24`) - treated as pixel values when > 3

```tsx
<Text lineHeight={1.2}>Tight line height</Text>
<Text lineHeight={1.5}>Normal line height</Text>
<Text lineHeight={24}>Absolute line height (24px)</Text>
```

This provides precise control over text spacing and readability.
