# Tabs

Tabs organize content into multiple sections that users can navigate between. The component supports various visual styles, orientations, and interactive behaviors while maintaining accessibility standards.

## Metadata

- Canonical name: `Tabs`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Tabs } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: navigation
- Docs: https://react-ui-library.com/components/Tabs
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Tabs

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `items` | TabItem[] | Yes |  | Array of tab definitions to render. The first item becomes active by default when uncontrolled. |
| `activeTab` | string | No |  | Controlled active tab key. When omitted the component manages internal state. |
| `onTabChange` | (tabKey: string) => void | No |  | Called whenever the active tab changes. Fires for both controlled and uncontrolled usage. |
| `onDisabledTabPress` | (tabKey: string, item: TabItem) => void | No |  | Invoked when a disabled tab is pressed, allowing custom messaging or recovery flows. |
| `variant` | 'line' \| 'chip' \| 'card' \| 'folder' | No | 'line' | Visual style of the tabs. |
| `size` | SizeValue | No | 'sm' | Size token controlling text and padding. |
| `color` | ThemeColor | No | 'primary' | Theme color token or custom color used for indicators and active states. |
| `orientation` | 'horizontal' \| 'vertical' | No | 'horizontal' | Orientation of the tab list. |
| `location` | 'start' \| 'end' | No | 'start' | Placement of the tabs relative to their content. Influences indicator positioning. |
| `scrollable` | boolean | No | false | Enables scrolling when tabs overflow the available axis. |
| `animated` | boolean | No | true | Enables animated indicator transitions between tabs. |
| `animationDuration` | number | No | 250 | Duration (ms) for indicator animations when `animated` is true. |
| `transitionDuration` | number | No | 250 | Duration (ms) of the indicator transition. Cross-component spelling that takes precedence over `animationDuration`; `0` moves the indicator instantly. Always 0 under reduced motion. |
| `style` | StyleProp<ViewStyle> | No |  | Style overrides for the outer container. |
| `tabStyle` | StyleProp<ViewStyle> | No |  | Style overrides applied to each tab pressable. |
| `contentStyle` | StyleProp<ViewStyle> | No |  | Style for the active tab content wrapper. |
| `textStyle` | StyleProp<TextStyle> | No |  | Additional text style applied to tab labels. |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to each tab's label `<Text>` (style, weight, ff, size, color). Applies to all tabs in the strip; per-tab styling can still be done via `TabItem.label` (custom node). |
| `disabledKeys` | string[] | No | [] | Array of tab keys that should be rendered disabled. |
| `tabCornerRadius` | number | No |  | Corner radius applied to the tab elements (variant dependent). |
| `contentCornerRadius` | number | No |  | Corner radius applied to the content panel. Falls back to theme defaults when omitted. |
| `indicatorThickness` | number | No |  | Thickness (px) of the line indicator. Applies to `line` variant primarily. |
| `tabGap` | number | No |  | Gap (px) inserted between tabs. |
| `activeTabBackgroundColor` | string | No |  | Override background color for the active tab. Accepts theme tokens. |
| `inactiveTabBackgroundColor` | string | No |  | Override background color for inactive tabs. |
| `activeTabTextColor` | string | No |  | Explicit text color for the active tab label. |
| `persistKey` | string | No |  | Key used to persist the active tab selection across sessions. |
| `autoPersist` | boolean | No | true | Determines whether internal persistence should be enabled when `persistKey` is provided. |
| `navigationOnly` | boolean | No | false | When true, the component only renders the tab list and forwards children for custom content. |
| `children` | ReactNode | No |  | Optional custom content rendered below the tab list when `navigationOnly` is enabled. |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |
| `radius` | number \| string | No |  |  |

## Examples

### Basics
ID: `Tabs.basic` • Tags: tabs • Category: basics • Status: stable • Since: 1.0.0

Render the default tabs experience with inline content and a short caption explaining the pattern.

