# ListGroup

The ListGroup component provides an organized list structure with items, dividers, and sections for displaying grouped content.

## Metadata

- Import: `import { ListGroup } from '@plocks/ui';`
- Tags: list, group, items, divider, sections
- Docs: https://plocks.dev/components/ListGroup
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/ListGroup

## Props

- `children` (required): React.ReactNode
- `variant`: 'default' | 'bordered' | 'flush' = 'default'
- `size`: ComponentSizeValue = 'md'
- `radius`: RadiusValue = 'md' — Corner radius: theme radius token, px, `'none'` or `'full'`.
- `dividers`: boolean = true
- `insetDividers`: boolean = false
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Sub-components

`import { ListGroupItem, ListGroupDivider, ListGroupBody } from '@plocks/ui';`

### ListGroupItem

- `children`: React.ReactNode — Single-line row content. Rendered inside the item's own `<Text>`, so it takes strings and inline text — not a layout block. For a two-line row use `label` + `description` instead.
- `label`: React.ReactNode — Primary line of a two-line row. Takes precedence over `children`, which is ignored when this is set.
- `description`: React.ReactNode — Muted secondary line beneath `label`.
- `value`: React.ReactNode — Muted trailing text, rendered before `endSection`.
- `onPress`: () => void
- `disabled`: boolean
- `active`: boolean
- `danger`: boolean
- `startSection`: React.ReactNode
- `endSection`: React.ReactNode
- `textStyle`: StyleProp<TextStyle> — Applied to the single-line `children` text and to `label`.
- `descriptionStyle`: StyleProp<TextStyle> — Applied to the `description` text.
- `numberOfLines`: number — Truncate `label`/`description` to this many lines instead of wrapping.
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

### ListGroupDivider

- `inset`: boolean — Indent the divider from the leading edge. Defaults to the group's `insetDividers`.
- `style`: StyleProp<ViewStyle>

`ListGroupBody` has no props interface of its own.

## Examples

### Basics

Compose a vertical list by nesting `ListGroupItem` elements inside a `ListGroup`. Use the `variant` prop to switch between `default`, `bordered`, and `flush` styles.

```tsx
import { ListGroup, ListGroupItem } from '@plocks/ui';

export function Demo() {
  return (
    <ListGroup variant="bordered" style={{ width: '100%', maxWidth: 360 }}>
      <ListGroupItem>Overview</ListGroupItem>
      <ListGroupItem>Analytics</ListGroupItem>
      <ListGroupItem>Reports</ListGroupItem>
      <ListGroupItem>Settings</ListGroupItem>
    </ListGroup>
  );
}
```

### Two-line rows

Pass `label` and `description` for a stacked row. These take precedence over `children`, which renders as a single line of text and so cannot hold a layout block. `description` is optional — a `label` on its own reads the same as `children`, and mixing both row shapes in one group stays aligned.

```tsx
import { ListGroup, ListGroupItem } from '@plocks/ui';

export function Demo() {
  return (
    <ListGroup variant="bordered" style={{ width: '100%', maxWidth: 360 }}>
      <ListGroupItem
        label="Download your data"
        description="A ZIP bundle of your profile, library, and history"
      />
      <ListGroupItem label="Privacy" description="Control who sees your activity" />
      <ListGroupItem label="About" />
    </ListGroup>
  );
}
```

### Variants

Compare the default, bordered, and flush group surfaces with identical rows.

```tsx
import { Column, ListGroup, ListGroupItem, Text } from '@plocks/ui';

const variants = ['default', 'bordered', 'flush'] as const;

export function Demo() {
  return (
    <Column gap="lg" fullWidth>
      {variants.map(variant => (
        <Column key={variant} gap="xs" fullWidth>
          <Text fw="semibold">{variant}</Text>
          <ListGroup variant={variant}>
            <ListGroupItem>Overview</ListGroupItem>
            <ListGroupItem>Settings</ListGroupItem>
          </ListGroup>
        </Column>
      ))}
    </Column>
  );
}
```

### Trailing value

`value` renders muted text at the end of the row, before `endSection`. A two-line row already claims the free space, so its value sits flush right on its own; a single-line row only takes its natural width, so the value is what gets pushed to the edge and `endSection` follows it.

```tsx
import { Badge, ListGroup, ListGroupItem } from '@plocks/ui';

export function Demo() {
  return (
    <ListGroup variant="bordered" style={{ width: '100%', maxWidth: 360 }}>
      <ListGroupItem label="Username" value="@ada" />
      <ListGroupItem label="Language" description="App language" value="English" />
      <ListGroupItem value="2 unread" endSection={<Badge>New</Badge>}>
        Inbox
      </ListGroupItem>
    </ListGroup>
  );
}
```
