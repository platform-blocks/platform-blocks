# Avatar

The Avatar component displays user profile images, initials, or icons. Supports different sizes, colors, and can be grouped together in an AvatarGroup. Each text slot — initials, label, description — accepts the full Text-prop API via `fallbackProps` / `labelProps` / `descriptionProps`.

## Metadata

- Canonical name: `Avatar`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Avatar } from '@platform-blocks/react-ui-library';`
- Category: display
- Tags: avatar, profile, user, image, initials
- Docs: https://react-ui-library.com/components/Avatar
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Avatar

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | ComponentSizeValue | No |  | Size of the avatar |
| `src` | string \| ImageSourcePropType | No |  | Image for the avatar: a remote URL string or a bundled asset (`require('./avatar.png')`) |
| `fallback` | React.ReactNode | No |  | Fallback shown when no image is provided: initials string or a custom React node (e.g. an icon). |
| `backgroundColor` | string | No |  | Background color for the fallback initials |
| `textColor` | string | No |  | Text color for the fallback initials |
| `online` | boolean | No |  | Whether to show online status indicator |
| `indicatorColor` | string | No |  | Color override for the status indicator |
| `style` | StyleProp<ViewStyle> | No |  | Style override for the avatar container |
| `accessibilityLabel` | string | No |  | Accessibility label for the avatar image |
| `label` | React.ReactNode | No |  | Primary label displayed to the right of the avatar (string or custom React node) |
| `description` | React.ReactNode | No |  | Secondary description/subtext under the label |
| `gap` | number | No |  | Spacing between avatar and text block |
| `showText` | boolean | No |  | Force horizontal layout off (set false to hide label/description wrapper) |
| `fallbackProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the fallback initials `<Text>` (style, weight, ff, size, color). |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the adjacent label `<Text>` (only when `label` is a string). |
| `descriptionProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the secondary description `<Text>` (only when `description` is a string). |

## Examples

### Basics
ID: `Avatar.basic` • Tags: avatars • Category: basics • Status: stable • Since: 1.0.0

Illustrates loading an avatar image with a reliable initials fallback for offline scenarios.

```tsx
return (
    <Avatar
      src={require('../../../../assets/avatars/avatar-1.png')}
      fallback="JD"
      size="xl"
    />
  )
}
```

### Sizes
ID: `Avatar.sizes` • Tags: avatars, sizes • Category: styling • Status: stable • Since: 1.0.0

Display every avatar size token with guidance on when to use each scale.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
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
ID: `Avatar.icon` • Tags: avatars, icon • Category: content • Status: stable • Since: 1.0.0

Render any `<Icon>` inside an avatar by passing it to the `fallback` prop. The icon scales with the avatar size and works alongside labels, descriptions, and status indicators.

```tsx
return (
    <Block>
      <Block>
        <Text size="sm" color="muted">
          Render an icon inside the avatar via the `fallback` prop
        </Text>
        <Row gap="md" align="center">
          <Avatar
            fallback={<Icon name="user" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            fallback={<Icon name="camera" color="white" />}
            backgroundColor="#10b981"
          />
          <Avatar
            fallback={<Icon name="bell" color="white" />}
            backgroundColor="#f59e0b"
          />
          <Avatar
            fallback={<Icon name="settings" color="white" />}
            backgroundColor="#ef4444"
          />
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Scales with the avatar size
        </Text>
        <Row gap="md" align="center">
          <Avatar
            size="sm"
            fallback={<Icon name="user" size="sm" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            size="md"
            fallback={<Icon name="user" size="md" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            size="lg"
            fallback={<Icon name="user" size="lg" color="white" />}
            backgroundColor="#6366f1"
          />
          <Avatar
            size="xl"
            fallback={<Icon name="user" size="xl" color="white" />}
            backgroundColor="#6366f1"
          />
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Icon avatar with label and online status
        </Text>
        <Avatar
          fallback={<Icon name="user" color="white" />}
          backgroundColor="#6366f1"
          label="Jane Doe"
          description="Product Designer"
          online
        />
      </Block>
    </Block>
  );
}
```

### Colors
ID: `Avatar.colors` • Tags: avatars, colors • Category: styling • Status: stable • Since: 1.0.0

Preview semantic color tokens and custom hex backgrounds applied to avatar fallbacks.

```tsx
return (
    <Block align="flex-start">
     <Avatar
        fallback="AB"
        backgroundColor="#FF6B6B"
        label="Custom Red Background"
      />
    </Block>
  )
}
```

### Groups
ID: `Avatar.group` • Tags: avatars, groups • Category: features • Status: stable • Since: 1.0.0

Showcases how `AvatarGroup` overlaps avatars by default to conserve space.

```tsx
const TEAM = [
  { id: 1, initials: 'SJ', color: '#FF6B6B' },
  { id: 2, initials: 'MC', color: '#4ECDC4' },
  { id: 3, initials: 'ER', color: '#45B7D1' },
  { id: 4, initials: 'DL', color: '#96CEB4' },
  { id: 5, initials: 'KP', color: '#FFEAA7' },
  { id: 6, initials: 'TW', color: '#DDA0DD' },
  { id: 7, initials: 'AB', color: '#FFB6C1' }
];
  return (
    <Block>
      <Text weight="medium">Simple group</Text>
      <AvatarGroup>
        {TEAM.map(({ id, initials, color }) => (
          <Avatar key={id} fallback={initials} backgroundColor={color} size="md" />
        ))}
      </AvatarGroup>
      <Text variant="small" color="muted">
        Groups overlap avatars automatically to conserve space.
      </Text>
    </Block>
  );
}
```

### Overflow
ID: `Avatar.overflow` • Tags: avatars, groups, overflow, limit, tooltip • Category: features • Status: stable • Since: 1.0.0

Set `limit` to cap visible avatars and show the remaining count. Pass `surplusTooltip` to reveal who's hidden on hover.

```tsx
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
  const hidden = TEAM.slice(LIMIT).map((member) => member.name);
  return (
    <AvatarGroup limit={LIMIT} size="md" surplusTooltip={hidden.join(', ')}>
      {TEAM.map(({ id, initials, color }) => (
        <Avatar key={id} fallback={initials} backgroundColor={color} />
      ))}
    </AvatarGroup>
  );
}
```

### Status indicator
ID: `Avatar.status` • Tags: avatars, status • Category: behavior • Status: stable • Since: 1.0.0

Demonstrates the `online` presence indicator, including custom `indicatorColor` overrides for alternate states.

```tsx
type StatusAvatar = Pick<AvatarProps, 'size' | 'src' | 'online' | 'indicatorColor'> & {
  key: string;
  label: string;
  description: string;
};
const STATUS_AVATARS: StatusAvatar[] = [
  {
    key: 'online',
    label: 'Josh',
    description: 'Online',
    src: require('../../../../assets/avatars/avatar-1.png')
  },
  {
    key: 'available',
    label: 'Alice',
    description: 'Available',
    src: require('../../../../assets/avatars/avatar-2.png')
  },
  {
    key: 'focus',
    label: 'Mike',
    description: 'Focus time',
    src: require('../../../../assets/avatars/avatar-3.png'),
    indicatorColor: '#f59e0b'
  },
  {
    key: 'offline',
    label: 'Tori',
    description: 'Last active 5m ago',
    src: require('../../../../assets/avatars/avatar-4.png'),
    online: false
  }
];
  return (
    <Block direction="row" justify="space-evenly" fullWidth>
      {STATUS_AVATARS.map(({ key, indicatorColor, online = true, ...avatar }) => (
        <Avatar
          key={key}
          {...avatar}
          fallback={avatar.label.slice(0, 2).toUpperCase()}
          online={online}
          indicatorColor={indicatorColor}
        />
      ))}
    </Block>
  );
}
```
