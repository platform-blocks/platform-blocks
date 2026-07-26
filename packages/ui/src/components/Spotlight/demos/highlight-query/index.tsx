import { Block, Button, Card, Spotlight, Text, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

// Actions intentionally share overlapping substrings to show highlighting effect
const actions: SpotlightProps['actions'] = [
  {
    id: 'create-project',
    label: 'Create project',
    description: 'Start a new project workspace',
    icon: 'plus',
    onPress: () => console.log('action: create project'),
  },
  {
    id: 'create-branch',
    label: 'Create branch',
    description: 'Open branch creation workflow',
    icon: 'code',
    onPress: () => console.log('action: create branch'),
  },
  {
    id: 'open-recent',
    label: 'Open recent project',
    description: 'Choose from recently opened projects',
    icon: 'folder',
    onPress: () => console.log('action: open recent'),
  },
  {
    id: 'project-settings',
    label: 'Project settings',
    description: 'Configure repository options',
    icon: 'settings',
    onPress: () => console.log('action: project settings'),
  },
];

export default function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" colorVariant="secondary">
            Passing `highlightQuery` emphasizes matching substrings across labels and descriptions, reinforcing why a result surfaced.
          </Text>
          <Button onPress={() => store.open()}>Open spotlight</Button>
          <Text size="xs" colorVariant="secondary">
            Try typing “proj” or “create” to see the inline highlights.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} highlightQuery store={store} />
    </Block>
  );
}
