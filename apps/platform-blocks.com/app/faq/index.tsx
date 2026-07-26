import { Linking } from 'react-native';
import { Text, Accordion, P, Flex, Column } from '@platform-blocks/ui';
import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

// NOTE: The question/answer text here is mirrored as plain strings in
// config/faq.ts, which powers the FAQPage JSON-LD in the static SEO build.
// Keep the two in sync when editing questions or answers.
const FAQ_DATA = [{
  id: 1,
  key: 'what-is',
  title: 'What is Platform Blocks?',
  content: <Flex><Text>Platform Blocks is a React Native UI component library designed for building cross-platform applications with a consistent look and feel. It provides a set of customizable, accessible, and themeable components that work seamlessly on iOS, Android, and web platforms.</Text></Flex>
}, {
  id: 1,
  key: 'expo-compatibility',
  title: 'Is Platform Blocks compatible with Expo?',
  content: <P>Yes! Platform Blocks is fully compatible with <Text variant="p" colorVariant="link" onPress={() => Linking.openURL('https://expo.dev')}>Expo</Text> and works out of the box. All components are designed to work in the Expo environment without requiring any native code modifications.</P>
}, {
  id: 2,
  key: 'does-support',
  title: 'Does Platform Blocks support React Native Web?',
  content: <Flex><Text>Absolutely! Platform Blocks is built with React Native Web compatibility in mind. All components work seamlessly across iOS, Android, and web platforms.</Text></Flex>
}, {
  id: 3,
  key: 'can-customize',
  title: 'Can I customize the theme?',
  content: <Flex><Text>Yes, Platform Blocks has a comprehensive theming system. You can customize colors, typography, spacing, and component variants through the theme configuration. See our Theming guide for detailed instructions.</Text></Flex>
}, {
  id: 7,
  key: 'can-use-custom-fonts',
  title: 'Can I use custom fonts?',
  content: <Flex><Text>Yes, you can configure <Text fontFamily="cursive">custom fonts</Text> through the theme system. Platform Blocks's typography system allows you to specify custom font families for different text variants.</Text></Flex>
}, {
  id: 8,
  key: 'how-report-bugs',
  title: 'How do I report bugs or request features?',
  content: <Flex><Text>You can report bugs and request features on our GitHub repository. We welcome community contributions and feedback to make Platform Blocks better for everyone.</Text></Flex>
}];

export default function FAQScreen() {
  // Update browser title
  useBrowserTitle(formatPageTitle('FAQ'));

  return (
    <DocsPage>
      <Column gap="xl">
        {/* DocsPageHeader, not a bare Title: Title defaults to order 2, so this
            page shipped its own name as an <h2> and had no <h1> at all. */}
        <DocsPageHeader
          text="Frequently Asked Questions"
          subtitle="Common questions about Platform Blocks library"
        />
        <Accordion
          type="multiple"
          variant="default"
          items={FAQ_DATA}
          defaultExpanded={FAQ_DATA.map((item) => item.key)}
          headerTextStyle={{ fontWeight: '600', fontSize: 17 }}
        />
      </Column>
    </DocsPage>
  );
}
