---
title: AppShell
category: layout
---

# AppShell

High-level layout container orchestrating header, navigation rail/drawer, aside panel, footer, and optional mobile bottom navigation. Provides consistent responsive behavior and safe-area handling across platforms.

## Responsibilities
- Derive layout measurements per breakpoint from the theme's breakpoint table (`theme.breakpoints`, hydration-safe viewport store)
- Provide context for child sections (header height, navbar width, etc.)
- Support desktop inline collapsing (rail) and mobile drawer presentation
- Coordinate safe-area padding via `SafeAreaProvider`
- Offer configurable animation duration for structural transitions

## Public Sub-Components
- `AppShell.Header` – fixed header region at top (`banner` landmark)
- `AppShell.Navbar` – start-side navigation, rail / drawer (`navigation` landmark, labelled "Main" by default)
- `AppShell.Aside` – end-side supplemental panel (`complementary` landmark)
- `AppShell.Footer` – bottom footer (`contentinfo` landmark)
- `AppShell.BottomNav` – mobile bottom navigation container
- `AppShell.BottomAppBar` – item-based bottom navigation bar
- `AppShell.Main` – primary scroll/content surface (`main` landmark)
- `AppShell.Section` – helper container for vertical stacking inside panels (`grow`, `withScrollArea`)
- `AppShell.MobileMenu` – modal navigation menu (`opened` / `onClose`)

## Key Hooks
- `useAppShell()` – consume computed layout context
- `useBreakpoint()` – current breakpoint token
- `useNavbarHover()` – desktop rail hover expansion state
- `resolveResponsiveValue(value, breakpoint)` – utility to normalize `ResponsiveSize`

## Default Config Reference
See `defaults.ts` for baseline dimension & behavior values and `meta.schema.ts` for a lightweight machine-readable spec.

## Notes
- Hover state lives in its own context, so hover expansion re-renders only its readers, never the page subtree
- Rail width defined via `navbar.collapsedWidth` (default 72); drawer below `navbar.breakpoint` (default `md`)
- Stacking comes from `theme.zIndices` (header `header`, rail/aside/footer `sticky`, drawer `overlay`)
- RTL: sections use logical `start`/`end` insets; the navbar sits on the start side
- Reduced motion makes all shell transitions instant
- `AppShell.Main` supports a configurable content width (`maw`), centering, and responsive table-of-contents rail. When `autoLayout` is enabled you can pass `maxContentWidth`, `centerContent`, and table of contents props directly to `AppShell` for convenience.
