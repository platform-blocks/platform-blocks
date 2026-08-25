---
title: Stepper
description: A component for displaying step-by-step navigation and progress
source: ui/src/components/Stepper
status: stable
category: navigation
playground: true
props:
  - name: active
    type: number
    description: Index of the currently active step
    default: 0
  - name: children
    type: ReactNode
    description: Stepper.Step components
  - name: orientation
    type: string
    description: Stepper orientation
    default: horizontal
  - name: size
    type: string
    description: Size variant
    default: md
  - name: allowSelectClick
    type: boolean
    description: Allow clicking on steps to navigate
    default: false
  - name: onStepClick
    type: function
    description: Callback when a step is clicked
  - name: color
    type: string
    description: Color theme for active step
    default: primary
  - name: "Stepper.Step labelProps"
    type: "Omit<TextProps, 'children'>"
    description: "Override props applied to each step's label `<Text>` (style, weight, ff, size, colorVariant)."
  - name: "Stepper.Step descriptionProps"
    type: "Omit<TextProps, 'children'>"
    description: "Override props applied to each step's description `<Text>`."
examples:
  - basic
  - vertical
  - sizes
  - loading
  - customIcons
  - allowSelect
---

The Stepper component provides a step-by-step navigation interface, perfect for multi-step forms, wizards, and progress tracking.
