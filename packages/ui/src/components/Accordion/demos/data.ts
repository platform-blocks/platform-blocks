import React from 'react';
import { Text } from '@platform-blocks/ui';
import type { AccordionItemType } from '@platform-blocks/ui';

// Wrap body copy in <Text> without JSX so this stays a plain `.ts` data module
// (a `.tsx` sibling would be picked up as its own demo by the docs generator).
const body = (text: string) => React.createElement(Text, { size: 'sm' }, text);

export const faqItems: AccordionItemType[] = [
  {
    key: 'foundation',
    title: 'What is Platform Blocks?',
    content: body('A cross-platform design system for shipping polished React Native apps faster.'),
  },
  {
    key: 'benefits',
    title: 'Why use an accordion?',
    content: body('Keep dense guidance scannable while letting readers expand only what they need.'),
  },
  {
    key: 'next-steps',
    title: 'How do I get started?',
    content: body('Install the package, drop the provider at the root, and follow the onboarding checklist.'),
  },
];

export const knowledgeBase: AccordionItemType[] = [
  {
    key: 'collaboration',
    title: 'Invite collaborators',
    content: body('Share the project with teammates to co-author docs and keep decisions centralized.'),
  },
  {
    key: 'appearance',
    title: 'Customize the theme',
    content: body('Extend the default theme tokens with your brand colors and typography.'),
  },
  {
    key: 'automation',
    title: 'Automate release notes',
    content: body('Connect the changelog generator to auto-publish updates on every tag.'),
  },
];

export const onboardingSteps: AccordionItemType[] = [
  {
    key: 'create-project',
    title: 'Create a project',
    content: body('Spin up a workspace and invite your teammates.'),
  },
  {
    key: 'import-assets',
    title: 'Import assets',
    content: body('Upload icons, typography, and spacing tokens.'),
  },
];

export const statusItems: AccordionItemType[] = [
  {
    key: 'info',
    title: 'Informational',
    color: 'primary',
    content: body('Set `color` per item to accent its expanded panel.'),
  },
  {
    key: 'healthy',
    title: 'All systems healthy',
    color: 'success',
    content: body('The title and chevron pick up the color while open.'),
  },
  {
    key: 'review',
    title: 'Needs review',
    color: 'warning',
    content: body('Collapsed items stay neutral.'),
  },
  {
    key: 'failed',
    title: 'Build failed',
    color: 'error',
    content: body('Use error to emphasize failures.'),
  },
];

export const setupSteps: AccordionItemType[] = [
  {
    key: 'install',
    title: 'Install the package',
    content: body('Run `npm install @platform-blocks/ui` in your workspace.'),
  },
  {
    key: 'provider',
    title: 'Wrap your app in providers',
    content: body('Add ThemeProvider, ToastProvider, and DialogProvider at the root.'),
  },
  {
    key: 'compose',
    title: 'Compose your first screen',
    content: body('Drop in fields, buttons, and feedback components from the library.'),
  },
];
