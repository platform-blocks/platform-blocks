# Button

The Button component provides a flexible interactive element supporting variants, sizes, icons, loading state, and full-width layout. The inner label `<Text>` accepts the full Text-prop API via `labelProps` (`ff`, `weight`, `tracking`, `uppercase`, `color`, `style`).

Buttons default to the `default` variant — a neutral button (card surface, hairline border, body text) that sizes to its content. Reach for `variant="filled"` on the primary action of a view, and `fullWidth` (or `w`) when the button should span its container.

## Metadata

- Canonical name: `Button`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Button } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: action, pressable, interactive
- Docs: https://react-ui-library.com/components/Button
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Button

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `key` | React.Key | No |  | allow React key without complaint in TS where JSX key is forwarded in type checking |
| `title` | string | No |  | Button text content - can be provided via title prop or children |
| `children` | React.ReactNode | No |  | Button text content - alternative to title prop |
| `onPress` | () => void | No |  | Called when the button is pressed |
| `onPressIn` | () => void | No |  | Called when the button press starts (for immediate feedback) |
| `onPressOut` | () => void | No |  | Called when the button press ends |
| `onHoverIn` | () => void | No |  | Called when the button is hovered (web/desktop only) |
| `onHoverOut` | () => void | No |  | Called when the button is no longer hovered (web/desktop only) |
| `onLongPress` | () => void | No |  | Called when the button is long-pressed |
| `onLayout` | (event: any) => void | No |  | Called when the button layout is calculated |
| `variant` | 'default' \| 'filled' \| 'light' \| 'subtle' \| 'secondary' \| 'outline' \| 'ghost' \| 'gradient' \| 'link' \| 'none' | No | 'default' | Button visual variant. `default` is a neutral button — the card surface with a hairline border and body text — so an unstyled `<Button>` never claims the accent color. A solid primary fill is opt-in via `filled`. |
| `color` | string | No |  | Theme color the button is tinted with. A palette token (`primary`, `success`, `error`, …) or any raw CSS/hex color. Applies to the color-bearing variants (`filled`, `light`, `subtle`, `outline`, `gradient`) and to the text of `ghost`/`link`. Defaults to `primary`. `secondary` stays neutral by design. |
| `size` | SizeValue | No |  | Button size |
| `disabled` | boolean | No |  | Whether the button is disabled |
| `loading` | boolean | No |  | Whether button is in loading state (shows loader) |
| `loadingTitle` | string | No |  | Text to show when loading (if not provided, shows empty text but maintains original width) |
| `fullWidth` | boolean | No |  | Whether button should fill the full width of its parent container. Buttons size to their content by default; `fullWidth`, an explicit `w`, or a flex value in `style` makes them fill instead. |
| `textColor` | string | No |  | Explicit text color override (else derived automatically from variant & color) |
| `icon` | React.ReactNode | No |  | Icon to show in the center (for icon-only buttons) |
| `startIcon` | React.ReactNode | No |  | Icon to show on the left side of the button |
| `endIcon` | React.ReactNode | No |  | Icon to show on the right side of the button |
| `tooltip` | TooltipPropValue | No |  | Tooltip shown on hover/focus — wraps the button in a `Tooltip`. Pass a string for the common case, or a config object to tune the tooltip: `tooltip={{ label: 'Long explanation…', maxWidth: 320, withArrow: true }}`. |
| `tooltipPosition` | TooltipProps['position'] | No |  | Tooltip position when the string form of `tooltip` is used |
| `transitionDuration` | number | No | 110 | Length of the press / pulse / hover transitions in ms. `0` applies each state instantly (no scale animation). Always 0 under reduced motion. |
| `style` | any | No |  | Style overrides for the button container |
| `testID` | string | No |  | Test ID for testing library queries |
| `accessibilityLabel` | string | No |  | Accessibility label for screen readers |
| `accessibilityHint` | string | No |  | Accessibility hint for screen readers |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the inner label `<Text>` (style, weight, ff, size, color). |
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
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |
| `shadow` | ShadowValue | No |  | Shadow value - supports size tokens and 'none' |

## Examples

### Basics
ID: `Button.basic` • Tags: buttons • Category: basics • Status: stable • Since: 1.0.0

Invokes a primary action and surfaces feedback through a toast helper.

```tsx
const toast = useToast();
  return (
    <Block align="flex-start">
      <Button
        title="Launch mission"
        onPress={() => toast.success('Launch command sent')}
      />
      <Button
        title="Abort"
        onPress={() => toast.error('Sequence aborted')}
      />
    </Block>
  );
}
```

### Colors
ID: `Button.colors` • Tags: buttons, colors • Category: styling • Status: stable • Since: 1.0.0

Pair `color` with a color-bearing variant (`filled`, `light`, `subtle`, `outline`, `gradient`) to align actions with brand intent. The default variant is neutral chrome and ignores `color`.

```tsx
return (
    <Row gap="md" wrap="wrap">
      <Button variant="filled" color="primary">Primary</Button>
      <Button variant="filled" color="secondary">Secondary</Button>
      <Button variant="filled" color="success">Success</Button>
      <Button variant="filled" color="warning">Warning</Button>
      <Button variant="filled" color="error">Error</Button>
    </Row>
  );
}
```

