# useRovingFocus

Give a composite widget (toolbar, tab list, radio group, grid) a single tab stop. Arrow keys, Home/End and optional typeahead move focus between its items.

## Metadata

- Import: `import { useRovingFocus } from '@plocks/ui';`
- Tags: accessibility, keyboard, focus
- Docs: https://plocks.dev/hooks/useRovingFocus
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/core/accessibility/useRovingFocus.ts

## Definition

```ts
export interface UseRovingFocusOptions {
  /** Number of items in the group. */
  count: number;
  /** Which arrow keys move. `'both'` + `columns` makes a grid. Default `'horizontal'`. */
  orientation?: RovingOrientation;
  /** Wrap from the last item to the first and back. Default `true` (grids never wrap vertically). */
  loop?: boolean;
  /** Controlled active (tab-stop) index. */
  activeIndex?: number;
  /** Initial active index when uncontrolled. Default `0`. */
  defaultActiveIndex?: number;
  /** Called with the new index when keyboard/focus moves the active item. */
  onActiveChange?: (index: number) => void;
  /** Text of item `i` for typeahead (type a letter to jump). Omit to disable typeahead. */
  typeahead?: (index: number) => string;
  /** Override reading direction. Default: `useDirection().isRTL`. */
  rtl?: boolean;
  /** Grid width for `orientation: 'both'` (Calendar: 7). Up/Down move by a row. */
  columns?: number;
  /** Items to skip (disabled tabs, options...). */
  isDisabled?: (index: number) => boolean;
  /** Move DOM focus to the new active item (web). Default `true`. */
  moveFocus?: boolean;
}

export interface UseRovingFocusResult {
  /** The current tab stop (first enabled item when the requested one is unusable). */
  activeIndex: number;
  /** Set the active index without moving focus. */
  setActiveIndex: (index: number) => void;
  /** Make `index` active and move focus to it (web). */
  focusItem: (index: number) => void;
  /** Props for item `index` (spread on a Pressable/View). */
  getItemProps: (index: number) => RovingItemProps;
  /** The key handler, for containers that route keys themselves. Returns true when handled. */
  handleKeyDown: (event: KeyboardEventLike, index: number) => boolean;
}

export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

export interface RovingItemProps {
  /** 0 on the active item, -1 on the rest: one tab stop for the whole group. */
  tabIndex: 0 | -1;
  ref: (node: unknown) => void;
  onKeyDown: (event: KeyboardEventLike) => void;
  onFocus: () => void;
}

export function useRovingFocus(options: UseRovingFocusOptions): UseRovingFocusResult;
```

## Examples

### Toolbar with one tab stop

Tab reaches the toolbar once. ←/→ move between the buttons (wrapping at the ends, and swapped under RTL), Home/End jump to the first and last, and Tab leaves the group. `useRovingFocus({ count })` returns `getItemProps(i)` (`tabIndex`, `ref`, `onKeyDown`, `onFocus`) to spread on each item, plus `activeIndex`, `focusItem` and `handleKeyDown` for items that route keys themselves. Other options: `orientation` (`'vertical'`, or `'both'` with `columns` for a grid where ↑/↓ move by a row), `loop`, controlled `activeIndex` / `onActiveChange`, `isDisabled` to skip items, and `typeahead: (i) => label` to jump to an item by typing its first letters. Keys and DOM focus are web-only; on native the item props are inert apart from `tabIndex`.

```tsx
import { useState } from 'react';
import { Block, IconButton, a11yProps, useRovingFocus } from '@plocks/ui';

const TOOLS = [
  { icon: 'bold', label: 'Bold' },
  { icon: 'italic', label: 'Italic' },
  { icon: 'underline', label: 'Underline' },
  { icon: 'strikethrough', label: 'Strikethrough' },
  { icon: 'code', label: 'Code' },
];

export function Demo() {
  const [active, setActive] = useState<string[]>(['Bold']);
  const { getItemProps } = useRovingFocus({ count: TOOLS.length });

  const toggle = (label: string) =>
    setActive((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label]
    );

  return (
    <Block
      direction="row"
      gap="xs"
      p="xs"
      radius="md"
      bg="subtle"
      {...a11yProps({ role: 'toolbar', label: 'Text formatting', orientation: 'horizontal' })}
    >
      {TOOLS.map((tool, index) => {
        const on = active.includes(tool.label);
        return (
          <IconButton
            key={tool.label}
            icon={tool.icon}
            variant={on ? 'filled' : 'ghost'}
            accessibilityLabel={tool.label}
            onPress={() => toggle(tool.label)}
            {...getItemProps(index)}
            {...a11yProps({ pressed: on })}
          />
        );
      })}
    </Block>
  );
}
```
