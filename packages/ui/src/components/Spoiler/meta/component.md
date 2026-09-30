---
playground: true
title: Spoiler
summary: Collapses content taller than `mah` behind a show more / show less toggle
description: A component that collapses overflowing content beyond a specified height
source: ui/src/components/Spoiler
status: stable
category: display
props:
  - name: children
    type: ReactNode
    description: Content to be shown/hidden
  - name: mah
    type: number
    description: Height the content collapses to (the content's, not the root's)
    default: 120
  - name: showLabel
    type: string
    description: Text for the show more button
    default: Show more
  - name: hideLabel
    type: string
    description: Text for the show less button
    default: Hide
  - name: defaultExpanded
    type: boolean
    description: Whether the spoiler starts expanded when uncontrolled
    default: false
  - name: transitionDuration
    type: number
    description: Animation duration in milliseconds. `0` disables the transition.
    default: 180
  - name: size
    type: SizeValue
    description: Size token for the show/hide control font size
    default: sm
  - name: expanded
    type: boolean
    description: Controlled expanded state. Pair with `onExpandedChange`.
  - name: onExpandedChange
    type: (expanded: boolean) => void
    description: Called with the requested expanded state whenever the control is pressed
  - name: disabled
    type: boolean
    description: Disables the show/hide control
    default: false
  - name: renderControl
    type: "(args: { expanded, toggle, showLabel, hideLabel }) => ReactNode"
    description: Render a custom control in place of the default text button
  - name: transparentFade
    type: boolean
    description: Fade the bottom of clamped content to transparent with a CSS mask. Web only.
    default: true
  - name: fadeColor
    type: string
    description: End color of the fallback overlay gradient. Web only, and used only when `transparentFade` is false.
  - name: disableFadeAnimation
    type: boolean
    description: Render the fade at its end state instead of animating it
    default: false
  - name: controlProps
    type: "Omit<TextProps, 'children'>"
    description: Override props applied to the show/hide control `<Text>` (style, fw, ff, size, c)
examples:
  - basic
  - sizes
  - newspaper
  - customControl
  - defaultExpanded
  - control-customization
---

Spoiler collapses long content behind a show or hide control.
