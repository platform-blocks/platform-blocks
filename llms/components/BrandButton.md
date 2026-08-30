# BrandButton

The BrandButton component renders a branded pressable for any platform in the brand icon registry. By default it's a single-line button supporting variants, sizes, icons, loading state, and full-width layout. Pass `primaryText` and `secondaryText` instead of `title` and it renders the two-line store-badge layout ("Download on the / App Store").

## Metadata

- Canonical name: `BrandButton`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { BrandButton } from '@platform-blocks/react-ui-library';`
- Category: input
- Tags: action, pressable, interactive, badge, app-store
- Docs: https://react-ui-library.com/components/BrandButton
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/BrandButton

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `brand` | BrandPlatform | Yes |  | The brand/platform to style the button for |
| `iconPosition` | 'left' \| 'right' | No |  | Position of the brand icon |
| `iconVariant` | 'full' \| 'mono' | No |  | Icon variant: 'full' for multi-color, 'mono' for single-color outline |
| `icon` | React.ReactNode | No |  | Override the default brand icon |
| `title` | string | No |  | Button text. Omit when rendering a store badge. |
| `color` | string | No |  | Override icon color (overrides brand default colors) |
| `primaryText` | string | No |  | Badge lead-in line, e.g. "Download on the" / "Listen on". Supplying this or `secondaryText` switches the component to the two-line store-badge layout, where `variant`, `loading`, `fullWidth` and the spacing props do not apply. |
| `secondaryText` | string | No |  | Badge headline, e.g. "App Store" / "Spotify" |
| `backgroundColor` | string | No |  | Badge shell background (badge layout only) |
| `borderColor` | string | No |  | Badge shell border color (badge layout only) |
| `darkMode` | boolean | No |  | Force the badge's dark-mode styling instead of following the theme |
| `key` | React.Key | No |  | allow React key without complaint in TS where JSX key is forwarded in type checking |
| `children` | React.ReactNode | No |  | Button text content - alternative to title prop |
| `onPress` | () => void | No |  | Called when the button is pressed |
| `onPressIn` | () => void | No |  | Called when the button press starts (for immediate feedback) |
| `onPressOut` | () => void | No |  | Called when the button press ends |
| `onHoverIn` | () => void | No |  | Called when the button is hovered (web/desktop only) |
| `onHoverOut` | () => void | No |  | Called when the button is no longer hovered (web/desktop only) |
| `onLongPress` | () => void | No |  | Called when the button is long-pressed |
| `onLayout` | (event: any) => void | No |  | Called when the button layout is calculated |
| `variant` | 'default' \| 'filled' \| 'light' \| 'subtle' \| 'secondary' \| 'outline' \| 'ghost' \| 'gradient' \| 'link' \| 'none' | No | 'default' | Button visual variant. `default` is a neutral button — the card surface with a hairline border and body text — so an unstyled `<Button>` never claims the accent color. A solid primary fill is opt-in via `filled`. |
| `size` | SizeValue | No |  | Button size |
| `disabled` | boolean | No |  | Whether the button is disabled |
| `loading` | boolean | No |  | Whether button is in loading state (shows loader) |
| `loadingTitle` | string | No |  | Text to show when loading (if not provided, shows empty text but maintains original width) |
| `fullWidth` | boolean | No |  | Whether button should fill the full width of its parent container. Buttons size to their content by default; `fullWidth`, an explicit `w`, or a flex value in `style` makes them fill instead. |
| `textColor` | string | No |  | Explicit text color override (else derived automatically from variant & color) |
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

### BrandButton
ID: `BrandButton.basic` • Tags: basic, getting-started • Category: basics • Status: stable • Since: 1.0.0

Basic Button usage with a title prop.

```tsx
const toast = useToast()
  return <BrandButton
   title="Click Me" 
  brand="facebook"
    onPress={() => toast.warn({ 
      title: 'What the Zuck!',
      message: 'This is a Facebook brand button',
      position: 'top-center'
    })}
  />
}
```

### BrandButton
ID: `BrandButton.colorOverride` • Tags: basic, getting-started • Category: basics • Status: stable • Since: 1.0.0

Basic Button usage with a title prop.

```tsx
return (
      <Flex direction="column" gap="lg">
        <Text variant="h6">Brand Icon Color Override</Text>
        <Text variant="p" color="secondary">
          Use the color prop to override default brand colors with a single color
        </Text>
        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Default Colors:</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" />
            <BrandButton brand="github" title="GitHub" />
            <BrandButton brand="spotify" title="Spotify" />
            <BrandButton brand="microsoft" title="Microsoft" />
          </Flex>
        </Flex>
        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Custom Color (#666666):</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" color="#666666" />
            <BrandButton brand="github" title="GitHub" color="#666666" />
            <BrandButton brand="spotify" title="Spotify" color="#666666" />
            <BrandButton brand="microsoft" title="Microsoft" color="#666666" />
          </Flex>
        </Flex>
        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Red Override (#E53E3E):</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" color="#E53E3E" />
            <BrandButton brand="github" title="GitHub" color="#E53E3E" />
            <BrandButton brand="spotify" title="Spotify" color="#E53E3E" />
            <BrandButton brand="microsoft" title="Microsoft" color="#E53E3E" />
          </Flex>
        </Flex>
        <Flex direction="column" gap="md">
          <Text variant="small" weight="600">Outline Variant with Color Override:</Text>
          <Flex direction="row" gap="sm" wrap="wrap">
            <BrandButton brand="google" title="Google" variant="outline" color="#8B5CF6" />
            <BrandButton brand="github" title="GitHub" variant="outline" color="#8B5CF6" />
            <BrandButton brand="spotify" title="Spotify" variant="outline" color="#8B5CF6" />
            <BrandButton brand="microsoft" title="Microsoft" variant="outline" color="#8B5CF6" />
          </Flex>
        </Flex>
      </Flex>
  );
}
```

### Universal Props Demo
ID: `BrandButton.universalProps` • Tags: basic, getting-started • Category: basics • Status: stable • Since: 1.0.0

These components demonstrate universal props like `lightHidden` and `darkHidden` that work across the entire library. Toggle dark/light mode or resize the window.

```tsx
return (
    <Block>
      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Light Mode Only (darkHidden):</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton brand="google" title="Google" darkHidden />
          <BrandButton brand="github" title="GitHub" darkHidden />
        </Flex>
      </Flex>
      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Dark Mode Only (lightHidden):</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton brand="spotify" title="Spotify (Dark Only)" lightHidden />
          <BrandButton brand="microsoft" title="Microsoft (Dark Only)" lightHidden />
        </Flex>
      </Flex>
      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Responsive Visibility:</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton brand="apple" title="Hidden on Large+" hiddenFrom={1024} />
          <BrandButton brand="amazon" title="Visible on Medium+" visibleFrom={768} />
        </Flex>
      </Flex>
      <Flex direction="column" gap="md">
        <Text variant="small" weight="600">Combined Props:</Text>
        <Flex direction="row" gap="sm" wrap="wrap">
          <BrandButton
            brand="discord"
            title="Dark + Large Screen Only"
            lightHidden
            visibleFrom={1024}
          />
        </Flex>
      </Flex>
    </Block>
  );
}
```

### Store badges
ID: `BrandButton.badge` • Tags: badge, app-store, store • Category: basics • Status: stable • Since: 1.0.0

Supplying `primaryText` and `secondaryText` switches BrandButton from the single-line button to the two-line store-badge layout. Any brand in the icon registry works, and the shell defaults to black until `backgroundColor` says otherwise.

```tsx
const toast = useToast();
  const announce = (store: string) =>
    toast.info({
      title: `${store} pressed`,
      message: `Wire onPress up to Linking.openURL with your ${store} listing.`,
      autoHide: 3000,
    });
  return (
    <Row gap="md" wrap="wrap" justify="center" align="center">
      {/* Passing primaryText/secondaryText switches BrandButton to the badge layout. */}
      <BrandButton
        brand="app-store"
        primaryText="Download on the"
        secondaryText="App Store"
        onPress={() => announce('App Store')}
      />
      <BrandButton
        brand="google-play"
        primaryText="Get it on"
        secondaryText="Google Play"
        onPress={() => announce('Google Play')}
      />
      {/* Badges default to a black shell whatever the brand — `backgroundColor` opts one out. */}
      <BrandButton
        brand="spotify"
        primaryText="Listen on"
        secondaryText="Spotify"
        backgroundColor="#1DB954"
        onPress={() => announce('Spotify')}
      />
    </Row>
  );
}
```

### Badge sizes
ID: `BrandButton.badgeSizes` • Tags: badge, size • Category: basics • Status: stable • Since: 1.0.0

Every badge metric — padding, icon, radius, height — is derived from the size token's headline type, so the proportions hold from `xs` through `3xl`.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Row gap="lg" wrap="wrap" align="flex-end">
      {SIZES.map((size) => (
        <Block key={size} align="center" gap="xs">
          <BrandButton
            brand="app-store"
            primaryText="Download on the"
            secondaryText="App Store"
            size={size}
          />
          <Text variant="small" color="secondary">
            {size}
          </Text>
        </Block>
      ))}
    </Row>
  );
}
```

### Badge colors
ID: `BrandButton.badgeColors` • Tags: badge, color, theming • Category: basics • Status: stable • Since: 1.0.0

Override the badge shell with `backgroundColor`, `textColor`, and `borderColor` to match your brand or design requirements.

```tsx
return (
    <Block direction="row">
      <BrandButton
        brand="github"
        primaryText="View on"
        secondaryText="GitHub"
        backgroundColor="#ffffff"
        textColor="#24292e"
        borderColor="#24292e"
        onPress={() => console.log('GitHub light pressed')}
      />
      <BrandButton
        brand="spotify"
        primaryText="Listen on"
        secondaryText="Spotify"
        backgroundColor="#191414"
        textColor="#1DB954"
        borderColor="#1DB954"
        onPress={() => console.log('Spotify custom pressed')}
      />
    </Block>
  );
}
```
