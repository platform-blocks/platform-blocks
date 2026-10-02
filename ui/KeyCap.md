# KeyCap

A visual component for displaying keyboard keys, shortcuts, and key combinations with proper styling.

## Metadata

- Import: `import { KeyCap } from '@plocks/ui';`
- Tags: keycap, keyboard, shortcut, key, hotkey
- Docs: https://plocks.dev/components/KeyCap
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/KeyCap

## Props

- `children` (required): ReactNode — The key or text to display
- `size`: ComponentSizeValue = 'md' — Size token (a key cap renders below a control of the same size), or the height in px
- `variant`: 'default' | 'minimal' | 'outline' | 'filled' = 'default' — Visual variant of the key cap
- `color`: ColorProp = 'gray' — Color for the `minimal`, `outline` and `filled` variants: a palette token, `'primary.6'` shade syntax, or any CSS color. `default` stays neutral.
- `animateOnPress`: boolean = true — Whether the key should animate when the actual key is pressed Only works on web platforms
- `transitionDuration`: number = 250 — Length of the press-down/up animation in ms; both legs scale against a 250ms baseline. `0` leaves the cap at rest. Always 0 under reduced motion.
- `keyCode`: string — The actual key code to listen for (e.g., 'Enter', 'Space', 'Escape') If provided, the component will animate when this key is pressed (web)
- `modifiers`: KeyCapModifier[] — Modifier keys that must be pressed along with the main key
- `pressed`: boolean = false — Whether the key cap should appear pressed
- `onKeyPress`: () => void — Callback when the key combination is pressed (web)
- `ff`: string — Custom font family (overrides the theme's monospace stack)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), sizing (`fullWidth`), `radius`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Related hooks

- `useKeyCapStyles(props: KeyCapStyleProps)` — Returns the `{ container, text }` styles of a key cap for the current theme, given its `metrics`, `variant`, `color` and `pressed` state — the hook form of `getKeyCapStyles`, for drawing a custom key that matches `KeyCap`.

## Types

```ts
export type KeyCapModifier = 'ctrl' | 'cmd' | 'alt' | 'shift' | 'meta';
```

## Examples

### Basics

Basic keyboard key display for showing shortcuts and key combinations.

```tsx
import { Block, KeyCap, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <KeyCap>A</KeyCap>
        <KeyCap>Enter</KeyCap>
        <KeyCap>Space</KeyCap>
        <KeyCap>⌘</KeyCap>
        <KeyCap>Ctrl</KeyCap>
        <KeyCap>⇧</KeyCap>
      </Row>
    </Block>
  );
}
```

### Sizes

Different sizes for KeyCap components from extra small to extra large.

```tsx
import { Block, KeyCap, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <Row gap="sm" align="center" wrap="wrap">
        <KeyCap size="xs">XS</KeyCap>
        <KeyCap size="sm">SM</KeyCap>
        <KeyCap size="md">MD</KeyCap>
        <KeyCap size="lg">LG</KeyCap>
        <KeyCap size="xl">XL</KeyCap>
      </Row>
    </Block>
  );
}
```

### Variants

Different visual variants for KeyCap components including default, filled, minimal, and outline styles.

```tsx
import { Block, KeyCap, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <KeyCap variant="default">Default</KeyCap>
        <KeyCap variant="filled">Filled</KeyCap>
        <KeyCap variant="minimal">Minimal</KeyCap>
        <KeyCap variant="outline">Outline</KeyCap>
      </Row>
    </Block>
  );
}
```

### Modifiers

KeyCap components with modifier keys for displaying keyboard shortcuts and key combinations.

```tsx
import { Block, KeyCap, Row, Text } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Row gap="xs" align="center">
        <Text>Copy</Text>
        <KeyCap keyCode="C" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="C" modifiers={['cmd']} size="sm">C</KeyCap>
      </Row>
      <Row gap="xs" align="center">
        <Text>Save</Text>
        <KeyCap keyCode="S" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="S" modifiers={['cmd']} size="sm">S</KeyCap>
      </Row>
      <Row gap="xs" align="center">
        <Text>Undo</Text>
        <KeyCap keyCode="Z" modifiers={['cmd']} size="sm">⌘</KeyCap>
        <Text>+</Text>
        <KeyCap keyCode="Z" modifiers={['cmd']} size="sm">Z</KeyCap>
      </Row>
    </Block>
  );
}
```
