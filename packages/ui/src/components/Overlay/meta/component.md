---
playground: true
title: Overlay
description: Dim or highlight areas of the interface with configurable color, opacity, gradients, and blur.
source: "@platform-blocks/react-ui-library"
status: "beta"
category: overlay
accessibility: "Non-interactive layer; ensure interactive overlays include appropriate focus management and keyboard escape affordances."
variants:
  - name: "basic"
    description: "Default overlay with optional blur, gradients, and centered content."
dependencies:
  - "@platform-blocks/core"
related:
  - "Dialog"
  - "Tooltip"
  - "Spotlight"
props:
  - name: "color"
    type: "string"
    description: "Background tint color. Accepts raw CSS values or theme tokens like `dark.9`."
  - name: "opacity"
    type: "number"
    description: "Opacity applied to the background color. Defaults to 0.6."
  - name: "backgroundOpacity"
    type: "number"
    description: "Opacity applied to the entire overlay, including gradients and blur effects. Defaults to 1."
  - name: "gradient"
    type: "string"
    description: "CSS gradient string applied on web. Native platforms fall back to the `color` value."
  - name: "blur"
    type: "number"
    description: "Backdrop blur radius in pixels (web only)."
  - name: "radius"
    type: "SizeValue | number"
    description: "Corner radius for the overlay surface. Accepts theme radius tokens or raw numbers."
  - name: "zIndex"
    type: "number"
    description: "Applies a custom z-index to the overlay container."
  - name: "fixed"
    type: "boolean"
    description: "Uses viewport-fixed positioning on web instead of absolute fill."
  - name: "center"
    type: "boolean"
    description: "Centers children horizontally and vertically within the overlay."
  - name: "style"
    type: "StyleProp<ViewStyle>"
    description: "Additional style overrides merged after computed overlay styles."
  - name: "children"
    type: "ReactNode"
    description: "Optional content rendered inside the overlay."
---

The Overlay component provides a utility for dimming background content or drawing focus to foreground elements. It supports theme-aware colors, configurable opacity, gradients, and blur to achieve anything from subtle scrims to dramatic glassmorphism. Because Overlay is non-interactive by default, pair it with focus traps or dismiss controls when building dialogs, sheets, or other blocking surfaces.
