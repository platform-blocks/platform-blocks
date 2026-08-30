---
playground: true
title: Masonry
description: A masonry layout component that arranges items in columns with varying heights, creating a Pinterest-style layout using FlashList for optimal performance.
source: "@platform-blocks/react-ui-library"
status: "stable"
category: layout
accessibility: "Semantic layout structure with proper focus management and screen reader support for grid navigation"
variants:
  - name: "basic"
    description: "Simple masonry layout with default 2-column grid and uniform item heights"
  - name: "variable-heights"
    description: "Masonry layout with items of different heights creating organic staggered appearance"
  - name: "custom-columns"
    description: "Masonry with configurable number of columns for different screen sizes"
  - name: "with-loading"
    description: "Masonry layout with loading states and empty content handling"
dependencies:
  - "@shopify/flash-list"
  - "@platform-blocks/core"
related:
  - "Grid"
  - "Flex"
  - "Column"
  - "Row"
props:
  - name: "data"
    type: "MasonryItem[]"
    description: "Array of items to display in the masonry layout"
    required: true
  - name: "numColumns"
    type: "number"
    description: "Number of columns to arrange items in"
    default: 2
  - name: "gap"
    type: "SizeValue"
    description: "Spacing between masonry items"
    default: "'sm'"
  - name: "optimizeItemArrangement"
    type: "boolean"
    description: "Whether to optimize item arrangement for staggered grid layout"
    default: true
  - name: "renderItem"
    type: "(item: MasonryItem, index: number) => ReactNode"
    description: "Custom item renderer function"
  - name: "loading"
    type: "boolean"
    description: "Shows loading state with loader"
    default: false
  - name: "emptyContent"
    type: "ReactNode"
    description: "Custom content to show when no items are available"
  - name: "flashListProps"
    type: "Partial<FlashListProps>"
    description: "Additional props to pass to the underlying FlashList component"
  - name: "contentContainerStyle"
    type: "ViewStyle"
    description: "Style for the scroll content container"
  - name: "style"
    type: "ViewStyle"
    description: "Additional style properties for the main container"
  - name: "testID"
    type: "string"
    description: "Test identifier for testing frameworks"
---

Masonry provides an efficient way to create Pinterest-style layouts where items are arranged in columns with varying heights. Built on FlashList for optimal performance with large datasets, it automatically handles item positioning and provides smooth scrolling even with hundreds of items. The component supports dynamic heights through the heightRatio property on items, custom renderers, and responsive column counts. Perfect for image galleries, card layouts, or any scenario where you need an organic, space-efficient arrangement of content.