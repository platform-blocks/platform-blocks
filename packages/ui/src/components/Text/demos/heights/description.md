---
title: Heights
category: usage
order: 50
tags: [lh, line-height, spacing]
status: stable
hidden: false
---

Set line height with `lh`.

## Usage

`lh` accepts:
- **Multipliers** (e.g., `1.5`) - multiplied by the font size
- **Absolute values** (e.g., `24`) - treated as pixel values when > 3

```tsx
<Text lh={1.2}>Tight line height</Text>
<Text lh={1.5}>Normal line height</Text>
<Text lh={24}>Absolute line height (24px)</Text>
```

This provides precise control over text spacing and readability.
