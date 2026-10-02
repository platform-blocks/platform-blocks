# Alert

Alert displays prominent messages with severity styles and optional actions.

## Metadata

- Import: `import { Alert } from '@plocks/ui';`
- Tags: alert, notice, notification, message, status, feedback, callout
- Docs: https://plocks.dev/components/Alert
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Alert

## Props

- `variant`: 'light' | 'filled' | 'outline' | 'subtle' = 'light'
- `color`: ThemeColor = 'primary' — Accent color. Without a `severity`, `error` / `warning` colors also make the alert urgent (`role="alert"`); every other color is a polite `role="status"`.
- `severity`: 'info' | 'success' | 'warning' | 'error' — Severity helper — sets the color, the default icon, and the live-region urgency: `error` / `warning` render `role="alert"` (and are announced on mount on native), `info` / `success` render `role="status"`. Prefer it over `color` when the alert carries a status.
- `title`: string
- `children`: React.ReactNode
- `icon`: React.ReactNode | string | null | false
- `fullWidth`: boolean = false
- `withCloseButton`: boolean = false
- `closeButtonLabel`: string = 'Close' — Accessible name of the close button. @default 'Close'
- `onClose`: () => void
- `radius`: RadiusValue = 'md' — Corner radius: theme radius token, px, `'none'` or `'full'`. @default 'md'
- `titleProps`: Omit<TextProps, 'children'> — Override props applied to the title `<Text>` (style, fw, ff, size, c).
- `bodyProps`: Omit<TextProps, 'children'> — Override props applied to the body `<Text>` (the `children` content).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Use `severity` to set it — it picks the matching color and icon automatically.

```tsx
import { Alert, Block } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Alert severity="info" title="Heads up">
        Use alerts to highlight contextual information inline with page content.
      </Alert>
      <Alert severity="success" title="Profile saved">
        Your changes were stored successfully.
      </Alert>
      <Alert severity="error" title="Connection issue">
        Retry the action or check the status page for outages.
      </Alert>
    </Block>
  );
}
```

### Variants

Compare light, outline, filled, and subtle variants to match alert prominence to the message.

```tsx
import { Alert, Block } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Alert variant="light" color="primary" title="Light">
        Balanced background and border treatment for inline notes.
      </Alert>
      <Alert variant="outline" color="success" title="Outline">
        Subtle emphasis without increasing background contrast.
      </Alert>
      <Alert variant="filled" color="warning" title="Filled">
        High-contrast option for urgent messaging.
      </Alert>
      <Alert variant="subtle" color="error" title="Subtle">
        No background color, but tinted icon and text.
      </Alert>
    </Block>
  );
}
```

### Dismissible

Add `withCloseButton` and handle `onClose` to let users dismiss an alert.

```tsx
import { useState } from 'react';
import { Alert, Button } from '@plocks/ui';

export function Demo() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <Button variant="outline" onPress={() => setVisible(true)}>
        Show alert
      </Button>
    );
  }

  return (
    <Alert
      severity="warning"
      title="Draft warning"
      withCloseButton
      onClose={() => setVisible(false)}
    >
      Your draft is missing a title. Resolve before publishing.
    </Alert>
  );
}
```
