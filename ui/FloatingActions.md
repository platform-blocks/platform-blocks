# FloatingActions

FloatingActions places related commands above a trigger or fans them out in a flower layout. It opens on click or hover, supports controlled state, and uses theme-aware IconButtons for its trigger and actions. Labels can appear on hover and focus or stay visible.

## Metadata

- Import: `import { FloatingActions } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/FloatingActions
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/FloatingActions

## Props

- `actions`: FloatingActionItem[] — Custom actions. If not provided, defaults to a theme toggle, plus Spotlight and GitHub when `onOpenSpotlight` / `githubUrl` are set
- `onOpen`: () => void — Called when the speed dial opens
- `onClose`: () => void — Called when the speed dial closes
- `opened`: boolean — Controlled open state.
- `defaultOpened`: boolean = false — Initial open state when uncontrolled. @default false
- `onChange`: (opened: boolean) => void — Called when an interaction requests an open-state change.
- `trigger`: 'click' | 'hover' = 'click' — How the dial opens on web. Tap and keyboard activation work in either mode. @default 'click'
- `disableOutsideClose`: boolean = false — If true, clicking/tapping outside will not close the menu (web)
- `mode`: 'stack' | 'flower' = 'stack' — Action layout. @default 'stack'
- `labelMode`: 'tooltip' | 'persistent' | 'none' = 'tooltip' — How action labels appear. @default 'tooltip'
- `arcRadius`: number = 88 — Minimum radius (in px) of the flower layout. @default 88
- `color`: ColorProp = 'primary' — Button color: palette token, `'primary.6'` shade syntax, or CSS color. @default 'primary'
- `variant`: 'default' | 'filled' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'none' = 'filled' — Trigger and default action appearance. @default 'filled'
- `toggleIcon`: string = 'plus' — Trigger icon while closed. @default 'plus'
- `closeIcon`: string — Trigger icon while open. Defaults to a rotated plus when `toggleIcon` is `'plus'`, otherwise `'close'`.
- `onOpenSpotlight`: () => void — Opens Spotlight; the default Spotlight action is only shown when this is set
- `onToggleTheme`: () => void — Handler to toggle theme (if omitted, the Theme action still shows but will be a no-op)
- `githubUrl`: string — Repository URL for the default GitHub action; the action is only shown when this is set
- `toggleLabels`: { open: string; close: string } = { open: 'Open actions', close: 'Close actions' } — Accessible names of the main button. @default { open: 'Open actions', close: 'Close actions' }
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
export interface FloatingActionItem {
  key: string;
  /** Icon registry name */
  icon?: string;
  /** Icon name computed at render time (e.g. reflecting the current theme mode) */
  getIcon?: () => string;
  onPress: () => void;
  /** Visible label; defaults to `accessibilityLabel`, then `key` */
  label?: string;
  /** Accessible name of the action (falls back to `key`, with a dev warning) */
  accessibilityLabel?: string;
  /** Extra description for screen readers (native) */
  accessibilityHint?: string;
  /** Use the Button theme roles for each action. @default 'filled' */
  variant?: IconButtonVariant;
  /** Override the dial's color for this action. */
  color?: ColorProp;
  /** Disabled actions remain visible but cannot be activated. */
  disabled?: boolean;
}
```

## Examples

### Basics

The default stack places actions above the main button. `trigger="click"` opens on press; `trigger="hover"` opens when a mouse enters the dial and closes shortly after it leaves. Tap and keyboard activation still work in hover mode. Use `labelMode="persistent"` to keep labels visible or `labelMode="tooltip"` to show them on hover and keyboard focus. `mode="flower"` fans actions up and toward the start side. The trigger and actions use `IconButton`, so their icon contrast, focus ring, pressed state, and theme colors follow the same rules as Button. Set `color` and `variant` on the dial, or override them on an individual action. Actions can also be `disabled`. Use `toggleIcon` and `closeIcon` to customize the trigger. For controlled use, pass `opened` and `onChange`. Keep the dial to a few related commands (roughly three to six). Persistent labels are easier to discover on touch screens, where hover tooltips are unavailable.

```tsx
import { useState } from 'react';
import { Block, Column, FloatingActions, Text } from '@plocks/ui';

export function Demo() {
  const [message, setMessage] = useState('Choose an action');
  const actions = [
    { key: 'create', icon: 'plus', accessibilityLabel: 'Create item', color: 'success' as const, onPress: () => setMessage('Created') },
    { key: 'search', icon: 'search', accessibilityLabel: 'Search items', onPress: () => setMessage('Search selected') },
    { key: 'info', icon: 'info', accessibilityLabel: 'Show details', onPress: () => setMessage('Details selected') },
  ];

  return (
    <Column gap="lg" fullWidth>
      <Block fullWidth h={280} position="relative" p="md">
        <Text fw="semibold">Click or tap · persistent labels</Text>
        <Text>{message}</Text>
        <FloatingActions trigger="click" mode="stack" labelMode="persistent" actions={actions} />
      </Block>
      <Block fullWidth h={220} position="relative" p="md">
        <Text fw="semibold">Hover · flower layout · focus for labels</Text>
        <FloatingActions trigger="hover" mode="flower" labelMode="tooltip" actions={actions} />
      </Block>
    </Column>
  );
}
```

### Variants

Compare the floating trigger appearance across four IconButton variants.

```tsx
import { Block, Column, FloatingActions, Text } from '@plocks/ui';

const actions = [{ key: 'add', icon: 'plus', label: 'Add item', onPress: () => {} }];
const variants = ['filled', 'default', 'outline', 'ghost'] as const;

export function Demo() {
  return (
    <Column gap="md" fullWidth>
      {variants.map(variant => (
        <Block key={variant} position="relative" h={110} fullWidth p="sm">
          <Text fw="semibold">{variant}</Text>
          <FloatingActions variant={variant} actions={actions} />
        </Block>
      ))}
    </Column>
  );
}
```
