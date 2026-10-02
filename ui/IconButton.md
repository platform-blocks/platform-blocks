# IconButton

IconButton triggers an action with an icon instead of a text label.

## Metadata

- Import: `import { IconButton } from '@plocks/ui';`
- Tags: button, icon, clickable, action
- Docs: https://plocks.dev/components/IconButton
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/IconButton

## Props

- `icon` (required): string | ExternalIconComponent | React.ReactElement — Icon to render. Accepts a registry name, or an external icon library component/element (e.g. a Tabler icon) for use without registration.
- `variant`: 'default' | 'filled' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'none' = 'default' — Button visual variant. `default` is the neutral button, matching `Button`; a solid primary fill is opt-in via `filled`.
- `color`: ColorProp — Tint for the button: a palette token (`'primary'`), `'primary.6'` shade syntax, or any CSS color. `filled`, `secondary` and `outline` tint the container; `ghost` and the neutral `default`/`none` keep their chrome and tint only the icon.
- `iconColor`: ColorProp — Explicit icon color override (else derived automatically from variant & color)
- `iconVariant`: IconProps['variant'] — Icon variant override
- `iconSize`: IconProps['size'] — Icon size override (defaults to half the button height)
- `accessibilityLabel`: string — Accessible name. Icon-only buttons need one: pass this, or a `tooltip` (whose text is then used as the name). A dev warning fires when neither is set.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Plus the `Button` props (`onPress` `onPressIn` `onPressOut` `onHoverIn` `onHoverOut` `onLongPress` `onLayout` `size` `disabled` `loading` `fullWidth` `tooltip` `transitionDuration` `accessibilityHint`): https://plocks.dev/llms/components/Button.md

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), `radius`, `shadow`, visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Examples

### Basics

IconButton triggers an action with an icon instead of a text label.

```tsx
import { IconButton, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" align="center" wrap="wrap">
      <IconButton icon="home" tooltip="Home" />
      <IconButton icon="bell" variant="filled" tooltip="Notifications" />
      <IconButton icon="heart" variant="secondary" tooltip="Favorite" />
      <IconButton icon="settings" variant="outline" tooltip="Settings" />
      <IconButton icon="search" variant="ghost" tooltip="Search" />
      <IconButton icon="star" variant="gradient" tooltip="Star" />
    </Row>
  );
}
```

### Variants

Compare every IconButton visual variant with the same icon and size.

```tsx
import { IconButton, Row } from '@plocks/ui';

const variants = ['default', 'filled', 'secondary', 'outline', 'ghost', 'gradient', 'none'] as const;

export function Demo() {
  return (
    <Row gap="sm" align="center" wrap="wrap">
      {variants.map(variant => (
        <IconButton key={variant} icon="heart" variant={variant} accessibilityLabel={`${variant} icon button`} tooltip={variant} />
      ))}
    </Row>
  );
}
```
