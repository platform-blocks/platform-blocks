import React from 'react';
import { View } from 'react-native';
import {
  Text,
  Column,
  Badge,
  Divider,
  CodeBlock,
} from '@platform-blocks/react-ui-library';
import { DocsPage } from 'components';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { SoundExample } from '../../components/examples/SoundExample';
import AccessibilityDemoWithProvider from '../../components/examples/AccessibilityDemo';
import {
  ACCESSIBILITY_BADGES,
  ACCESSIBILITY_EXAMPLE_LEAD,
  ACCESSIBILITY_EXAMPLE_SNIPPET,
  ACCESSIBILITY_EXAMPLE_TITLE,
  ACCESSIBILITY_INTERACTIVE_LEAD,
  ACCESSIBILITY_INTERACTIVE_TITLE,
  ACCESSIBILITY_INTRO,
  ACCESSIBILITY_OUTRO,
  ACCESSIBILITY_SECTIONS,
  ACCESSIBILITY_TITLE,
} from '../../config/accessibility';

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <Column gap="xs">
    {items.map((item, index) => (
      <Text key={`${item}-${index}`} variant="p">
        • {item}
      </Text>
    ))}
  </Column>
);

const AccessibilityPage = () => {
  return (
    <DocsPage>
      <Column gap="2xl">
        <Column gap="md">
          <DocsPageHeader>{ACCESSIBILITY_TITLE}</DocsPageHeader>
          <Text variant="p" color="secondary">
            {ACCESSIBILITY_INTRO}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ACCESSIBILITY_BADGES.map(({ label, color }) => (
              <Badge key={label} variant="outline" color={color}>{label}</Badge>
            ))}
          </View>
        </Column>

        <Column gap="xl">
          {ACCESSIBILITY_SECTIONS.map(({ title, lead, items }) => (
            <Column key={title} gap="md">
              <Text variant="h2">{title}</Text>
              <Text variant="p" color="secondary">
                {lead}
              </Text>
              <BulletList items={items} />
            </Column>
          ))}
        </Column>

        <Column gap="md">
          <Text variant="h2">{ACCESSIBILITY_EXAMPLE_TITLE}</Text>
          <Text variant="p" color="secondary">
            {ACCESSIBILITY_EXAMPLE_LEAD}
          </Text>
          <CodeBlock language="tsx" spoiler={false}>
            {ACCESSIBILITY_EXAMPLE_SNIPPET}
          </CodeBlock>
        </Column>

        <Divider />

        <Column gap="lg">
          <Text variant="h2">{ACCESSIBILITY_INTERACTIVE_TITLE}</Text>
          <Text variant="p" color="secondary">
            {ACCESSIBILITY_INTERACTIVE_LEAD}
          </Text>
          <SoundExample />
          <AccessibilityDemoWithProvider />
        </Column>

        <Text variant="p" color="muted">
          {ACCESSIBILITY_OUTRO}
        </Text>
      </Column>
    </DocsPage>
  );
};

export default AccessibilityPage;