# ListGroup

The ListGroup component provides an organized list structure with items, dividers, and sections for displaying grouped content.

## Metadata

- Canonical name: `ListGroup`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { ListGroup } from '@platform-blocks/react-ui-library';`
- Category: display
- Tags: list, group, items, divider, sections
- Docs: https://react-ui-library.com/components/ListGroup
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/ListGroup

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | Yes |  |  |
| `variant` | 'default' \| 'bordered' \| 'flush' | No | 'default' |  |
| `size` | ComponentSizeValue | No | 'md' |  |
| `radius` | 'sm' \| 'md' \| 'lg' \| number | No | 'md' |  |
| `dividers` | boolean | No | true |  |
| `insetDividers` | boolean | No | false |  |
| `style` | StyleProp<ViewStyle> | No |  |  |

## Examples

### Basic Usage
ID: `ListGroup.basic` • Tags: list, items • Category: basics • Status: stable • Since: 1.0.0

Compose a vertical list by nesting `ListGroupItem` elements inside a `ListGroup`. Use the `variant` prop to switch between `default`, `bordered`, and `flush` styles.

```tsx
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
ID: `ListGroup.two-line` • Tags: list, label, description, settings • Category: basics • Status: stable • Since: 1.0.0

Pass `label` and `description` for a stacked row. These take precedence over `children`, which renders as a single line of text and so cannot hold a layout block. `description` is optional — a `label` on its own reads the same as `children`, and mixing both row shapes in one group stays aligned.

```tsx
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

### Trailing value
ID: `ListGroup.trailing-value` • Tags: list, value, alignment, sections • Category: composition • Status: stable • Since: 1.0.0

`value` renders muted text at the end of the row, before `endSection`. A two-line row already claims the free space, so its value sits flush right on its own; a single-line row only takes its natural width, so the value is what gets pushed to the edge and `endSection` follows it.

```tsx
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