### Loading state
ID: `Button.loading` • Tags: buttons, loading • Category: feedback • Status: stable • Since: 1.0.0

Demonstrates consistent width preservation, custom `loadingTitle`, and disabling actions while background work completes.

```tsx
const LOADING_DURATION_MS = 2000;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  const triggerLoading = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveKey(key);
    timeoutRef.current = setTimeout(() => {
      setActiveKey(null);
      timeoutRef.current = null;
    }, LOADING_DURATION_MS);
  };
  return (
    <Row gap="md" wrap="wrap" align="flex-start">
      <Button loading={activeKey === 'default'} onPress={() => triggerLoading('default')}>
        Submit application
      </Button>
      <Button
        loading={activeKey === 'custom'}
        loadingTitle="Submitting…"
        onPress={() => triggerLoading('custom')}
      >
        Submit application
      </Button>
      <Button
        loading={activeKey === 'disabled'}
        disabled={activeKey === 'disabled'}
        loadingTitle="Loading"
        onPress={() => triggerLoading('disabled')}
      >
        Submit application
      </Button>
    </Row>
  );
}
```

### Variants
ID: `Button.variants` • Tags: buttons, variants • Category: styling • Status: stable • Since: 1.0.0

Preview the available button variants to match the desired emphasis level.

```tsx
return (
    <Row gap="md" wrap="wrap">
      <Button variant="default">Default</Button>
      <Button variant="filled">Filled</Button>
      <Button variant="light">Light</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="gradient">Gradient</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="none">Text only</Button>
    </Row>
  );
}
```

### Sizes
ID: `Button.sizes` • Tags: buttons, sizes • Category: styling • Status: stable • Since: 1.0.0

Preview the available button size tokens for different density requirements.

```tsx
return (
    <Row gap="md" wrap="wrap" align="flex-end">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </Row>
  );
}
```

### Localized labels
ID: `Button.localized-basic` • Tags: buttons, i18n • Category: accessibility • Status: stable • Since: 1.0.0

Switch locales at runtime and render translated button copy with `useI18n` helpers.

```tsx
const LOCALES = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
];
  const { t, locale, setLocale } = useI18n();
  return (
    <Flex>
      <Select
        options={LOCALES}
        value={locale}
        onChange={(value) => { if (value) setLocale(value); }}
      />
      <Button
        title={t('button.demo.submit')}
        w={200}
      />
    </Flex>
  );
}
```

### Tooltips
ID: `Button.tooltip` • Tags: buttons, tooltip • Category: behavior • Status: stable • Since: 1.0.0

Add contextual hints to buttons with `tooltip` and optional placement overrides.

```tsx
return (
    <Block>
      <Row gap="md" wrap="wrap" align="flex-start">
        <Button tooltip="Save your current work.">Save</Button>
        <Button
          variant="outline"
          tooltip="Permanently delete this item."
          tooltipPosition="bottom"
        >
          Delete
        </Button>
        <Button
          variant="ghost"
          tooltip="Get help and support resources."
          tooltipPosition="right"
        >
          Help
        </Button>
      </Row>
      <Row gap="md" wrap="wrap" align="flex-start">
        <Button tooltip="Download the file to your device." tooltipPosition="left">
          Download
        </Button>
        <Button icon={<Icon name="settings" />} tooltip="Open the settings panel." accessibilityLabel="Open settings" />
        <Button disabled tooltip="Feature not available in demo mode.">
          Upload
        </Button>
      </Row>
    </Block>
  );
}
```

### Width
ID: `Button.width` • Tags: buttons, layout • Category: layout • Status: stable • Since: 1.0.0

Demonstrates fixed, percentage, and full-width buttons alongside loading states that preserve dimensions.

```tsx
const LOADING_DURATION_MS = 2000;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  useEffect(() => () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  const triggerLoading = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoadingKey(key);
    timeoutRef.current = setTimeout(() => {
      setLoadingKey(null);
      timeoutRef.current = null;
    }, LOADING_DURATION_MS);
  };
  return (
    <Block>
      <Block>
        <Block>
          <Button>Default width</Button>
          <Text variant="small" color="muted">
            Buttons size themselves to the label length by default.
          </Text>
        </Block>
        <Block>
          <Button w={200}>Fixed width (200)</Button>
          <Text variant="small" color="muted">
            Provide an exact `w` value for pixel-perfect toolbars.
          </Text>
        </Block>
      </Block>
      <Block>
        <Row gap="md" wrap="wrap" align="flex-start">
          <Button
            loading={loadingKey === 'long'}
            loadingTitle="Loading…"
            onPress={() => triggerLoading('long')}
          >
            Preserve width while loading
          </Button>
          <Button loading={loadingKey === 'short'} onPress={() => triggerLoading('short')}>
            Short text
          </Button>
        </Row>
        <Text variant="small" color="muted">
          When `loading` is true, the button keeps its original width so layouts stay stable.
        </Text>
      </Block>
    </Block>
  );
}
```
