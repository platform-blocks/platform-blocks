# Spotlight

The Spotlight component provides a fast, keyboard-driven interface for searching commands, routes, and entities. Supports arrow key navigation, Enter to select, and Escape to dismiss.

## Metadata

- Canonical name: `Spotlight`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Spotlight } from '@platform-blocks/react-ui-library';`
- Status: experimental
- Category: navigation
- Tags: command-palette, search, quick actions
- Docs: https://react-ui-library.com/components/Spotlight
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Spotlight

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `actions` | SpotlightItem[] | Yes |  |  |
| `nothingFound` | string | No |  |  |
| `highlightQuery` | boolean \| HighlightComponentProps['highlight'] | No |  |  |
| `limit` | number | No |  |  |
| `scrollable` | boolean | No |  |  |
| `maxHeight` | number | No |  |  |
| `shortcut` | string \| string[] \| null | No |  |  |
| `searchProps` | any | No |  |  |
| `store` | any | No |  |  |
| `variant` | 'modal' \| 'bottomsheet' \| 'fullscreen' | No |  |  |
| `width` | number | No |  |  |
| `height` | number | No |  |  |

## Examples

### Keyboard Palette
ID: `Spotlight.basic` • Tags: spotlight • Category: usage • Status: stable • Since: 1.0.0

Open the Spotlight command palette through the shared store and a primary trigger button.

```tsx
const actions: SpotlightProps['actions'] = [
  {
    id: 'home',
    label: 'Go to home',
    description: 'Navigate to the home screen',
    icon: 'home',
    onPress: () => console.log('navigate: home'),
  },
  {
    id: 'profile',
    label: 'Open profile',
    description: 'View your account details',
    icon: 'user',
    onPress: () => console.log('navigate: profile'),
  },
  {
    id: 'settings',
    label: 'Adjust settings',
    description: 'Update application preferences',
    icon: 'settings',
    onPress: () => console.log('navigate: settings'),
  },
];
  const [store] = useSpotlightStoreInstance();
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Spotlight provides a keyboard-driven command palette. Open it with `⌘K` or `Ctrl+K`, or trigger it imperatively from a button.
          </Text>
          <Button onPress={() => store.open()}>Open spotlight</Button>
          <Text size="xs" color="secondary">
            You can reuse the same store across multiple triggers.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
```

### Custom Icons
ID: `Spotlight.custom-icons` • Tags: spotlight • Category: customization • Status: stable • Since: 1.0.0

Swap `icon` definitions with custom React nodes to render richer action affordances.

```tsx
const actions: SpotlightProps['actions'] = [
  {
    id: 'deploy',
    label: 'Deploy service',
    description: 'Trigger the CI/CD pipeline',
    icon: <Icon name="bolt" size="md" />,
    onPress: () => console.log('deploy service'),
  },
  {
    id: 'logs',
    label: 'Inspect logs',
    description: 'Open the latest runtime logs',
    icon: <Icon name="code" size="md" />,
    onPress: () => console.log('view logs'),
  },
  {
    id: 'alerts',
    label: 'Review alerts',
    description: 'Check active incidents',
    icon: <Icon name="bell" size="md" />,
    onPress: () => console.log('open alerts'),
  },
];
  const [store] = useSpotlightStoreInstance();
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Icons accept full React nodes, so you can swap in composable UI like `Icon`, avatars, or status badges for richer visuals.
          </Text>
          <Button variant="outline" onPress={() => store.open()}>
            Open spotlight
          </Button>
        </Block>
      </Card>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
```

### Grouped Actions
ID: `Spotlight.groups` • Tags: spotlight • Category: organization • Status: stable • Since: 1.0.0

Organize actions into named groups so related commands render under semantic headers.

```tsx
const actions: SpotlightProps['actions'] = [
  {
    group: 'Navigation',
    actions: [
      { id: 'home', label: 'Home', icon: 'home', onPress: () => console.log('navigate: home') },
      {
        id: 'dashboard',
        label: 'Dashboard',
        description: 'Jump to the analytics overview',
        icon: 'star',
        onPress: () => console.log('navigate: dashboard'),
      },
    ],
  },
  {
    group: 'Settings',
    actions: [
      { id: 'profile', label: 'Profile', icon: 'user', onPress: () => console.log('navigate: profile') },
      {
        id: 'billing',
        label: 'Billing settings',
        description: 'Manage payment methods',
        icon: 'settings',
        onPress: () => console.log('navigate: billing'),
      },
    ],
  },
];
  const [store] = useSpotlightStoreInstance();
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Group actions to create semantic sections inside the results list. Each group renders a header before its nested actions.
          </Text>
          <Button variant="secondary" onPress={() => store.open()}>
            Open spotlight
          </Button>
        </Block>
      </Card>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
