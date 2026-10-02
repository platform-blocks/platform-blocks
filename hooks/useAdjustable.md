# useAdjustable

Make a custom value control (a slider, knob or meter) adjustable. It gives the control `role="slider"` with its value range, arrow/Page/Home/End keys on web, and increment/decrement actions for VoiceOver and TalkBack.

## Metadata

- Import: `import { useAdjustable } from '@plocks/ui';`
- Tags: accessibility, keyboard, slider, value
- Docs: https://plocks.dev/hooks/useAdjustable
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/accessibility/useAdjustable.ts

## Definition

```ts
export interface UseAdjustableOptions {
  value: number;
  min: number;
  max: number;
  /** Arrow-key / accessibility-action step. Default: 1, or 1% of the range if `step <= 0`. */
  step?: number;
  /** PageUp/PageDown distance. Default: 10% of the range. */
  largeStep?: number;
  /** Called with every new value. */
  onChange: (value: number) => void;
  /** Called after each discrete adjustment (keyboard, accessibility action). */
  onChangeEnd?: (value: number) => void;
  /** Accessible name. */
  label?: string;
  labelledBy?: IdRefs;
  describedBy?: IdRefs;
  /** Native hint. */
  hint?: string;
  /** Spoken value (`'40 percent'`), or a formatter. */
  valueText?: string | ((value: number) => string);
  /** Default `'horizontal'`. Only horizontal arrows swap under RTL. */
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  readOnly?: boolean;
  /** Override reading direction. Default: `useDirection().isRTL`. */
  rtl?: boolean;
  /**
   * Endless controls (a rotary knob with no stops): values are not clamped and
   * Home/End do nothing.
   */
  endless?: boolean;
  /**
   * Custom stepping (detents, marks): the next value from `current` in
   * `direction` for a nudge of `amount`. Result is still clamped (unless endless).
   */
  getNextValue?: (current: number, direction: 1 | -1, amount: number) => number;
  /** Values for Home/End. Default `min` / `max`. */
  getBoundValue?: (bound: 'min' | 'max') => number;
  /** Element id. */
  id?: string;
}

export interface UseAdjustableResult {
  /** Spread on the focusable thumb. */
  adjustableProps: AdjustableProps;
  /** Nudge up by `amount` (default `step`). */
  increment: (amount?: number) => void;
  /** Nudge down by `amount` (default `step`). */
  decrement: (amount?: number) => void;
  /** The key handler, for elements that route keys themselves. Returns true when handled. */
  handleKeyDown: (event: KeyboardEventLike) => boolean;
}

export type AdjustableProps = A11yProps & {
  /** Web only: the thumb is a tab stop unless disabled. */
  tabIndex?: 0 | -1;

export function useAdjustable(options: UseAdjustableOptions): UseAdjustableResult;
```

## Examples

### Custom volume slider

The bar meter is the slider. Tab to it: the arrow keys move by `step` (Shift+arrow by ten steps, and the horizontal arrows swap under RTL), PageUp/PageDown move by `largeStep` (default 10% of the range), and Home/End jump to `min` / `max`. VoiceOver and TalkBack adjust it with their increment/decrement gestures and read `valueText` ("60 percent"). `useAdjustable({ value, min, max, step, onChange, label, valueText })` returns `adjustableProps` for the focusable element, `increment` / `decrement` (the − and + buttons here) and `handleKeyDown`; each change is clamped to the range and calls `onChange`, then `onChangeEnd`. It also takes `disabled`, `readOnly`, `orientation: 'vertical'`, `endless` (no clamping and no Home/End) and `getNextValue` for detents.

```tsx
import { useState } from 'react';
import { Block, IconButton, useAdjustable } from '@plocks/ui';

const LEVELS = 10;

export function Demo() {
  const [level, setLevel] = useState(6);
  const { adjustableProps, increment, decrement } = useAdjustable({
    value: level,
    min: 0,
    max: LEVELS,
    step: 1,
    onChange: setLevel,
    label: 'Volume',
    valueText: (value) => `${value * 10} percent`,
  });

  return (
    <Block direction="row" align="center" gap="sm">
      <IconButton icon="minus" variant="ghost" accessibilityLabel="Quieter" onPress={() => decrement()} />
      <Block {...adjustableProps} direction="row" align="flex-end" gap={4} p="xs" radius="sm">
        {Array.from({ length: LEVELS }, (_, index) => (
          <Block
            key={index}
            w={8}
            h={8 + index * 3}
            radius={2}
            bg={index < level ? 'primary.5' : 'borderStrong'}
          />
        ))}
      </Block>
      <IconButton icon="plus" variant="ghost" accessibilityLabel="Louder" onPress={() => increment()} />
    </Block>
  );
}
```
