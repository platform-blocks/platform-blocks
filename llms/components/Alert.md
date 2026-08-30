# Alert

The Alert component displays important messages to users with different severity levels, variants, and optional actions like dismissal. Title and body each accept full `<Text>` props via `titleProps` / `bodyProps`.

## Metadata

- Canonical name: `Alert`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Alert } from '@platform-blocks/react-ui-library';`
- Category: feedback
- Tags: alert, notice, notification, message, status, feedback, callout
- Docs: https://react-ui-library.com/components/Alert
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Alert

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | AlertVariant | No | 'light' |  |
| `color` | ThemeColor | No | 'primary' |  |
| `severity` | AlertSeverity | No |  | Severity helper — sets both the color and the default icon (`info \| success \| warning \| error`). More than a color: prefer it over `color` when the alert carries a status, so the icon comes with it. |
| `title` | string | No |  |  |
| `children` | React.ReactNode | No |  |  |
| `icon` | React.ReactNode \| string \| null \| false | No |  |  |
| `fullWidth` | boolean | No | false |  |
| `withCloseButton` | boolean | No | false |  |
| `closeButtonLabel` | string | No |  |  |
| `onClose` | () => void | No |  |  |
| `style` | StyleProp<ViewStyle> | No |  |  |
| `testID` | string | No |  |  |
| `titleProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the title `<Text>` (style, weight, ff, size, color). |
| `bodyProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the body `<Text>` (the `children` content). |
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
| `radius` | RadiusValue | No | 'md' | Border radius value - supports size tokens, numbers, and special values |

## Examples

### Basics
ID: `Alert.basic` • Tags: alerts • Category: basics • Status: stable • Since: 1.0.0

Use `severity` to set it — it picks the matching color and icon automatically.

```tsx
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
ID: `Alert.variants` • Tags: alerts, variants • Category: styling • Status: stable • Since: 1.0.0

Compare light, outline, filled, and subtle variants to match alert prominence to the message.

```tsx
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
ID: `Alert.interactive` • Tags: alerts, dismissible • Category: interaction • Status: stable • Since: 1.0.0

Add `withCloseButton` and handle `onClose` to let users dismiss an alert.

```tsx
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
