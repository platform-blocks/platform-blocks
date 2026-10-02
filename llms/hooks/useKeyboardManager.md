# useKeyboardManager

Read the on-screen keyboard's visibility, height and animation timing from `KeyboardManagerProvider`, dismiss it, or hand focus to an input by id; for layout that only needs the height, `useKeyboardHeight` is simpler. `useKeyboardMetricsOptional` and `useKeyboardFocusOptional` return one half each, so a consumer re-renders only for what it reads, and like `useKeyboardManagerOptional` they return null instead of throwing without a provider.

## Metadata

- Import: `import { useKeyboardManager } from '@plocks/ui';`
- Tags: keyboard, on-screen-keyboard, focus, native
- Docs: https://plocks.dev/hooks/useKeyboardManager
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/providers/KeyboardManagerProvider.tsx

## Definition

```ts
export type KeyboardManagerContextValue = KeyboardMetrics & KeyboardFocusApi;

export interface KeyboardMetrics {
  /** Indicates if the on-screen keyboard is currently visible */
  isKeyboardVisible: boolean;
  /** Height of the keyboard in pixels when visible */
  keyboardHeight: number;
  /** Native end coordinates from the last keyboard event */
  keyboardEndCoordinates?: KeyboardEvent['endCoordinates'];
  /** Reported animation duration (ms) from the native keyboard event */
  keyboardAnimationDuration: number;
  /** Reported animation easing from the native keyboard event */
  keyboardAnimationEasing?: KeyboardEvent['easing'];
}

export interface KeyboardFocusApi {
  /** Latest focus target requested via `setFocusTarget`; null when none pending */
  pendingFocusTarget: string | null;
  /** Imperative helper for dismissing the keyboard */
  dismissKeyboard: () => void;
  /**
   * Sets an optional focus target that can be consumed by an input after the keyboard closes.
   * Passing null clears the stored target.
   */
  setFocusTarget: (componentId: string | null) => void;
  /**
   * Returns true when the provided component id matches the stored focus target.
   * The focus target is cleared after a successful match.
   */
  consumeFocusTarget: (componentId: string) => boolean;
  /**
   * Helper that records a focus target so the next mounted input can restore focus.
   * Consumers can call `dismissKeyboard` separately when they need to drop the keyboard.
   */
  refocus: (componentId: string, options?: { dismiss?: boolean }) => void;
}

export function useKeyboardManager(): KeyboardManagerContextValue;
```

## Examples

### Keyboard readout

`useKeyboardManager()` returns `isKeyboardVisible`, `keyboardHeight`, `keyboardEndCoordinates` and `keyboardAnimationDuration` / `keyboardAnimationEasing`, plus `dismissKeyboard()` and a focus hand-off: `refocus(id)` marks a target, and the Input, PinInput or AutoComplete whose `keyboardFocusId` matches takes focus (Input and PinInput also match on `name` or `testID`). The metrics come from React Native's `Keyboard` events, so they only move on iOS and Android; on web they stay at hidden and 0. `PlocksProvider` doesn't mount a `KeyboardManagerProvider`, so add one near your app root yourself; `useKeyboardManager` throws without it.

```tsx
import { Badge, Block, Button, Input, Row, Text, useKeyboardManager } from '@plocks/ui';

export function Demo() {
  const { isKeyboardVisible, keyboardHeight, dismissKeyboard, refocus } = useKeyboardManager();

  return (
    <Block fullWidth maw={360}>
      <Input label="Message" keyboardFocusId="message" />

      <Row gap="sm" align="center">
        <Badge c={isKeyboardVisible ? 'success' : 'gray'}>
          {isKeyboardVisible ? 'Visible' : 'Hidden'}
        </Badge>
        <Text ff="monospace">{Math.round(keyboardHeight)}px</Text>
      </Row>

      <Row gap="sm">
        <Button onPress={() => refocus('message')}>Focus</Button>
        <Button variant="outline" onPress={dismissKeyboard}>
          Dismiss
        </Button>
      </Row>
    </Block>
  );
}
```
