/**
 * Plain-data source of truth for the Accessibility page.
 *
 * JSX-free (like config/faq.ts and config/gettingStarted.ts) so the same copy
 * feeds both the screen and scripts/generate-llms.ts, which renders it into
 * /llms/guides/accessibility.md.
 */

export interface AccessibilitySection {
  title: string;
  lead: string;
  items: string[];
}

export const ACCESSIBILITY_TITLE = 'Accessibility at React UI Library';

export const ACCESSIBILITY_INTRO =
  'Inclusive design is a baseline requirement across the React UI Library library and documentation site. This page gathers the guardrails, utilities, and testing practices that help us meet WCAG 2.1 AA expectations for keyboard, screen reader, low-vision, and motion-sensitive users.';

export interface AccessibilityBadge {
  label: string;
  color: 'primary' | 'secondary' | 'success' | 'warning';
}

export const ACCESSIBILITY_BADGES: AccessibilityBadge[] = [
  { label: 'WCAG 2.1 AA', color: 'primary' },
  { label: 'Keyboard First', color: 'secondary' },
  { label: 'Screen Reader Support', color: 'success' },
  { label: 'Reduced Motion Ready', color: 'warning' },
];

export const ACCESSIBILITY_SECTIONS: AccessibilitySection[] = [
  {
    title: 'Keyboard & Focus Management',
    lead: 'React UI Library is fully operable without a mouse. Focus order mirrors visual layout and shortcuts are discoverable and customizable.',
    items: [
      'Every interactive component participates in a predictable tab order and preserves visible focus outlines across light and dark themes.',
      'Dialogs, Spotlights, Dropdowns, and Menus trap focus while open and restore it to the triggering control when they close.',
      'Scoped and global keyboard shortcuts are defined with `useHotkeys` / `useGlobalHotkeys`, with optional `aria-live` announcements for critical actions.',
    ],
  },
  {
    title: 'Assistive Technology Semantics',
    lead: 'Components expose reliable roles, names, and states so VoiceOver, TalkBack, NVDA, and other assistive tools can correctly interpret the UI.',
    items: [
      'Buttons, links, inputs, and composite widgets expose consistent `accessibilityRole`, `accessibilityLabel`, and `aria-*` attributes on web and native platforms.',
      'Spotlight and navigation lists announce active options while you move with the arrow keys or screen-reader rotor.',
      'Semantic heading structure is enforced through typography variants and `useTitleRegistration`, ensuring the documentation table of contents mirrors the DOM outline.',
    ],
  },
  {
    title: 'Visual Accessibility',
    lead: 'Color, typography, and spacing tokens are engineered for clarity, even under high contrast, zoom, or theme overrides.',
    items: [
      'The design tokens maintain WCAG AA contrast ratios (4.5:1 or higher) for body text and interactive states in both color schemes.',
      'Highlight backgrounds adapt automatically to surrounding foreground colors, so inline emphasis remains legible on both dark and light surfaces.',
      'Component spacing, typography scales, and layout primitives support dynamic type and zoom without breaking line wraps or truncating controls.',
    ],
  },
  {
    title: 'Motion, Audio, & Sensory Preferences',
    lead: 'Micro-interactions respect user comfort and can be tuned or disabled globally.',
    items: [
      'Animations, shimmer effects, and transitions read the system `prefers-reduced-motion` flag using `usePrefersReducedMotion`, gracefully disabling non-essential motion.',
      'Tactile interactions use the `useHaptics` hook and can be toggled off centrally for users who prefer silent interactions.',
      'Auditory cues route through the `SoundProvider`, allowing global enable/disable controls and volume adjustments.',
    ],
  },
  {
    title: 'Design & QA Workflow',
    lead: 'Accessibility is woven into the release checklist with dedicated reviews and automated tooling.',
    items: [
      'WCAG 2.1 AA alignment drives our component acceptance criteria and manual review checklists.',
      'ARIA Authoring Practices are referenced for complex widgets such as accordions, tabs, and tree views.',
      'Testing flows incorporate keyboard-only walkthroughs, VoiceOver / TalkBack smoke tests, and contrast analysis with tooling like Axe and Lighthouse.',
    ],
  },
];

export const ACCESSIBILITY_EXAMPLE_TITLE = 'Applying Accessible APIs';

export const ACCESSIBILITY_EXAMPLE_LEAD =
  'Components forward platform accessibility props, letting you layer contextual hints or ARIA attributes without losing built-in behaviour.';

export const ACCESSIBILITY_EXAMPLE_SNIPPET = `import { Button, useSpotlightToggle } from '@platform-blocks/react-ui-library';

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
}`;

export const ACCESSIBILITY_INTERACTIVE_TITLE = 'Interactive Checks';

export const ACCESSIBILITY_INTERACTIVE_LEAD =
  'Explore the sensory feedback controls and focus-management demo below to see these principles in action.';

export const ACCESSIBILITY_OUTRO =
  'Have an accessibility request or need help auditing a flow? Open an issue on GitHub or ask in Discord so we can collaborate on an inclusive solution.';