```tsx
const ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    content: <Text>High-level summary and entry point.</Text>
  },
  {
    key: 'details',
    label: 'Details',
    content: <Text>Deeper dive into metrics and configuration.</Text>
  },
  {
    key: 'activity',
    label: 'Activity',
    content: <Text>Recent events, tasks, and notifications.</Text>
  }
];
  return (
    <Block>
      <Tabs items={ITEMS} />
      <Text variant="small" color="muted">
        Tabs render inline content directly below the active trigger by default.
      </Text>
    </Block>
  );
}
```

### Animated transitions
ID: `Tabs.animated` • Tags: animation, tabs • Category: behavior • Status: stable • Since: 1.0.0

Demonstrates motion-enabled tabs using the `animated` flag and custom duration to smooth the switch between panels.

```tsx
const ITEMS = [
  {
    key: 'home',
    label: 'Home',
    content: (
      <Block>
        <Text weight="medium">Welcome back</Text>
        <Text color="muted">
          Animated transitions ease between dashboard sections and reinforce context shifts.
        </Text>
      </Block>
    )
  },
  {
    key: 'analytics',
    label: 'Analytics',
    content: (
      <Block>
        <Text weight="medium">Analytics overview</Text>
        <Text color="muted">
          Surface key charts and KPIs while the motion guides attention to new content.
        </Text>
      </Block>
    )
  },
  {
    key: 'settings',
    label: 'Settings',
    content: (
      <Block>
        <Text weight="medium">Account settings</Text>
        <Text color="muted">
          Manage notifications, billing, and other preferences without abrupt content swaps.
        </Text>
      </Block>
    )
  }
];
  return (
    <Block>
      <Tabs
        variant="line"
        animated
        animationDuration={250}
        items={ITEMS}
      />
      <Text variant="small" color="muted">
        Enable `animated` to add motion and use `animationDuration` to moderate the easing speed.
      </Text>
    </Block>
  );
}
```

### Disabled tabs
ID: `Tabs.disabled` • Tags: tabs, access-control • Category: behavior • Status: stable • Since: 1.0.0

Show how to disable a tab while capturing interaction attempts through `onDisabledTabPress` for auditing or messaging.

```tsx
const PANELS = [
  {
    key: 'overview',
    label: 'Overview',
    body: 'High-level snapshot of product activity and health.'
  },
  {
    key: 'analytics',
    label: 'Analytics',
    body: 'Dive into usage metrics, adoption trends, and retention.'
  },
  {
    key: 'billing',
    label: 'Billing',
    body: 'Billing is temporarily disabled while invoices reconcile.',
    disabled: true
  },
  {
    key: 'settings',
    label: 'Settings',
    body: 'Manage workspace preferences and security controls.'
  }
];
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);
  return (
    <Block>
      <Tabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setLastAttempt(null);
        }}
        onDisabledTabPress={(key) => {
          const label = PANELS.find((panel) => panel.key === key)?.label ?? key;
          setLastAttempt(`${label} is currently disabled.`);
        }}
        variant="line"
        size="md"
        items={PANELS.map(({ body, ...panel }) => ({
          ...panel,
          content: (
            <Block bg={theme.backgrounds.surface} borderColor={theme.backgrounds.border} radius="lg" p="md">
              <Text>{body}</Text>
            </Block>
          )
        }))}
      />
      <Text variant="small" color="muted">
        Disable sensitive tabs while keeping the `onDisabledTabPress` callback to track attempted access.
        {lastAttempt ? ` ${lastAttempt}` : ''}
      </Text>
    </Block>
  );
}
```

### Controlled state
ID: `Tabs.interactive` • Tags: tabs, controlled • Category: behavior • Status: stable • Since: 1.0.0

Demonstrates controlled tabs that surface the active label and rely on external state updates via `onTabChange`.

