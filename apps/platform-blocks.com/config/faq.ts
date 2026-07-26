/**
 * Plain-text FAQ source of truth.
 *
 * Kept as plain strings (no JSX) so it can be consumed both by the FAQ screen
 * and by the static SEO build (config/routeSeo.ts → FAQPage JSON-LD), which runs
 * in Node and cannot import React Native components.
 */
export interface FaqItem {
  key: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    key: 'what-is',
    question: 'What is Platform Blocks?',
    answer:
      'Platform Blocks is a React Native UI component library designed for building cross-platform applications with a consistent look and feel. It provides a set of customizable, accessible, and themeable components that work seamlessly on iOS, Android, and web platforms.',
  },
  {
    key: 'expo-compatibility',
    question: 'Is Platform Blocks compatible with Expo?',
    answer:
      'Yes! Platform Blocks is fully compatible with Expo and works out of the box. All components are designed to work in the Expo environment without requiring any native code modifications.',
  },
  {
    key: 'does-support',
    question: 'Does Platform Blocks support React Native Web?',
    answer:
      'Absolutely! Platform Blocks is built with React Native Web compatibility in mind. All components work seamlessly across iOS, Android, and web platforms.',
  },
  {
    key: 'can-customize',
    question: 'Can I customize the theme?',
    answer:
      'Yes, Platform Blocks has a comprehensive theming system. You can customize colors, typography, spacing, and component variants through the theme configuration. See our Theming guide for detailed instructions.',
  },
  {
    key: 'can-use-custom-fonts',
    question: 'Can I use custom fonts?',
    answer:
      "Yes, you can configure custom fonts through the theme system. Platform Blocks's typography system allows you to specify custom font families for different text variants.",
  },
  {
    key: 'how-report-bugs',
    question: 'How do I report bugs or request features?',
    answer:
      'You can report bugs and request features on our GitHub repository. We welcome community contributions and feedback to make Platform Blocks better for everyone.',
  },
];
