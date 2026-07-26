import React from 'react';
import { View } from 'react-native';
import {
  Text,
  Column,
  Badge,
  Divider,
  CodeBlock,
} from '@platform-blocks/ui';
import { PageLayout } from 'components';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { SoundExample } from '../../components/examples/SoundExample';
import AccessibilityDemoWithProvider from '../../components/examples/AccessibilityDemo';

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <Column gap="xs">
    {items.map((item, index) => (
      <Text key={`${item}-${index}`} variant="p">
        • {item}
      </Text>
    ))}
  </Column>
);

const keyboardFeatures = [
  'Every interactive component participates in a predictable tab order and preserves visible focus outlines across light and dark themes.',
  'Dialogs, Spotlights, Dropdowns, and Menus trap focus while open and restore it to the triggering control when they close.',
  'Scoped and global keyboard shortcuts are defined with `useHotkeys` / `useGlobalHotkeys`, with optional `aria-live` announcements for critical actions.',
];

const assistiveFeatures = [
  'Buttons, links, inputs, and composite widgets expose consistent `accessibilityRole`, `accessibilityLabel`, and `aria-*` attributes on web and native platforms.',
  'Spotlight and navigation lists announce active options while you move with the arrow keys or screen-reader rotor.',
  'Semantic heading structure is enforced through typography variants and `useTitleRegistration`, ensuring the documentation table of contents mirrors the DOM outline.',
];

const visualFeatures = [
  'The design tokens maintain WCAG AA contrast ratios (4.5:1 or higher) for body text and interactive states in both color schemes.',
  'Highlight backgrounds adapt automatically to surrounding foreground colors, so inline emphasis remains legible on both dark and light surfaces.',
  'Component spacing, typography scales, and layout primitives support dynamic type and zoom without breaking line wraps or truncating controls.',
];

const motionFeatures = [
  'Animations, shimmer effects, and transitions read the system `prefers-reduced-motion` flag using `usePrefersReducedMotion`, gracefully disabling non-essential motion.',
  'Tactile interactions use the `useHaptics` hook and can be toggled off centrally for users who prefer silent interactions.',
  'Auditory cues route through the `SoundProvider`, allowing global enable/disable controls and volume adjustments.',
];

const guidanceResources = [
  'WCAG 2.1 AA alignment drives our component acceptance criteria and manual review checklists.',
  'ARIA Authoring Practices are referenced for complex widgets such as accordions, tabs, and tree views.',
  'Testing flows incorporate keyboard-only walkthroughs, VoiceOver / TalkBack smoke tests, and contrast analysis with tooling like Axe and Lighthouse.',
];

const exampleSnippet = `import { Button, useSpotlightToggle } from '@platform-blocks/ui';

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

const AccessibilityPage = () => {
  return (
    <PageLayout>
      <View style={{ maxWidth: 900, width: '100%', alignSelf: 'center' }}>
        <Column gap="2xl">
          <Column gap="md">
            <DocsPageHeader>Accessibility at Platform Blocks</DocsPageHeader>
            <Text variant="p" colorVariant="secondary">
              Inclusive design is a baseline requirement across the Platform Blocks library and documentation site. This page gathers the guardrails, utilities, and testing practices that help us meet WCAG 2.1 AA expectations for keyboard, screen reader, low-vision, and motion-sensitive users.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Badge variant="outline" color="primary">WCAG 2.1 AA</Badge>
              <Badge variant="outline" color="secondary">Keyboard First</Badge>
              <Badge variant="outline" color="success">Screen Reader Support</Badge>
              <Badge variant="outline" color="warning">Reduced Motion Ready</Badge>
            </View>
          </Column>

          <Column gap="xl">
            <Column gap="md">
              <Text variant="h2">Keyboard & Focus Management</Text>
              <Text variant="p" colorVariant="secondary">
                Platform Blocks is fully operable without a mouse. Focus order mirrors visual layout and shortcuts are discoverable and customizable.
              </Text>
              <BulletList items={keyboardFeatures} />
            </Column>

            <Column gap="md">
              <Text variant="h2">Assistive Technology Semantics</Text>
              <Text variant="p" colorVariant="secondary">
                Components expose reliable roles, names, and states so VoiceOver, TalkBack, NVDA, and other assistive tools can correctly interpret the UI.
              </Text>
              <BulletList items={assistiveFeatures} />
            </Column>

            <Column gap="md">
              <Text variant="h2">Visual Accessibility</Text>
              <Text variant="p" colorVariant="secondary">
                Color, typography, and spacing tokens are engineered for clarity, even under high contrast, zoom, or theme overrides.
              </Text>
              <BulletList items={visualFeatures} />
            </Column>

            <Column gap="md">
              <Text variant="h2">Motion, Audio, & Sensory Preferences</Text>
              <Text variant="p" colorVariant="secondary">
                Micro-interactions respect user comfort and can be tuned or disabled globally.
              </Text>
              <BulletList items={motionFeatures} />
            </Column>

            <Column gap="md">
              <Text variant="h2">Design & QA Workflow</Text>
              <Text variant="p" colorVariant="secondary">
                Accessibility is woven into the release checklist with dedicated reviews and automated tooling.
              </Text>
              <BulletList items={guidanceResources} />
            </Column>
          </Column>

          <Column gap="md">
            <Text variant="h2">Applying Accessible APIs</Text>
            <Text variant="p" colorVariant="secondary">
              Components forward platform accessibility props, letting you layer contextual hints or ARIA attributes without losing built-in behaviour.
            </Text>
            <CodeBlock language="tsx" spoiler={false}>
              {exampleSnippet}
            </CodeBlock>
          </Column>

          <Divider />

          <Column gap="lg">
            <Text variant="h2">Interactive Checks</Text>
            <Text variant="p" colorVariant="secondary">
              Explore the sensory feedback controls and focus-management demo below to see these principles in action.
            </Text>
            <SoundExample />
            <AccessibilityDemoWithProvider />
          </Column>

          <Text variant="p" colorVariant="muted">
            Have an accessibility request or need help auditing a flow? Open an issue on GitHub or ask in Discord so we can collaborate on an inclusive solution.
          </Text>
        </Column>
      </View>
    </PageLayout>
  );
};

export default AccessibilityPage;