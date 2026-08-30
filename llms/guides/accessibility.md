# Accessibility at React UI Library

Inclusive design is a baseline requirement across the React UI Library library and documentation site. This page gathers the guardrails, utilities, and testing practices that help us meet WCAG 2.1 AA expectations for keyboard, screen reader, low-vision, and motion-sensitive users.

Docs: https://react-ui-library.com/accessibility

## Keyboard & Focus Management

React UI Library is fully operable without a mouse. Focus order mirrors visual layout and shortcuts are discoverable and customizable.

- Every interactive component participates in a predictable tab order and preserves visible focus outlines across light and dark themes.
- Dialogs, Spotlights, Dropdowns, and Menus trap focus while open and restore it to the triggering control when they close.
- Scoped and global keyboard shortcuts are defined with `useHotkeys` / `useGlobalHotkeys`, with optional `aria-live` announcements for critical actions.

## Assistive Technology Semantics

Components expose reliable roles, names, and states so VoiceOver, TalkBack, NVDA, and other assistive tools can correctly interpret the UI.

- Buttons, links, inputs, and composite widgets expose consistent `accessibilityRole`, `accessibilityLabel`, and `aria-*` attributes on web and native platforms.
- Spotlight and navigation lists announce active options while you move with the arrow keys or screen-reader rotor.
- Semantic heading structure is enforced through typography variants and `useTitleRegistration`, ensuring the documentation table of contents mirrors the DOM outline.

## Visual Accessibility

Color, typography, and spacing tokens are engineered for clarity, even under high contrast, zoom, or theme overrides.

- The design tokens maintain WCAG AA contrast ratios (4.5:1 or higher) for body text and interactive states in both color schemes.
- Highlight backgrounds adapt automatically to surrounding foreground colors, so inline emphasis remains legible on both dark and light surfaces.
- Component spacing, typography scales, and layout primitives support dynamic type and zoom without breaking line wraps or truncating controls.

## Motion, Audio, & Sensory Preferences

Micro-interactions respect user comfort and can be tuned or disabled globally.

- Animations, shimmer effects, and transitions read the system `prefers-reduced-motion` flag using `usePrefersReducedMotion`, gracefully disabling non-essential motion.
- Tactile interactions use the `useHaptics` hook and can be toggled off centrally for users who prefer silent interactions.
- Auditory cues route through the `SoundProvider`, allowing global enable/disable controls and volume adjustments.

## Design & QA Workflow

Accessibility is woven into the release checklist with dedicated reviews and automated tooling.

- WCAG 2.1 AA alignment drives our component acceptance criteria and manual review checklists.
- ARIA Authoring Practices are referenced for complex widgets such as accordions, tabs, and tree views.
- Testing flows incorporate keyboard-only walkthroughs, VoiceOver / TalkBack smoke tests, and contrast analysis with tooling like Axe and Lighthouse.

## Applying Accessible APIs

Components forward platform accessibility props, letting you layer contextual hints or ARIA attributes without losing built-in behaviour.

```tsx
import { Button, useSpotlightToggle } from '@platform-blocks/react-ui-library';

export function AccessibleSearchTrigger() {
  const { open } = useSpotlightToggle();

  return (
    <Button
      onPress={open}
      icon="spotlight"
      accessibilityLabel="Open command palette"
      accessibilityHint="Press to search components, pages, and actions"
    >
      Command Palette
    </Button>
  );
}
```

Have an accessibility request or need help auditing a flow? Open an issue on GitHub or ask in Discord so we can collaborate on an inclusive solution.
