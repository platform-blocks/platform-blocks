# Indicator

The Indicator component renders a small dot or pill-shaped badge in the corner of a parent container — perfect for online status, unread counts, or "new" markers. Pass `label` for text content (the dot auto-expands to fit multi-digit counts); use `children` for arbitrary custom content like icons.

## Metadata

- Canonical name: `Indicator`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Indicator } from '@platform-blocks/react-ui-library';`
- Category: data
- Tags: indicator, badge, status, count, dot
- Docs: https://react-ui-library.com/components/Indicator
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Indicator

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `size` | SizeValue \| number | No |  |  |
| `color` | string | No |  |  |
| `borderColor` | string | No |  |  |
| `borderWidth` | number | No |  |  |
| `placement` | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | No |  |  |
| `offset` | number | No |  |  |
| `style` | StyleProp<ViewStyle> | No |  |  |
| `children` | React.ReactNode | No |  | Free-form content rendered inside the indicator dot. Useful when a custom icon is needed; for plain text counts prefer `label`, which auto-resizes the dot and applies a contrast-aware text color. |
| `label` | React.ReactNode | No |  | Convenience text content (typically a count). When set, the dot expands to fit the label and the text uses a contrast-aware color. |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the label `<Text>` (style, weight, ff, size, color). |
| `invisible` | boolean | No |  |  |

## Examples

### Basic usage
ID: `Indicator.basic` • Tags: status, notification • Category: basics • Status: stable • Since: 0.4.0

Use `Indicator` to layer small notices on any container: position it at a corner, pair it with avatars for presence, or wrap children to show counters without building custom badges.

```tsx
return (
    <Block>
      <Block>
        <Text size="sm" weight="medium">
          Corner indicator
        </Text>
        <Block bg="#f5f5f7" radius="lg" p="lg" position="relative">
          <Text size="xs" color="secondary">
            Panel
          </Text>
          <Indicator placement="top-right" />
        </Block>
      </Block>
      <Block>
        <Text size="sm" weight="medium">
          Avatar status
        </Text>
        <Block position="relative" w={72} h={72} align="center" justify="center">
          <Avatar size="lg" fallback="JS" backgroundColor="#6366F1" />
          <Indicator placement="bottom-right" size="md" color="#22c55e" offset={2} />
        </Block>
      </Block>
      <Block>
        <Text size="sm" weight="medium">
          Numeric counter
        </Text>
        <Block
          w={72}
          h={72}
          bg="#e5e7eb"
          radius="lg"
          position="relative"
          align="center"
          justify="center"
        >
          <Text size="xs" color="secondary">
            Inbox
          </Text>
          <Indicator placement="top-right" size={20} offset={4}>
            <Text size="xs" weight="bold" color="white">
              5
            </Text>
          </Indicator>
        </Block>
      </Block>
    </Block>
  );
}
```

### Placements
ID: `Indicator.placements` • Tags: placement, offset • Category: basics • Status: stable • Since: 0.4.0

Control positioning by combining the `placement` prop (top/bottom + left/right) with `offset` to nudge the badge; add children inside `Indicator` when you need numeric or icon content.

```tsx
const cornerPlacements = [
  { label: 'Top left', placement: 'top-left', color: '#F59E0B' },
  { label: 'Top right', placement: 'top-right', color: '#10B981' },
  { label: 'Bottom left', placement: 'bottom-left', color: '#6366F1' },
  { label: 'Bottom right', placement: 'bottom-right', color: '#EF4444' },
] as const;
const offsetPlacements = [
  { label: '9 unread', placement: 'top-right', color: '#6366F1', value: '9', offset: 6 },
  { label: '2 new', placement: 'bottom-right', color: '#10B981', value: '2', offset: 4 },
] as const;
const Tile = ({ children }: { children: ReactNode }) => (
  <Block
    w={88}
    h={88}
    radius="lg"
    bg="#f5f5f7"
    position="relative"
    align="center"
    justify="center"
  >
    {children}
  </Block>
);
  return (
    <Block>
      <Block>
        <Text size="sm" weight="medium">
          Corner placements
        </Text>
        <Row gap="md" wrap="wrap">
          {cornerPlacements.map((placement) => (
            <Tile key={placement.placement}>
              <Text size="xs" color="secondary">
                {placement.label}
              </Text>
              <Indicator placement={placement.placement} color={placement.color} />
            </Tile>
          ))}
        </Row>
      </Block>
      <Block>
        <Text size="sm" weight="medium">
          Offset and content
        </Text>
        <Row gap="md" wrap="wrap">
          {offsetPlacements.map((placement) => (
            <Tile key={placement.label}>
              <Text size="xs" color="secondary">
                {placement.label}
              </Text>
              <Indicator
                placement={placement.placement}
                color={placement.color}
                size={22}
                offset={placement.offset}
              >
                <Text size="xs" weight="bold" color="white">
                  {placement.value}
                </Text>
              </Indicator>
            </Tile>
          ))}
        </Row>
      </Block>
    </Block>
  );
}
```

### Sizes
ID: `Indicator.sizes` • Tags: sizes, tokens • Category: basics • Status: stable • Since: 0.4.0

Set the `size` prop to any token (`xs`–`3xl`) for theme-aligned dots, or provide a raw number when you need a bespoke diameter for your badge.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 24] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Card w={56} h={56} radius="lg">
            <Indicator placement="top-right" size={size} offset={4} />
          </Card>
          <Text variant="small">{typeof size === 'number' ? `${size} (numeric)` : size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Statuses
ID: `Indicator.statuses` • Tags: presence, status • Category: basics • Status: stable • Since: 0.4.0

Map semantic states (online, idle, busy) to palette colors and cap large notification counts by rendering text inside `Indicator`—perfect for presence chips or inbox badges.

```tsx
const presenceStatuses = [
  { label: 'Online', palette: 'success', avatar: require('../../../../assets/avatars/avatar-1.png') },
  { label: 'Idle', palette: 'warning', avatar: require('../../../../assets/avatars/avatar-2.png') },
  { label: 'Busy', palette: 'error', avatar: require('../../../../assets/avatars/avatar-3.png') },
  { label: 'Offline', palette: 'gray', avatar: require('../../../../assets/avatars/avatar-4.png') },
] as const;
const notificationCounts = [3, 47, 99, 134, 1005];
  const theme = useTheme();
  const resolveColor = (palette: (typeof presenceStatuses)[number]['palette']) => {
    const swatch = (theme.colors as any)[palette];
    return Array.isArray(swatch) ? swatch[5] : swatch;
  };
  return (
    <Block>
      <Block>
        <Text size="sm" weight="medium">
          Presence indicators
        </Text>
        <Row gap="lg" wrap="wrap">
          {presenceStatuses.map((status) => (
            <Block key={status.label} align="center">
              <Block position="relative">
                <Avatar
                  size={56}
                  fallback={status.label.charAt(0)}
                  src={status.avatar}
                />
                <Indicator placement="bottom-right" size={14} color={resolveColor(status.palette)} />
              </Block>
              <Text size="xs" color="secondary">
                {status.label}
              </Text>
            </Block>
          ))}
        </Row>
      </Block>
      <Block>
        <Text size="sm" weight="medium">
          Max count handling
        </Text>
        <Row gap="md" wrap="wrap">
          {notificationCounts.map((count) => {
            const display = count > 99 ? '99+' : `${count}`;
            return (
              <Block key={count} w={72} h={72} position="relative" align="center" justify="center">
                <Indicator placement="top-right" size={24} offset={4} color={theme.colors.error[5]}>
                  <Text size="xs" weight="bold" color="white">
                    {display}
                  </Text>
                </Indicator>
                <Text size="xs" color="secondary">
                  {count}
                </Text>
              </Block>
            );
          })}
        </Row>
      </Block>
    </Block>
  );
}
```

### Labels & counts
ID: `Indicator.labels` • Tags: label, count, labelProps, customization • Category: general • Status: stable • Since: 1.0.0

Pass `label` to render a count or short text inside the indicator — the dot expands to a pill so multi-digit values fit. `labelProps` accepts any `<Text>` props for fonts, weights, etc. For arbitrary custom content (icons, status markers), use `children` instead.

```tsx
const Anchor = ({ children }: { children?: React.ReactNode }) => (
  <View
    style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#e5e7eb',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}
  >
    {children}
  </View>
);
  return (
    <Block>
      <Block>
        <Text size="sm" color="muted">Numeric counts</Text>
        <Row gap="lg">
          <Anchor>
            <Indicator size={20} color="#ef4444" label={3} />
          </Anchor>
          <Anchor>
            <Indicator size={20} color="#ef4444" label={12} />
          </Anchor>
          <Anchor>
            <Indicator size={20} color="#ef4444" label="99+" />
          </Anchor>
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Monospace badge with custom label styling
        </Text>
        <Row gap="lg">
          <Avatar fallback="JS" backgroundColor="#a855f7" />
          <Anchor>
            <Indicator
              size={22}
              color="#0ea5e9"
              label="42"
              labelProps={{ ff: 'monospace', weight: '700' }}
            />
          </Anchor>
          <Anchor>
            <Indicator
              size={22}
              color="#10b981"
              label="NEW"
              labelProps={{ uppercase: true, tracking: 1, size: 9 }}
            />
          </Anchor>
        </Row>
      </Block>
      <Block>
        <Text size="sm" color="muted">Custom child content (children, not label)</Text>
        <Row gap="lg">
          <Anchor>
            <Indicator size={16} color="#10b981">
              {/* anything you want — icon, custom shape, etc. */}
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' }} />
            </Indicator>
          </Anchor>
        </Row>
      </Block>
    </Block>
  );
}
```
