# CopyButton

Small utility component for copying text values to the clipboard with optional toast feedback. Used inside components like `CodeBlock` and `QRCode` to standardize UX.

## Metadata

- Canonical name: `CopyButton`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { CopyButton } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.1.0
- Category: input
- Docs: https://react-ui-library.com/components/CopyButton
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/CopyButton

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `value` | string | Yes |  | The text to copy to clipboard |
| `onCopy` | (value: string) => void | No |  | Callback fired after copy action |
| `iconOnly` | boolean | No |  | If true, only the icon is shown (no button chrome or label) |
| `label` | string | No |  | Accessible label for the button |
| `toastTitle` | string | No |  | Title for the toast |
| `toastMessage` | string | No |  | Detailed message for the toast |
| `size` | ComponentSizeValue | No |  | Visual size token |
| `style` | StyleProp<ViewStyle> | No |  | Style overrides for the button container |
| `disableToast` | boolean | No |  | Disable the "copied to clipboard" toast |
| `tooltip` | TooltipPropValue | No |  | Tooltip text, or a full Tooltip config (`{ label, maxWidth, … }`) |
| `tooltipPosition` | 'top' \| 'bottom' \| 'left' \| 'right' | No |  | Tooltip position when the string form of `tooltip` is used |
| `mode` | 'button' \| 'icon' | No |  | Presentation mode: default button (legacy) or bare icon |
| `buttonVariant` | 'none' \| 'secondary' \| 'ghost' \| 'filled' \| 'outline' \| 'gradient' \| undefined | No |  | Button variant override when in button mode |
| `iconName` | string | No |  | Icon name to display (defaults to copy) when in icon mode |
| `copiedIconName` | string | No |  | Icon name to display after copy (default check) in icon mode |
| `iconColor` | string | No |  | Base icon color (icon mode) |
| `copiedIconColor` | string | No |  | Copied state icon color (icon mode) |

## Examples

### Basic
ID: `CopyButton.basic` • Category: general

Icon-only copy button with default toast feedback.

```tsx
return (
    <Card p={16} variant="outline">
      <Flex direction="row" align="center" gap={12}>
        <Text size="sm">Invite Code:</Text>
        <Text weight="semibold">ABCD-1234</Text>
        <CopyButton value="ABCD-1234" />
      </Flex>
    </Card>
  );
}
```

### Labeled
ID: `CopyButton.labeled` • Category: general

Copy control showing label text instead of icon-only presentation.

```tsx
return (
    <Card p={16} variant="outline">
      <Flex direction="column" gap={12}>
        <Text size="sm" weight="semibold">API Key</Text>
        <Flex direction="row" gap={8} align="center">
          <Text size="xs" style={{ maxWidth: 240 }}>sk_live_1a2b3c4d5e6f7g8h9i10</Text>
          <CopyButton value="sk_live_1a2b3c4d5e6f7g8h9i10" iconOnly={false} label="Copy Key" />
        </Flex>
      </Flex>
    </Card>
  );
}
```

### Long Value
ID: `CopyButton.long-value` • Category: general

Long value truncation in toast (shows ellipsis for >60 chars).

```tsx
const longToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.long.payload.value.with.many.sections.and.characters.for.demo.purposes.only';
  return (
    <Card p={16} variant="outline">
      <Flex direction="column" gap={12}>
        <Text size="sm" weight="semibold">JWT Token</Text>
        <Text size="xs" style={{ maxWidth: 520 }}>{longToken}</Text>
        <CopyButton value={longToken} iconOnly={false} label="Copy Token" />
      </Flex>
    </Card>
  );
}
```

### No Toast
ID: `CopyButton.no-toast` • Category: general

Copy control with toast notifications disabled.

```tsx
const [copiedValue, setCopiedValue] = useState<string | null>(null);
  return (
    <Card p={16} variant="outline">
      <Flex direction="column" gap={12}>
        <Flex direction="row" gap={8} align="center">
          <Text size="sm">Secret:</Text>
          <Text weight="semibold">hunter2</Text>
          <CopyButton value="hunter2" disableToast onCopy={(v) => setCopiedValue(v)} iconOnly={false} label="Copy" />
        </Flex>
        {copiedValue && <Text size="xs" color="success">Copied locally: {copiedValue}</Text>}
      </Flex>
    </Card>
  );
}
```

### Sizes
ID: `CopyButton.sizes` • Category: general

Scale the copy affordance with the `size` prop, from `xs` through `3xl`.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row align="center" gap="lg" wrap="wrap">
      {SIZES.map((size) => (
        <Block key={size} align="center">
          <CopyButton size={size} value="@platform-blocks/react-ui-library" />
          <Text variant="small">{size}</Text>
        </Block>
      ))}
    </Row>
  );
}
```
