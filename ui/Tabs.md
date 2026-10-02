# Tabs

Tabs organize content into multiple sections that users can navigate between. The component supports various visual styles, orientations, and interactive behaviors while maintaining accessibility standards.

## Metadata

- Import: `import { Tabs } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Tabs
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Tabs

## Props

- `items` (required): TabItem[] — Array of tab definitions to render. The first item becomes active by default when uncontrolled.
- `value`: string — Controlled active tab key. When omitted the component manages internal state.
- `defaultValue`: string — Initially active tab key when uncontrolled (a persisted selection wins). Defaults to the first item.
- `onChange`: (tabKey: string) => void — Called with the tab key whenever the active tab changes. Fires for both controlled and uncontrolled usage.
- `activationMode`: 'automatic' | 'manual' = 'automatic' — Keyboard activation. `'automatic'` selects a tab as soon as arrow keys move focus to it; `'manual'` only moves focus, and Enter/Space selects.
- `onDisabledTabPress`: (tabKey: string, item: TabItem) => void — Invoked when a disabled tab is pressed, allowing custom messaging or recovery flows.
- `variant`: 'line' | 'chip' | 'card' | 'folder' = 'line' — Visual style of the tabs.
- `size`: SizeValue = 'sm' — Size token controlling text and padding.
- `color`: ColorProp = 'primary' — Theme color token or custom color used for indicators and active states.
- `orientation`: 'horizontal' | 'vertical' = 'horizontal' — Orientation of the tab list.
- `location`: 'start' | 'end' = 'start' — Placement of the tabs relative to their content. Influences indicator positioning.
- `scrollable`: boolean = false — Enables scrolling when tabs overflow the available axis.
- `animated`: boolean = true — Enables animated indicator transitions between tabs.
- `animationDuration`: number = 250 — Duration (ms) for indicator animations when `animated` is true.
- `transitionDuration`: number = 250 — Duration (ms) of the indicator transition. Cross-component spelling that takes precedence over `animationDuration`; `0` moves the indicator instantly. Always 0 under reduced motion.
- `tabStyle`: StyleProp<ViewStyle> — Style overrides applied to each tab pressable.
- `contentStyle`: StyleProp<ViewStyle> — Style for the active tab content wrapper.
- `textStyle`: StyleProp<TextStyle> — Additional text style applied to tab labels.
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to each tab's label `<Text>` (style, fw, ff, size, c). Applies to all tabs in the strip; per-tab styling can still be done via `TabItem.label` (custom node).
- `disabledKeys`: string[] — Array of tab keys that should be rendered disabled.
- `radius`: RadiusValue — Corner radius of every tab (chip, card and folder variants): a radius token, px number, `'none'` or `'full'`.
- `tabCornerRadius`: number — Corner radius applied to the tab elements (variant dependent).
- `contentCornerRadius`: number — Corner radius applied to the content panel. Falls back to theme defaults when omitted.
- `indicatorThickness`: number — Thickness (px) of the line indicator. Applies to `line` variant primarily.
- `tabGap`: number — Gap (px) inserted between tabs.
- `activeTabBackgroundColor`: string — Override background color for the active tab. Accepts theme tokens.
- `inactiveTabBackgroundColor`: string — Override background color for inactive tabs.
- `activeTabTextColor`: string — Explicit text color for the active tab label.
- `persistKey`: string — Key used to persist the active tab selection across sessions.
- `autoPersist`: boolean = true — Determines whether internal persistence should be enabled when `persistKey` is provided.
- `navigationOnly`: boolean = false — When true, the component only renders the tab list and forwards children for custom content.
- `children`: ReactNode — Optional custom content rendered below the tab list when `navigationOnly` is enabled.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface TabItem {
  /**
   * Unique identifier for the tab. This is also the value returned in callbacks and
   * persisted when `persistKey` / `autoPersist` are used.
   */
  key: string;
  /**
   * Main tab label. Accepts a string or custom React node for iconographic or styled content.
   */
  label: string | ReactNode;
  /**
   * Optional secondary content beside the label. A string renders as a
   * superscript; a node (e.g. a count `Badge`) renders as given.
   */
  subLabel?: string | ReactNode;
  /**
   * Content rendered when the tab becomes active. Ignored when `navigationOnly` is true.
   */
  content: ReactNode;
  /**
   * When true the tab is visually disabled and interaction is delegated to `onDisabledTabPress`.
   */
  disabled?: boolean;
  /**
   * Optional icon rendered alongside the label (decorative: hidden from
   * assistive technology).
   */
  icon?: ReactNode;
  /**
   * Accessible name for the tab. Required when `label` has no text (an
   * icon-only tab); otherwise the name comes from the label.
   */
  accessibilityLabel?: string;
}
```

## Examples

### Basics

Pass `items` with a `key`, `label`, and `content` for each tab; the active tab's content renders below the tab list.

```tsx
import { Block, Tabs, Text } from '@plocks/ui';

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

export function Demo() {
  return (
    <Block fullWidth>
      <Tabs items={ITEMS} />
    </Block>
  );
}
```

### Animated transitions

Enable `animated` and set `animationDuration` (in ms) to control how quickly the indicator slides between tabs.

