---
title: AppShell
category: layout
---

# AppShell

High-level layout container orchestrating header, navigation rail/drawer, aside panel, footer, and optional mobile bottom navigation. Provides consistent responsive behavior and safe-area handling across platforms.

## Responsibilities
- Manage responsive breakpoints & derive layout measurements
- Provide context for child sections (header height, navbar width, etc.)
- Support desktop inline collapsing (rail) and mobile drawer presentation
- Coordinate safe-area padding via `SafeAreaProvider`
- Offer configurable animation duration for structural transitions

## Public Sub-Components
- `AppShell.Header` – fixed header region at top
- `AppShell.Navbar` – left navigation (rail / drawer)
- `AppShell.Aside` – right supplemental panel
- `AppShell.Footer` – bottom footer (desktop)
- `AppShell.BottomNav` – mobile-only bottom navigation bar
- `AppShell.Main` – primary scroll/content surface
- `AppShell.Section` – helper container for vertical stacking inside panels

## Key Hooks
- `useAppShell()` – consume computed layout context
- `useBreakpoint()` – current breakpoint token
- `useNavbarHover()` – desktop rail hover expansion state
- `resolveResponsiveValue(value, breakpoint)` – utility to normalize `ResponsiveSize`

## Default Config Reference
See `defaults.ts` for baseline dimension & behavior values and `meta.schema.ts` for a lightweight machine-readable spec.

## Notes
- Hover expansion is intentionally local to navbar to avoid global re-renders
- Rail width defined via `navbar.collapsedWidth` (default 72)
- Future: integrate design token pipeline for breakpoint map & spacing scales.
- `AppShell.Main` supports configurable `maxWidth`, centering, and responsive table-of-contents rail. When `autoLayout` is enabled you can pass `maxContentWidth`, `centerContent`, and table of contents props directly to `AppShell` for convenience.
