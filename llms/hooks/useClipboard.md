# useClipboard

Copy values to the system clipboard with optimistic status updates and optional reset timers.

## Metadata

- Import: `import { useClipboard } from '@plocks/ui';`
- Tags: clipboard, copy
- Docs: https://plocks.dev/hooks/useClipboard
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useClipboard/index.ts

## Definition

```ts
export interface UseClipboardOptions {
  /** Time in ms after which the copied state will reset, 2000 by default. `0` keeps it until `reset()`. */
  timeout?: number;
}

export interface UseClipboardReturnValue {
  /**
   * Copies `value` (strings as-is, anything else JSON-stringified). Resolves
   * `true` once the text is on the clipboard, `false` when copying failed —
   * the failure also lands in `error`; it never rejects.
   */
  copy: (value: unknown) => Promise<boolean>;
  /** Function to reset copied state and error */
  reset: () => void;
  /** Error if copying failed */
  error: Error | null;
  /** Boolean indicating if the value was copied successfully */
  copied: boolean;
  /** The last copied value (stringified) */
  lastValue: string | null;
  /**
   * True when there is no way to copy: web without both `navigator.clipboard`
   * and the `execCommand('copy')` fallback, or native without `expo-clipboard`.
   * Always `false` during server rendering and hydration.
   */
  unsupported: boolean;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturnValue;
```

## Examples

### Copy invite link

Trigger clipboard writes and expose helpful status text while the hook handles fallbacks and resets.

```tsx
import { useState } from 'react';
import { Badge, Block, Button, Input, useClipboard } from '@plocks/ui';

const INVITE_URL = 'https://app.example.com/invite/engineering';

export function Demo() {
  const { copy, copied, unsupported, lastValue } = useClipboard({ timeout: 1500 });
  const [value, setValue] = useState(INVITE_URL);

  return (
    <Block align="flex-start" maw={460} fullWidth>
      <Input
        label="Invite URL"
        value={value}
        onChangeText={setValue}
        error={unsupported ? 'Clipboard access is not available in this environment.' : undefined}
        description="The copied state resets automatically after 1.5 seconds."
        textInputProps={{ autoCapitalize: 'none' }}
      />
      <Button onPress={() => copy(value)} disabled={unsupported}>
        {copied ? 'Copied!' : 'Copy link'}
      </Button>
      {lastValue ? (
        <Badge variant="subtle" c={copied ? 'success' : 'gray'}>
          Last copied: {lastValue}
        </Badge>
      ) : null}
    </Block>
  );
}
```
