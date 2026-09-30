---
title: EmptyState
description: Placeholder for empty results, first-run screens, and unavailable content.
source: "@plocks/ui"
status: "beta"
category: feedback
accessibility: "The root has no landmark role. Set Title order to expose a heading; actions keep their own accessible names."
related:
  - "Icon"
  - "Text"
props:
  - name: "align"
    type: "'center' | 'start' | 'end'"
    description: "Places the message and optional indicator."
    default: "center"
  - name: "variant"
    type: "'filled' | 'light'"
    description: "Colored indicator background."
  - name: "size"
    type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'"
    description: "Scales indicator, spacing, and text."
    default: "md"
examples:
  - basic
  - compound
  - variants
---

Use shorthand content for a simple placeholder, or compound members for custom layout and actions.
