# useClipboard

Copy values to the system clipboard with optimistic status updates and optional reset timers.

## Metadata

- Canonical name: `useClipboard`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useClipboard } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: productivity
- Tags: clipboard, copy
- Docs: https://react-ui-library.com/hooks/useClipboard
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useClipboard

## Definition

```ts
export interface UseClipboardOptions {
  /** Time in ms after which the copied state will reset, 2000 by default */
  timeout?: number;
}

export interface UseClipboardReturnValue {
  /** Function to copy value to clipboard */
  copy: (value: any) => Promise<void> | void;
  /** Function to reset copied state and error */
  reset: () => void;
  /** Error if copying failed */
  error: Error | null;
  /** Boolean indicating if the value was copied successfully */
  copied: boolean;
  /** The last copied value (stringified) */
  lastValue: string | null;
  /** True if clipboard API not available */
  unsupported: boolean;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturnValue;
```

## Examples

### Copy invite link

Trigger clipboard writes and expose helpful status text while the hook handles fallbacks and resets.

```tsx
import { useState } from 'react';
import { Badge, Block, Button, Input, useClipboard } from '@platform-blocks/react-ui-library';

const INVITE_URL = 'https://app.example.com/invite/engineering';

export function Demo() {
  const { copy, copied, unsupported, lastValue } = useClipboard({ timeout: 1500 });
  const [value, setValue] = useState(INVITE_URL);

  return (
    <Block align="flex-start" maxW={460} fullWidth>
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
        <Badge variant="subtle" color={copied ? 'success' : 'gray'}>
          Last copied: {lastValue}
        </Badge>
      ) : null}
    </Block>
  );
}
```
