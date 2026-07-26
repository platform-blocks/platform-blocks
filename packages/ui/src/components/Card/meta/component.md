---
name: Card
title: Card
category: layout
tags: [card, container, content, layout]
playground: true
props:
  variant: 'filled' (default) | 'outline' | 'elevated' | 'subtle' | 'ghost' | 'gradient'
  withBorder: Adds a 1px theme border on top of any variant
  borderColor: Custom border color (CSS string) — implies `withBorder`
  borderWidth: Custom border width in px — implies `withBorder`
  bg: Background override — accepts CSS color or theme palette name (`'primary' | 'gray' | 'success' | 'warning' | 'error' | 'secondary'`) → resolves to that palette's subtle shade. Also accepts `theme.backgrounds` keys (`'surface' | 'subtle' | 'elevated' | 'base'`).
  padding: Internal padding — size token ('xs'…'3xl') or pixel number
  clip: Clips children to the card's radius — use with full-bleed `Card.Section` content (off by default so menus/popovers can escape)
  radius: Corner radius (size token or number)
  shadow: Shadow token (overrides the variant's default shadow)
  onPress: Makes the card pressable; renders inside a `<Pressable>` with a pressed-state style
  disabled: Disables interaction + dims to 50%
examples:
  - basic
  - variants
  - border-and-bg
  - sections
subComponents:
  - name: Card.Section
    description: Sub-region that opts out of the parent Card's padding for full-bleed images, dividers, or banded content. Position-aware — first/last sections also escape top/bottom padding.
    props:
      withBorder: Adds a 1px theme divider — top border when not first, bottom border when not last
      inheritPadding: Adds the Card's horizontal padding back inside the section so inner content lines up
      py: Vertical padding inside the section (size token or px)
      px: Horizontal padding inside the section (overrides `inheritPadding`)
---
The Card component provides a flexible container for displaying content. Six variants (`filled`, `outline`, `elevated`, `subtle`, `ghost`, `gradient`) each set their own background + default shadow. `withBorder`, `borderColor`, `borderWidth`, and `bg` compose on top of any variant — Mantine-style — so you can mix and match (`<Card variant="elevated" withBorder bg="primary" />`) without forking a new variant for every combination.