```tsx
import { Block, Tabs, Text } from '@plocks/ui';

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
    key: 'settings',
    label: 'Settings',
    content: <Text>Manage workspace preferences.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      <Tabs animated animationDuration={500} items={ITEMS} />
    </Block>
  );
}
```

### Disabled tabs

Show how to disable a tab while capturing interaction attempts through `onDisabledTabPress` for auditing or messaging.

```tsx
import { useState } from 'react';
import { Block, Tabs, Text } from '@plocks/ui';

const ITEMS = [
  {
    key: 'overview',
    label: 'Overview',
    content: <Text>High-level snapshot of product activity and health.</Text>
  },
  {
    key: 'analytics',
    label: 'Analytics',
    content: <Text>Dive into usage metrics, adoption trends, and retention.</Text>
  },
  {
    key: 'billing',
    label: 'Billing',
    content: <Text>Billing is temporarily disabled while invoices reconcile.</Text>,
    disabled: true
  },
  {
    key: 'settings',
    label: 'Settings',
    content: <Text>Manage workspace preferences and security controls.</Text>
  }
];

export function Demo() {
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);

  return (
    <Block fullWidth>
      <Tabs items={ITEMS} onDisabledTabPress={setLastAttempt} />
      {lastAttempt && (
        <Text variant="small" c="muted">
          Pressed disabled tab: {lastAttempt}
        </Text>
      )}
    </Block>
  );
}
```

### Controlled state

Demonstrates controlled tabs that surface the active label and rely on external state updates via `onChange`.

```tsx
import { useState } from 'react';
import { Block, Tabs, Text } from '@plocks/ui';

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

export function Demo() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const activeLabel = ITEMS.find((item) => item.key === activeTab)?.label ?? activeTab;

  return (
    <Block fullWidth>
      <Tabs value={activeTab} onChange={setActiveTab} items={ITEMS} />
      <Text variant="small" c="muted">
        Active tab: {activeLabel}
      </Text>
    </Block>
  );
}
```

### Location

Switch tab placement between `start` and `end` to position triggers above or below the associated content.

```tsx
import { Block, Tabs, Text } from '@plocks/ui';

const LOCATIONS = ['start', 'end'] as const;

const ITEMS = [
  {
    key: 'home',
    label: 'Home',
    content: <Text>Home content.</Text>
  },
  {
    key: 'settings',
    label: 'Settings',
    content: <Text>Update your configuration.</Text>
  },
  {
    key: 'profile',
    label: 'Profile',
    content: <Text>Profile information.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      {LOCATIONS.map((location) => (
        <Block key={location} fullWidth>
          <Text variant="small" c="secondary">{location}</Text>
          <Tabs location={location} items={ITEMS} />
        </Block>
      ))}
    </Block>
  );
}
```

### Navigation only

Demonstrates `navigationOnly` tabs that render the triggers separately while a custom container handles the content region.

```tsx
import { useMemo, useState } from 'react';
import { Block, Tabs, Text, useTheme } from '@plocks/ui';

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

export function Demo() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<typeof NAV_ITEMS[number]['key']>('home');

  const items = useMemo(
    () => NAV_ITEMS.map(({ key, label }) => ({ key, label, content: null })),
    []
  );

  return (
    <Block fullWidth>
      <Tabs
        items={items}
        value={activeTab}
        onChange={(tabKey) => setActiveTab(tabKey as typeof NAV_ITEMS[number]['key'])}
        variant="chip"
        navigationOnly
      />
      <Block bg={theme.backgrounds.surface} borderColor={theme.backgrounds.border} radius="lg" p="lg">
        <Text>{CONTENT_COPY[activeTab]}</Text>
      </Block>
    </Block>
  );
}
```

### Orientation

Compare horizontal and vertical tab lists to understand how orientation influences page layout.

```tsx
import { Block, Tabs, Text } from '@plocks/ui';

const ORIENTATIONS = ['horizontal', 'vertical'] as const;

const ITEMS = [
  {
    key: 'general',
    label: 'General',
    content: <Text>Broad overview content.</Text>
  },
  {
    key: 'security',
    label: 'Security',
    content: <Text>Security controls and permissions.</Text>
  },
  {
    key: 'notifications',
    label: 'Notifications',
    content: <Text>Configure alerts and digests.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      {ORIENTATIONS.map((orientation) => (
        <Block key={orientation} fullWidth>
          <Text variant="small" c="secondary">{orientation}</Text>
          <Tabs orientation={orientation} items={ITEMS} />
        </Block>
      ))}
    </Block>
  );
}
```

### Variants

Compare the `line`, `chip`, and `folder` visual variants to match tabs with different design aesthetics.

```tsx
import { Block, Tabs, Text } from '@plocks/ui';

const VARIANTS = ['line', 'chip', 'folder'] as const;

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
    key: 'settings',
    label: 'Settings',
    content: <Text>Manage workspace preferences.</Text>
  }
];

export function Demo() {
  return (
    <Block fullWidth>
      {VARIANTS.map((variant) => (
        <Block key={variant} fullWidth>
          <Text variant="small" c="secondary">{variant}</Text>
          <Tabs variant={variant} items={ITEMS} />
        </Block>
      ))}
    </Block>
  );
}
```
