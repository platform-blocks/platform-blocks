# Avatar

Displays user profile images, initials, or icons.

## Metadata

- Import: `import { Avatar } from '@plocks/ui';`
- Tags: avatar, profile, user, image, initials
- Docs: https://plocks.dev/components/Avatar
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Avatar

## Props

- `size`: ComponentSizeValue = 'md' — Size of the avatar: a token or the diameter in px
- `src`: string | ImageSourcePropType — Image for the avatar: a remote URL string or a bundled asset (`require('./avatar.png')`)
- `fallback`: React.ReactNode — Fallback shown when no image is provided: initials string or a custom React node (e.g. an icon).
- `bg`: ColorProp = theme.text.muted — Fill of the avatar circle — not the root, which also holds the label. Resolves like every `bg`: a palette name is its subtle tint, `'primary.5'` a shade.
- `textColor`: ColorProp = a readable color on the background — Text color for the fallback initials. @default a readable color on the background
- `online`: boolean — Whether to show online status indicator
- `indicatorColor`: ColorProp — Color override for the status indicator
- `accessibilityLabel`: string — Accessible name of the avatar ("Jane Doe"). The avatar is an image with this name; without it, it is decorative.
- `label`: React.ReactNode — Primary label displayed beside the avatar (string or custom React node)
- `description`: React.ReactNode — Secondary description/subtext under the label
- `gap`: number = 8 — Spacing between avatar and text block (px)
- `showText`: boolean = true — Force horizontal layout off (set false to hide label/description wrapper)
- `fallbackProps`: Omit<TextProps, 'children'> — Override props applied to the fallback initials `<Text>` (style, fw, ff, size, c).
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to the adjacent label `<Text>` (only when `label` is a string).
- `descriptionProps`: Omit<TextProps, 'children'> — Override props applied to the secondary description `<Text>` (only when `description` is a string).
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { AvatarGroup } from '@plocks/ui';`

### AvatarGroup

- `children` (required): React.ReactNode
- `limit`: number — Show at most this many avatars, then a `+N` surplus avatar.
- `spacing`: number = -8 — Overlap between avatars (negative px). @default -8
- `size`: ComponentSizeValue
- `bordered`: boolean — Whether to add borders around avatars for separation
- `surplusTooltip`: string — When `limit` hides avatars, wrap the `+N` surplus indicator in a Tooltip with this label.
- `surplusLabel`: string = `${N} more` — Accessible name of the surplus avatar. @default `${N} more`
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

Illustrates loading an avatar image with a reliable initials fallback for offline scenarios.

```tsx
import { Avatar } from '@plocks/ui';

export function Demo() {
  return (
    <Avatar
      src={require('../../../../assets/avatars/avatar-1.png')}
      fallback="JD"
      size="xl"
    />
  );
}
```

### Sizes

Choose a `size` token (`xs` through `3xl`) to scale the avatar.

```tsx
import { Avatar, Row } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Avatar key={size} size={size} fallback={size} />
      ))}
    </Row>
  );
}
```

### Icon

Render any `<Icon>` inside an avatar by passing it to the `fallback` prop.

```tsx
import { Avatar, Icon, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" align="center">
      <Avatar
        fallback={<Icon name="user" color="white" />}
        bg="#6366f1"
      />
      <Avatar
        fallback={<Icon name="camera" color="white" />}
        bg="#10b981"
      />
      <Avatar
        fallback={<Icon name="bell" color="white" />}
        bg="#f59e0b"
      />
      <Avatar
        fallback={<Icon name="settings" color="white" />}
        bg="#ef4444"
      />
    </Row>
  );
}
```

### Colors

Preview semantic color tokens and custom hex backgrounds applied to avatar fallbacks.

```tsx
import { Avatar, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Avatar fallback="PR" bg="primary.5" />
      <Avatar fallback="SU" bg="success.5" />
      <Avatar fallback="WA" bg="warning.5" />
      <Avatar fallback="ER" bg="error.5" />
      <Avatar fallback="AB" bg="#FF6B6B" />
    </Row>
  );
}
```

### Groups

Showcases how `AvatarGroup` overlaps avatars by default to conserve space.

```tsx
import { Avatar, AvatarGroup } from '@plocks/ui';

const TEAM = [
  { id: 1, initials: 'SJ', color: '#FF6B6B' },
  { id: 2, initials: 'MC', color: '#4ECDC4' },
  { id: 3, initials: 'ER', color: '#45B7D1' },
  { id: 4, initials: 'DL', color: '#96CEB4' },
  { id: 5, initials: 'KP', color: '#FFEAA7' },
  { id: 6, initials: 'TW', color: '#DDA0DD' },
  { id: 7, initials: 'AB', color: '#FFB6C1' }
];

export function Demo() {
  return (
    <AvatarGroup>
      {TEAM.map(({ id, initials, color }) => (
        <Avatar key={id} fallback={initials} bg={color} />
      ))}
    </AvatarGroup>
  );
}
```

### Overflow

Set `limit` to cap visible avatars and show the remaining count. Pass `surplusTooltip` to reveal who's hidden on hover.

```tsx
import { Avatar, AvatarGroup } from '@plocks/ui';

const TEAM = [
  { id: 1, name: 'Sarah Johnson', initials: 'SJ', color: '#FF6B6B' },
  { id: 2, name: 'Marcus Chen', initials: 'MC', color: '#4ECDC4' },
  { id: 3, name: 'Elena Ruiz', initials: 'ER', color: '#45B7D1' },
  { id: 4, name: 'David Lee', initials: 'DL', color: '#96CEB4' },
  { id: 5, name: 'Kira Patel', initials: 'KP', color: '#FFEAA7' },
  { id: 6, name: 'Tom Ward', initials: 'TW', color: '#DDA0DD' },
  { id: 7, name: 'Aisha Bello', initials: 'AB', color: '#FFB6C1' }
];

const LIMIT = 3;

export function Demo() {
  const hidden = TEAM.slice(LIMIT).map((member) => member.name);

  return (
    <AvatarGroup limit={LIMIT} surplusTooltip={hidden.join(', ')}>
      {TEAM.map(({ id, initials, color }) => (
        <Avatar key={id} fallback={initials} bg={color} />
      ))}
    </AvatarGroup>
  );
}
```

### Status indicator

Demonstrates the `online` presence indicator, including custom `indicatorColor` overrides for alternate states.

```tsx
import { Avatar, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="xl" wrap="wrap">
      <Avatar
        src={require('../../../../assets/avatars/avatar-1.png')}
        label="Josh"
        description="Online"
        online
      />
      <Avatar
        src={require('../../../../assets/avatars/avatar-3.png')}
        label="Mike"
        description="Focus time"
        online
        indicatorColor="#f59e0b"
      />
      <Avatar
        src={require('../../../../assets/avatars/avatar-4.png')}
        label="Tori"
        description="Offline"
      />
    </Row>
  );
}
```
