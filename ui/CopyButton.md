# CopyButton

Small utility component for copying text values to the clipboard with optional toast feedback. Used inside components like `CodeBlock` and `QRCode` to standardize UX.

## Metadata

- Import: `import { CopyButton } from '@plocks/ui';`
- Status: beta
- Docs: https://plocks.dev/components/CopyButton
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/CopyButton

## Props

- `value` (required): string — The text to copy to clipboard
- `onCopy`: (value: string) => void — Called with the value once it has been copied (not when copying failed)
- `onCopyError`: (error: Error) => void — Called when copying failed (no clipboard access, permission denied, …)
- `iconOnly`: boolean = true — Icon-only control (the default). `false` renders a button with the icon and the `label` text.
- `label`: string = 'Copy' — Accessible name (and visible text when `iconOnly={false}`). @default 'Copy'
- `copiedLabel`: string = 'Copied' — Label / announcement once the value is copied. @default 'Copied'
- `toastTitle`: string = 'Copied to clipboard' — Title for the toast (web)
- `toastMessage`: string — Detailed message for the toast (web)
- `size`: ComponentSizeValue = 'md' — Visual size token, or the control height in px
- `disableToast`: boolean = false — Disable the "copied to clipboard" toast (the copy is then announced to screen readers instead)
- `tooltip`: TooltipPropValue — Tooltip text, or a full Tooltip config (`{ label, maw, … }`). Icon-only controls default to the label.
- `tooltipPosition`: 'top' | 'bottom' | 'left' | 'right' = 'top' — Where the tooltip opens — including the automatic "Copy" / "Copied" one. An explicit `position` in the object form of `tooltip` wins.
- `mode`: 'button' | 'icon' = 'button' — Presentation: a button (default) or a bare icon with no chrome
- `buttonVariant`: 'none' | 'default' | 'secondary' | 'ghost' | 'filled' | 'outline' | 'gradient' = 'secondary' — Button variant in button mode
- `iconName`: string = 'copy' — Icon name to display (defaults to copy)
- `copiedIconName`: string = 'check' — Icon name to display after copy (default check)
- `iconColor`: ColorProp — Base icon color
- `copiedIconColor`: ColorProp — Copied state icon color (default: the success palette)
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

Icon-only copy button with default toast feedback.

```tsx
import { CopyButton } from '@plocks/ui';

export function Demo() {
  return <CopyButton value="ABCD-1234" />;
}
```

### Labeled

Copy control showing label text instead of icon-only presentation.

```tsx
import { CopyButton } from '@plocks/ui';

export function Demo() {
  return <CopyButton value="sk_live_1a2b3c4d5e6f7g8h9i10" iconOnly={false} label="Copy Key" />;
}
```

### Long Value

Values of any length are copied in full; the confirmation toast shows only its title and doesn't echo the copied text.

```tsx
import { CopyButton } from '@plocks/ui';

const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.long.payload.value.with.many.sections.and.characters.for.demo.purposes.only';

export function Demo() {
  return <CopyButton value={longToken} iconOnly={false} label="Copy Token" />;
}
```

### No Toast

Copy control with toast notifications disabled.

```tsx
import { CopyButton } from '@plocks/ui';

export function Demo() {
  return <CopyButton value="hunter2" iconOnly={false} disableToast />;
}
```

### Sizes

Scale the copy affordance with the `size` prop, from `xs` through `3xl`.

```tsx
import { Block, CopyButton, Row, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <CopyButton size={size} value="@plocks/ui" />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```
