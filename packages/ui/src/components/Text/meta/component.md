---
name: Text
description: A versatile text component with typography variants, colors, and styling options
category: typography
subcategory: Typography
tags: [text, typography, content, display]
status: stable
since: 1.0.0
playground: true
platform:
  web: true
  ios: true
  android: true
accessibility:
  - Screen reader compatible
  - Semantic HTML elements
  - Proper text contrast
related:
  - Heading
  - Label
  - Caption
examples:
  basic: Basic text usage and variants
  colors: Text color variations
  sizes: Different text sizes
  weights: Font weight (`fw`)
  heights: Line height (`lh`)
  tracking: Letter spacing (`lts`)
  ff: Font family (`ff`)
  tt: Text transform (`tt="uppercase"`, `"lowercase"`, `"capitalize"`)
  decoration: Font style and decoration (`fs="italic"`, `td="underline"`, `td="line-through"`)
  textRole: Theme text role — `panelTitle`, `sectionLabel`, or one your theme adds (`theme.textRoles`); explicit props still win
---

Render typography with various variants, colors, and styling options for displaying content.