---
title: Flex
description: A flexible layout component based on CSS Flexbox for arranging children with customizable direction, alignment, justification, and spacing.
source: "@platform-blocks/ui"
status: "stable"
category: layout
accessibility: "Semantic layout structure with proper focus management and screen reader support"
variants:
  - name: "basic"
    description: "Simple flex container with default settings and gap spacing"
  - name: "direction"
    description: "Row and column direction layouts for different arrangements"
  - name: "justify"
    description: "Content justification options along the main axis"
  - name: "align"
    description: "Item alignment options along the cross axis"
dependencies:
  - "@platform-blocks/core"
related:
  - "Column"
  - "Row"
  - "Stack"
  - "Grid"
props:
  - name: "direction"
    type: "'row' | 'column' | 'row-reverse' | 'column-reverse'"
    description: "Main axis direction for child arrangement"
  - name: "justify"
    type: "'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'"
    description: "Content justification along the main axis"
  - name: "align"
    type: "'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'"
    description: "Item alignment along the cross axis"
  - name: "wrap"
    type: "'nowrap' | 'wrap' | 'wrap-reverse'"
    description: "Whether items should wrap to new lines"
  - name: "gap"
    type: "number | string"
    description: "Space between child elements"
  - name: "grow"
    type: "number"
    description: "Flex grow factor"
  - name: "shrink"
    type: "number"
    description: "Flex shrink factor"
  - name: "style"
    type: "ViewStyle"
    description: "Additional style properties"
---

Flex provides a powerful and intuitive way to create flexible layouts using CSS Flexbox principles. It handles spacing, alignment, and direction with a clean API that works consistently across platforms.
