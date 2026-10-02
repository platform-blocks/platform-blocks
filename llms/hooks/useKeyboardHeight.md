# useKeyboardHeight

The height of the on-screen keyboard currently covering the app, or 0 when it's hidden, for keeping footers, floating buttons and sheets above the keyboard on native and mobile browsers.

## Metadata

- Import: `import { useKeyboardHeight } from '@plocks/ui';`
- Tags: keyboard, layout, inset, native, mobile
- Docs: https://plocks.dev/hooks/useKeyboardHeight
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/useKeyboardHeight/useKeyboardHeight.ts

## Definition

```ts
export interface UseKeyboardHeightOptions {
  /** Set to `false` to stop tracking; the hook then returns 0. @default true */
  enabled?: boolean;
}

export function useKeyboardHeight(options: UseKeyboardHeightOptions = {}): number;
```

## Examples

### Read the keyboard height

Open this page on a phone and focus the input: the readout follows the keyboard. `useKeyboardHeight({ enabled? })` returns a number of pixels; use it as a `paddingBottom` or `bottom` offset. Desktop browsers always report 0.

On native it follows the keyboard show and hide events (iOS reports them before the keyboard animates), and inside a `KeyboardManagerProvider` it reads that provider's metrics instead of adding listeners. On the web it measures how much of the layout viewport the keyboard covers, using `visualViewport`. Every instance shares one set of listeners, and static rendering sees 0.

```tsx
import { Block, Input, Text, useKeyboardHeight } from '@plocks/ui';

export function Demo() {
  const keyboardHeight = useKeyboardHeight();

  return (
    <Block fullWidth gap="sm">
      <Input placeholder="Focus to open the keyboard" />
      <Text c="muted">Keyboard: {keyboardHeight}px</Text>
    </Block>
  );
}
```
