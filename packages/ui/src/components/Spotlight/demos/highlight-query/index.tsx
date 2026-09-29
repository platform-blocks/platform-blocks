import { Block, Button, Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@platform-blocks/ui';

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

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} highlightQuery store={store} />
    </Block>
  );
}
