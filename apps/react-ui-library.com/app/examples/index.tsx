import { router } from 'expo-router';
import { Button, Card, Chip, Column, Flex, Text, Title } from '@platform-blocks/react-ui-library';

import { DocsPage } from '../../components/DocsPage';
import { DocsPageHeader } from '../../components/DocsPageHeader';
import { EXAMPLES, EXAMPLES_SUBTITLE, EXAMPLES_TITLE } from '../../config/examples';
import { GITHUB_REPO } from '../../config/urls';
import { useBrowserTitle, formatPageTitle } from 'hooks/useBrowserTitle';

export default function ExamplesScreen() {
  useBrowserTitle(formatPageTitle(EXAMPLES_TITLE));

  return (
    <DocsPage>
      <Column gap="xl">
        <DocsPageHeader subtitle={EXAMPLES_SUBTITLE}>
          {EXAMPLES_TITLE}
        </DocsPageHeader>

        <Flex direction="row" wrap="wrap" gap="md">
          {EXAMPLES.map(example => (
            <Card
              key={example.slug}
              variant="elevated"
              p="lg"
              style={{ flexBasis: 340, flexGrow: 1 }}
            >
              <Flex direction="column" justify="space-between" gap="md" style={{ flex: 1 }}>
                <Column gap="sm">
                  <Title order={3}>{example.title}</Title>
                  <Text color="secondary">{example.description}</Text>
                  <Flex direction="row" gap="xs" wrap="wrap">
                    {example.components.map(component => (
                      <Chip key={component} size="sm" variant="surface">{component}</Chip>
                    ))}
                  </Flex>
                </Column>
                <Flex direction="row" gap="sm" wrap="wrap">
                  <Button
                    title="Open fullscreen"
                    variant="light"
                    size="sm"
                    onPress={() => router.push(`/examples/${example.slug}`)}
                  />
                  <Button
                    title="View source"
                    variant="subtle"
                    size="sm"
                    onPress={() => router.push(`${GITHUB_REPO}/blob/main/${example.sourcePath}`)}
                  />
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>

        <Text variant="small" color="secondary">
          Each example is a single self-contained file — copy it into your app and adjust. More
          examples land here regularly; suggestions are welcome on GitHub.
        </Text>
      </Column>
    </DocsPage>
  );
}
