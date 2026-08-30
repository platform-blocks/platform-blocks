# Link

A versatile component for creating styled hyperlinks and navigation elements with hover states and accessibility features.

## Metadata

- Canonical name: `Link`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Link } from '@platform-blocks/react-ui-library';`
- Category: navigation
- Tags: link, anchor, navigation, url, href
- Docs: https://react-ui-library.com/components/Link
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Link

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | Yes |  | Link text content |
| `href` | string | No |  | URL or handler for the link |
| `onPress` | () => void | No |  | Custom onPress handler (overrides href) |
| `size` | SizeValue | No | 'lg' | Size of the link text (default: 'lg' = 16px to match Text component) |
| `color` | 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'gray' \| 'inherit' \| string | No |  | Color variant or custom color string |
| `variant` | 'default' \| 'subtle' \| 'hover-underline' | No | 'default' | Link variant |
| `disabled` | boolean | No | false | Whether the link is disabled |
| `external` | boolean | No | false | Whether to show external link indicator |
| `style` | ViewStyle | No |  | Custom style for container |
| `textStyle` | TextStyle | No |  | Custom style for text |
| `accessibilityLabel` | string | No |  | Accessibility label |
| `target` | '_blank' \| '_self' | No | '_self' | Whether this link opens in a new tab/window (web only) |
| `fontFamily` | string | No |  | Custom font family (overrides theme font) |
| `ff` | string | No |  | Shorthand alias for `fontFamily` |
| `m` | number | No |  | Margin applied to all sides |
| `mt` | number | No |  | Margin applied to the top side |
| `mr` | number | No |  | Margin applied to the right side |
| `mb` | number | No |  | Margin applied to the bottom side |
| `ml` | number | No |  | Margin applied to the left side |
| `mx` | number | No |  | Horizontal margin applied to left and right sides |
| `my` | number | No |  | Vertical margin applied to top and bottom sides |
| `p` | number | No |  | Padding applied to all sides |
| `pt` | number | No |  | Padding applied to the top side |
| `pr` | number | No |  | Padding applied to the right side |
| `pb` | number | No |  | Padding applied to the bottom side |
| `pl` | number | No |  | Padding applied to the left side |
| `px` | number | No |  | Horizontal padding applied to left and right sides |
| `py` | number | No |  | Vertical padding applied to top and bottom sides |

## Examples

### Inline Links
ID: `Link.basic` • Tags: link • Category: usage • Status: stable • Since: 1.0.0

Embed links directly inside supporting copy to guide readers toward related resources.

```tsx
const resources = [
  { href: '#brand', label: 'brand guidelines' },
  { href: '#voice', label: 'voice and tone guide' },
  { href: '#releases', label: 'release checklist' },
];
const [brandGuide, voiceGuide, releaseChecklist] = resources;
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Use `Link` inline with body copy to direct readers to additional guidance without breaking the flow of text.
        </Text>
        <Text size="sm">
          Before publishing, review the{' '}
          <Link href={brandGuide.href}>{brandGuide.label}</Link>, consult our{' '}
          <Link href={voiceGuide.href}>{voiceGuide.label}</Link>, and confirm each launch in the{' '}
          <Link href={releaseChecklist.href}>{releaseChecklist.label}</Link>.
        </Text>
      </Block>
    </Card>
  );
}
```

### External Destinations
ID: `Link.external` • Tags: link, external • Category: usage • Status: stable • Since: 1.0.0

Use the `external` prop when pointing to destinations outside the current shell.

```tsx
const references = [
  { href: 'https://reactnative.dev', label: 'React Native documentation', color: 'primary' },
  { href: 'https://expo.dev', label: 'Expo documentation', color: 'secondary' },
  { href: 'mailto:support@example.com', label: 'Email support', color: 'gray' },
];
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Set `external` to ensure the link opens outside the app shell and receives the proper accessibility attributes.
        </Text>
        {references.map((resource) => (
          <Link key={resource.href} href={resource.href} external color={resource.color}>
            {resource.label}
          </Link>
        ))}
      </Block>
    </Card>
  );
}
```

### Size Options
ID: `Link.sizes` • Tags: link, sizing • Category: appearance • Status: stable • Since: 1.0.0

Demonstrate how the `size` token scales link typography and spacing.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <Link size={size} href="#">Link</Link>
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Visual Variants
ID: `Link.variants` • Tags: link, appearance • Category: appearance • Status: stable • Since: 1.0.0

Compare persistent and hover-only underlines alongside subtle variants.

```tsx
const linkVariants = [
  { label: 'Default underline', variant: 'default' as const, description: 'Underline is always visible for maximum affordance.' },
  { label: 'Hover underline', variant: 'hover-underline' as const, description: 'Underline appears on hover for denser layouts.' },
  { label: 'Subtle primary', variant: 'subtle' as const, color: 'primary', description: 'Muted style that still matches the brand palette.' },
  { label: 'Subtle gray', variant: 'subtle' as const, color: 'gray', description: 'Pair with neutral layouts or footers.' },
];
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Choose a `variant` that matches the surrounding density while keeping the link discoverable.
        </Text>
        {linkVariants.map((entry) => (
          <Block key={entry.label}>
            <Link href="#" variant={entry.variant} color={entry.color}>{entry.label}</Link>
            <Text size="xs" color="secondary">{entry.description}</Text>
          </Block>
        ))}
      </Block>
    </Card>
  );
}
```
