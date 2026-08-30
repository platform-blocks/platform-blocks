# useHaptics

Trigger platform-native vibration patterns with throttling and graceful fallbacks when haptics are unavailable.

## Metadata

- Canonical name: `useHaptics`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useHaptics } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: feedback
- Tags: haptics, feedback
- Docs: https://react-ui-library.com/hooks/useHaptics
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useHaptics

## Definition

```ts
export interface UseHapticsOptions {
  /** Whether haptics are disabled */
  disabled?: boolean;
  /** Minimum ms between triggers to avoid flood. */
  throttleMs?: number;
}

export interface UseHapticsReturn {
  /** Light impact when press starts */
  impactPressIn: () => void;
  /** A second impact on release (slightly heavier) */
  impactPressOut: () => void;
  /** Convenience for success events (e.g., toast show) */
  notifySuccess: () => void;
  /** Convenience for warning events */
  notifyWarning: () => void;
  /** Convenience for error events */
  notifyError: () => void;
  /** Haptic feedback for selection changes */
  selection: () => void;
}

export function useHaptics(opts: UseHapticsOptions = {}): UseHapticsReturn;
```

## Examples

### Feedback buttons

Map press, selection, and notification events to haptic helpers with built-in throttling.

```tsx
import { Block, Button, Row, Text, useHaptics } from '@platform-blocks/react-ui-library';

export function Demo() {
  const { impactPressIn, impactPressOut, notifySuccess, notifyWarning, notifyError, selection } = useHaptics({ throttleMs: 80 });

  return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <Button onPressIn={impactPressIn} onPressOut={impactPressOut}>Press feedback</Button>
        <Button variant="outline" onPress={selection}>Selection feedback</Button>
      </Row>
      <Text size="sm" weight="semibold">Notifications</Text>
      <Row gap="sm" wrap="wrap">
        <Button size="sm" color="success" onPress={notifySuccess}>Success</Button>
        <Button size="sm" color="warning" onPress={notifyWarning}>Warning</Button>
        <Button size="sm" color="error" onPress={notifyError}>Error</Button>
      </Row>
    </Block>
  );
}
```
