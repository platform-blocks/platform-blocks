# useAccessibility

Read the whole `AccessibilityProvider` context at once: `announce()`, the announcement log, focus tracking, and screen reader and reduced-motion state. It re-renders on every change, so when you only need one of these, use `announce` or `useReducedMotion` instead.

## Metadata

- Import: `import { useAccessibility } from '@plocks/ui';`
- Tags: accessibility, announce, screen-reader, provider
- Docs: https://plocks.dev/hooks/useAccessibility
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/accessibility/context.tsx

## Definition

```ts
export function useAccessibility(): AccessibilityContextValue;
```

## Examples

### Announcement log

`announce(message, priority?)` speaks through the screen reader (a live region on web, `AccessibilityInfo` on native) and adds the message to `announcements`, a log that drops each entry after 3 s, or 5 s for `'assertive'`. The value also has `clearAnnouncements`, `prefersReducedMotion`, `screenReaderEnabled` (always `false` on web because browsers do not expose this state), and a focus log, `currentFocusId` / `focusHistory` / `setFocus(id)` / `restoreFocus()`, that records ids without moving focus. `useAccessibility()` throws outside an `AccessibilityProvider`. `PlocksProvider` already mounts one, and `<AccessibilityProvider reducedMotion>` forces reduced motion for its subtree. Because it re-renders on every focus change and announcement, use the standalone `announce(message, { politeness })` or `useReducedMotion()` when that is all you need.

```tsx
import { Block, Button, Text, useAccessibility } from '@plocks/ui';

export function Demo() {
  const { announce, announcements } = useAccessibility();

  return (
    <Block align="flex-start">
      <Button onPress={() => announce(`Draft saved at ${new Date().toLocaleTimeString()}`)}>Save draft</Button>

      {announcements.map((message, index) => (
        <Text key={`${index}-${message}`} size="sm">
          {message}
        </Text>
      ))}
    </Block>
  );
}
```