```

### Highlight Matches
ID: `Spotlight.highlight-query` • Tags: spotlight • Category: feedback • Status: stable • Since: 1.0.0

Enable `highlightQuery` so matching substrings glow while you refine command searches.

```tsx
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
  const [store] = useSpotlightStoreInstance();
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Passing `highlightQuery` emphasizes matching substrings across labels and descriptions, reinforcing why a result surfaced.
          </Text>
          <Button onPress={() => store.open()}>Open spotlight</Button>
          <Text size="xs" color="secondary">
            Try typing “proj” or “create” to see the inline highlights.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} highlightQuery store={store} />
    </Block>
  );
}
```

### Limit Results
ID: `Spotlight.limit-results` • Tags: spotlight • Category: behavior • Status: stable • Since: 1.0.0

Restrict how many matching actions render by applying the `limit` prop.

```tsx
const actions: SpotlightProps['actions'] = Array.from({ length: 25 }).map((_, index) => ({
  id: `command-${index}`,
  label: `Command ${index + 1}`,
  description: `Example action #${index + 1}`,
  icon: 'star',
  onPress: () => console.log('command', index + 1),
}));
  const [store] = useSpotlightStoreInstance();
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Set the `limit` prop to constrain how many results render, even if more actions match the query.
          </Text>
          <Button onPress={() => store.open()}>Open spotlight</Button>
          <Text size="xs" color="secondary">
            This demo caps the list at 8 items.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} limit={8} store={store} />
    </Block>
  );
}
```

### Fullscreen Mobile
ID: `Spotlight.fullscreen-mobile` • Tags: spotlight • Category: layouts • Status: stable • Since: 1.0.0

Pin the `fullscreen` variant to mimic native command palettes on handheld devices.

```tsx
// Reuse a moderate list to showcase vertical scroll in fullscreen
const actions: SpotlightProps['actions'] = Array.from({ length: 18 }).map((_, index) => ({
  id: `mobile-action-${index}`,
  label: `Mobile action ${index + 1}`,
  description: 'Available on every screen',
  icon: 'star',
  onPress: () => console.log('mobile action', index + 1),
}));
  const [store] = useSpotlightStoreInstance();
  const isMobile = Platform.OS !== 'web';
  return (
    <Block>
      <Card p="md">
        <Block>
          <Text size="sm" color="secondary">
            Force the `fullscreen` variant to mimic a native sheet on touch devices while keeping the modal layout on web for comparison.
          </Text>
          <Button onPress={() => store.open()}>
            {isMobile ? 'Open fullscreen spotlight' : 'Open spotlight'}
          </Button>
          <Text size="xs" color="secondary">
            The component already auto-detects mobile surfaces; this demo pins the variant for clarity.
          </Text>
        </Block>
      </Card>
      <Spotlight actions={actions} variant="fullscreen" store={store} />
    </Block>
  );
}
```

### Programmatic Stores
ID: `Spotlight.programmatic` • Tags: spotlight • Category: advanced • Status: stable • Since: 1.0.0

Showcase scoped Spotlight stores, dynamic actions, and the global `spotlight` helper working together.

```tsx
Block,
  Button,
  Card,
  Row,
  spotlight,
  Spotlight,
  SpotlightProvider,
  Text,
  type SpotlightProps,
  useSpotlightStoreInstance,
} from '@platform-blocks/react-ui-library';
const baseActions: SpotlightProps['actions'] = [
  {
    id: 'ping',
    label: 'Ping server',
    description: 'Send a ping to the backend',
    icon: 'bolt',
    onPress: () => console.log('ping'),
  },
  {
    id: 'refresh',
    label: 'Refresh data',
    description: 'Reload cached domain data',
    icon: 'refresh',
    onPress: () => console.log('refresh'),
  },
];
const globalActions: SpotlightProps['actions'] = [
  {
    id: 'global-home',
    label: 'Global home',
    description: 'Navigate home via the shared store',
    icon: 'home',
    onPress: () => console.log('global home'),
  },
  {
    id: 'global-settings',
    label: 'Global settings',
    description: 'Open the account-wide preferences',
    icon: 'settings',
    onPress: () => console.log('global settings'),
  },
];
  const [store] = useSpotlightStoreInstance();
  const [dynamicCount, setDynamicCount] = useState(0);
  const actions = useMemo<SpotlightProps['actions']>(
    () => [
      ...baseActions,
      {
        id: 'add-dynamic',
        label: 'Add dynamic action',
        icon: 'plus',
        onPress: () => setDynamicCount((count) => count + 1),
      },
      ...Array.from({ length: dynamicCount }).map((_, index) => ({
        id: `dynamic-${index}`,
        label: `Dynamic action ${index + 1}`,
        description: 'Added at runtime to the local store',
        icon: 'star',
        onPress: () => console.log('dynamic', index + 1),
      })),
    ],
    [dynamicCount]
  );
  return (
    <SpotlightProvider>
      <Block>
        <Card p="md">
          <Block>
            <Text size="sm" color="secondary">
              Combine local stores with the global `spotlight` helper. This demo adds actions to its scoped store while still toggling the shared palette.
            </Text>
            <Row gap="sm" wrap="wrap">
              <Button onPress={() => store.open()}>Open demo store</Button>
              <Button variant="outline" onPress={() => spotlight.toggle()}>
                Toggle global spotlight
              </Button>
            </Row>
            <Text size="xs" color="secondary">
              Select “Add dynamic action” to append more commands on the fly.
            </Text>
          </Block>
        </Card>
        <Spotlight actions={actions} store={store} />
        <Spotlight actions={globalActions} />
      </Block>
    </SpotlightProvider>
  );
}
```