```tsx
const ITEMS = [
  {
    key: 'dashboard',
    label: '🏠 Dashboard',
    content: <Text>Monitor analytics across teams and products.</Text>
  },
  {
    key: 'settings',
    label: '⚙️ Settings',
    content: <Text>Configure notifications, permissions, and integrations.</Text>
  },
  {
    key: 'profile',
    label: '👤 Profile',
    content: <Text>Review contact details, roles, and security options.</Text>
  }
];
  const [activeTab, setActiveTab] = useState('dashboard');
  const activeLabel = ITEMS.find((item) => item.key === activeTab)?.label ?? activeTab;
  return (
    <Block>
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} items={ITEMS} />
      <Text variant="small" color="muted">
        Active tab: {activeLabel}
      </Text>
    </Block>
  );
}
```

### Location
ID: `Tabs.location` • Tags: tabs, layout • Category: layout • Status: stable • Since: 1.0.0

Switch tab placement between `start` and `end` to position triggers above or below the associated content.

```tsx
type Location = 'start' | 'end';
const SECTIONS: Array<{ label: string; location: Location; helper: string }> = [
  {
    label: 'Tabs above content (start)',
    location: 'start',
    helper: 'Default placement keeps triggers directly above the active view.'
  },
  {
    label: 'Tabs below content (end)',
    location: 'end',
    helper: 'Use end placement when the content should lead and controls follow.'
  }
];
const buildItems = (location: Location) => [
  {
    key: 'home',
    label: 'Home',
    content: (
      <Text>
        Home content rendered with tabs {location === 'start' ? 'above' : 'below'} the panel.
      </Text>
    )
  },
  {
    key: 'settings',
    label: 'Settings',
    content: (
      <Text>
        Update configurations while keeping the tabs {location === 'start' ? 'up top' : 'after the details'}.
      </Text>
    )
  },
  {
    key: 'profile',
    label: 'Profile',
    content: (
      <Text>
        Profile information with navigation {location === 'start' ? 'leading into' : 'following'} the content.
      </Text>
    )
  }
];
  return (
    <Block>
      {SECTIONS.map(({ label, location, helper }) => (
        <Block key={location}>
          <Text weight="medium">{label}</Text>
          <Tabs variant="line" location={location} items={buildItems(location)} />
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Navigation only
ID: `Tabs.navigation-only` • Tags: tabs, navigation • Category: layout • Status: stable • Since: 1.0.0

Demonstrates `navigationOnly` tabs that render the triggers separately while a custom container handles the content region.

```tsx
const NAV_ITEMS = [
  { key: 'home', label: 'Home' },
  { key: 'products', label: 'Products' },
  { key: 'about', label: 'About' },
  { key: 'contact', label: 'Contact' }
] as const;
const CONTENT_COPY: Record<typeof NAV_ITEMS[number]['key'], string> = {
  home: 'Welcome back! Navigation only mode keeps the tab strip separated from the view.',
  products: 'Highlight product cards, filters, or category grids below the navigation.',
  about: 'Share the company story, values, and milestones alongside persistent tabs.',
  contact: 'Surface support channels and locations while the navigation stays fixed.'
};
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<typeof NAV_ITEMS[number]['key']>('home');
  const items = useMemo(
    () => NAV_ITEMS.map(({ key, label }) => ({ key, label, content: null })),
    []
  );
  return (
    <Block>
      <Tabs
        items={items}
        activeTab={activeTab}
        onTabChange={(tabKey) => setActiveTab(tabKey as typeof NAV_ITEMS[number]['key'])}
        variant="chip"
        navigationOnly
      />
      <Block bg={theme.backgrounds.surface} borderColor={theme.backgrounds.border} radius="lg" p="lg">
        <Text>{CONTENT_COPY[activeTab]}</Text>
      </Block>
      <Text variant="small" color="muted">
        `navigationOnly` renders just the triggers so you can manage layout and transitions for the content area yourself.
      </Text>
    </Block>
  );
}
```

### Orientation
ID: `Tabs.orientation` • Tags: tabs, orientation • Category: layout • Status: stable • Since: 1.0.0

Compare horizontal and vertical tab lists to understand how orientation influences page layout.

```tsx
type Orientation = 'horizontal' | 'vertical';
const buildItems = (orientation: Orientation) => [
  {
    key: 'general',
    label: 'General',
    content: (
      <Text>
        Broad overview content rendered with a {orientation} tab list.
      </Text>
    )
  },
  {
    key: 'security',
    label: 'Security',
    content: (
      <Text>
        Security controls and permissions laid out for a {orientation} arrangement.
      </Text>
    )
  },
  {
    key: 'notifications',
    label: 'Notifications',
    content: (
      <Text>
        Configure alerts and digests with triggers stacked {orientation === 'vertical' ? 'in a column' : 'in a row'}.
      </Text>
    )
  }
];
const ORIENTATIONS: Array<{ label: string; orientation: Orientation; helper: string }> = [
  {
    label: 'Horizontal orientation',
    orientation: 'horizontal',
    helper: 'Default layout presents tabs in a row for top-level navigation.'
  },
  {
    label: 'Vertical orientation',
    orientation: 'vertical',
    helper: 'Vertical tab lists are ideal for settings sidebars and dense menus.'
  }
];
  return (
    <Block>
      {ORIENTATIONS.map(({ label, orientation, helper }) => (
        <Block key={orientation}>
          <Text weight="medium">{label}</Text>
          <Tabs orientation={orientation} items={buildItems(orientation)} />
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```

### Variants
ID: `Tabs.variants` • Tags: tabs, variants • Category: styling • Status: stable • Since: 1.0.0

Compare the `line`, `chip`, and `folder` visual variants to match tabs with different design aesthetics.

```tsx
type Variant = NonNullable<ComponentProps<typeof Tabs>['variant']>;
const VARIANT_DEMOS: Array<{
  heading: string;
  variant: Variant;
  helper: string;
  items: Array<{ key: string; label: string; description: string }>;
}> = [
  {
    heading: 'Line variant',
    variant: 'line',
    helper: 'Minimal underline style aligns with primary navigation patterns.',
    items: [
      { key: 'documents', label: 'Documents', description: 'Underline emphasizes the active document view.' },
      { key: 'images', label: 'Images', description: 'Great for media browsers with subtle hierarchy.' },
      { key: 'videos', label: 'Videos', description: 'Pairs well with narrow tab bars and dense content.' }
    ]
  },
  {
    heading: 'Chip variant',
    variant: 'chip',
    helper: 'Rounded pills feel tactile and work well for filters or secondary navigation.',
    items: [
      { key: 'overview', label: 'Overview', description: 'Pills highlight the selected state with a filled background.' },
      { key: 'details', label: 'Details', description: 'Suitable for segmented controls or inline filters.' },
      { key: 'settings', label: 'Settings', description: 'Works nicely for preference toggles.' }
    ]
  },
  {
    heading: 'Folder variant',
    variant: 'folder',
    helper: 'Raised folder styling evokes classic tabbed interfaces.',
    items: [
      { key: 'overview-folder', label: 'Overview', description: 'Ideal for dashboards with nested content.' },
      { key: 'details-folder', label: 'Details', description: 'Tabs feel like document dividers for data-heavy views.' },
      { key: 'settings-folder', label: 'Settings', description: 'Keeps controls organized in admin interfaces.' }
    ]
  }
];
  return (
    <Block>
      {VARIANT_DEMOS.map(({ heading, variant, helper, items }) => (
        <Block key={variant}>
          <Text weight="medium">{heading}</Text>
          <Tabs
            variant={variant}
            items={items.map(({ description, ...item }) => ({
              ...item,
              content: <Text>{description}</Text>
            }))}
          />
          <Text variant="small" color="muted">
            {helper}
          </Text>
        </Block>
      ))}
    </Block>
  );
}
```
