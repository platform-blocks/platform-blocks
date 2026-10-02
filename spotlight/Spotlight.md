# Spotlight

Spotlight provides a searchable command palette for actions, routes, and other items.

## Metadata

- Import: `import { Spotlight } from '@plocks/spotlight';`
- Install: `npm install @plocks/spotlight` — a separate package from `@plocks/ui`
- Status: experimental
- Tags: command-palette, search, quick actions
- Docs: https://plocks.dev/components/Spotlight
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/spotlight/src/components/Spotlight

## Props

- `actions` (required): SpotlightItem[]
- `nothingFound`: string
- `highlightQuery`: boolean | HighlightComponentProps['highlight']
- `limit`: number
- `scrollable`: boolean
- `maxHeight`: number = fills the panel — Max height of the results list — not the panel — before it scrolls. @default fills the panel
- `shortcut`: string | string[] | null
- `searchProps`: Partial<SpotlightSearchProps> — Props for the search field (placeholder, startSection, autoFocus, inputRef, TextInput props…).
- `groupLabelProps`: Omit<TextProps, 'children'> — Override props for each group label `<Text>` (style, weight, size, color, uppercase…). Labels use the theme's `sectionLabel` text role by default.
- `store`: SpotlightStore — A store from `createSpotlightStore` / `useSpotlightStoreInstance`; defaults to the provider's.
- `variant`: 'modal' | 'bottomsheet' | 'fullscreen'
- `accessibilityLabel`: string = 'Search' — Accessible name of the spotlight dialog. @default 'Search'
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { SpotlightProvider } from '@plocks/spotlight';`

### SpotlightProvider

- `children` (required): ReactNode

## Related hooks

- `useSpotlightStore(): SpotlightStore`
- `useSpotlightStoreInstance(): [SpotlightStore, SpotlightStore]`
- `useDirectSpotlightState()`

## Types

```ts
export type SpotlightItem = SpotlightActionData | SpotlightActionGroupData;

export interface SpotlightSearchProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'autoFocus'> {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  startSection?: ReactNode;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onSelectAction?: () => void;
  onClose?: () => void;
  autoFocus?: boolean;
  inputRef?: RefObject<TextInput | null>;
  /**
   * Show a close button in the search row. Defaults to true on the mobile
   * experience, where the fullscreen presentation offers no backdrop or
   * Escape key to dismiss with.
   */
  withCloseButton?: boolean;
}

export interface SpotlightStore {
  state: SpotlightState;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
  navigateUp: () => void;
  navigateDown: () => void;
}

export interface SpotlightActionData {
  /** Unique action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action description */
  description?: string;
  /** Action keywords for better search matching */
  keywords?: string[];
  /** Icon to display */
  icon?: string | ReactNode;
  /** Action press handler */
  onPress?: () => void;
  /** Whether action is disabled */
  disabled?: boolean;
  /** Custom component to render instead of default action */
  component?: ReactNode;
}

export interface SpotlightActionGroupData {
  /** Group label */
  group: string;
  /** Actions in this group */
  actions: SpotlightActionData[];
}

export interface SpotlightState {
  opened: boolean;
  query: string;
  selectedIndex: number;
}
```

## Examples

### Basics

Open the Spotlight command palette with `⌘K` / `Ctrl+K`, or from a button through its store.

```tsx
import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

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

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
```

### Custom Icons

Swap `icon` definitions with custom React nodes to render richer action affordances.

```tsx
import { Block, Button, Icon } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions: SpotlightProps['actions'] = [
  {
    id: 'deploy',
    label: 'Deploy service',
    description: 'Trigger the CI/CD pipeline',
    icon: <Icon name="bolt" />,
    onPress: () => console.log('deploy service'),
  },
  {
    id: 'logs',
    label: 'Inspect logs',
    description: 'Open the latest runtime logs',
    icon: <Icon name="code" />,
    onPress: () => console.log('view logs'),
  },
  {
    id: 'alerts',
    label: 'Review alerts',
    description: 'Check active incidents',
    icon: <Icon name="bell" />,
    onPress: () => console.log('open alerts'),
  },
];

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
```

### Variants

Open Spotlight as a modal, bottom sheet, or fullscreen search panel.

```tsx
import { Button, Column } from '@plocks/ui';
import { Spotlight, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions = [{ id: 'home', label: 'Go home', icon: 'home', onPress: () => {} }];
const variants = ['modal', 'bottomsheet', 'fullscreen'] as const;

function VariantPreview({ variant }: { variant: typeof variants[number] }) {
  const [store] = useSpotlightStoreInstance();
  return (
    <>
      <Button variant="light" onPress={() => store.open()}>Open {variant}</Button>
      <Spotlight variant={variant} actions={actions} store={store} />
    </>
  );
}

export function Demo() {
  return <Column gap="sm" align="flex-start">{variants.map(variant => <VariantPreview key={variant} variant={variant} />)}</Column>;
}
```

### Grouped Actions

Organize actions into named groups so related commands render under semantic headers.

```tsx
import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

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

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} store={store} />
    </Block>
  );
}
```

### Highlight Matches

Enable `highlightQuery` so matching substrings glow while you refine command searches.

```tsx
import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

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
```

### Limit Results

Restrict how many matching actions render by applying the `limit` prop.

```tsx
import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions: SpotlightProps['actions'] = Array.from({ length: 25 }).map((_, index) => ({
  id: `command-${index}`,
  label: `Command ${index + 1}`,
  description: `Example action #${index + 1}`,
  icon: 'star',
  onPress: () => console.log('command', index + 1),
}));

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} limit={8} store={store} />
    </Block>
  );
}
```

### Fullscreen Mobile

Pin the `fullscreen` variant to mimic native command palettes on handheld devices.

```tsx
import { Block, Button } from '@plocks/ui';
import { Spotlight, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

const actions: SpotlightProps['actions'] = Array.from({ length: 18 }).map((_, index) => ({
  id: `mobile-action-${index}`,
  label: `Mobile action ${index + 1}`,
  description: 'Available on every screen',
  icon: 'star',
  onPress: () => console.log('mobile action', index + 1),
}));

export function Demo() {
  const [store] = useSpotlightStoreInstance();

  return (
    <Block>
      <Button onPress={() => store.open()}>Open spotlight</Button>
      <Spotlight actions={actions} variant="fullscreen" store={store} />
    </Block>
  );
}
```

### Programmatic Stores

Showcase scoped Spotlight stores, dynamic actions, and the global `spotlight` helper working together.

```tsx
import { useMemo, useState } from 'react';
import { Block, Button, Row } from '@plocks/ui';
import { spotlight, Spotlight, SpotlightProvider, type SpotlightProps, useSpotlightStoreInstance } from '@plocks/spotlight';

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

export function Demo() {
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
        <Row gap="sm" wrap="wrap">
          <Button onPress={() => store.open()}>Open scoped store</Button>
          <Button variant="outline" onPress={() => spotlight.toggle()}>
            Toggle global spotlight
          </Button>
        </Row>
        <Spotlight actions={actions} store={store} />
        <Spotlight actions={globalActions} />
      </Block>
    </SpotlightProvider>
  );
}
```
