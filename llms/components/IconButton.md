# IconButton

An IconButton is a clickable button that contains an icon and is used to perform actions or trigger events. It is typically used in toolbars, action bars, or as standalone buttons in user interfaces.

## Metadata

- Canonical name: `IconButton`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { IconButton } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: input
- Tags: button, icon, clickable, action
- Docs: https://react-ui-library.com/components/IconButton
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/IconButton

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `icon` | string \| ExternalIconComponent \| React.ReactElement | Yes |  | Icon to render. Accepts a registry name, or an external icon library component/element (e.g. a Tabler icon) for use without registration. |
| `onPress` | () => void | No |  | Called when the button is pressed |
| `onLayout` | (event: any) => void | No |  | Called when the button layout is calculated |
| `variant` | 'default' \| 'filled' \| 'secondary' \| 'outline' \| 'ghost' \| 'gradient' \| 'none' | No | 'default' | Button visual variant. `default` is the neutral surface-plus-hairline button, matching `Button`; a solid primary fill is opt-in via `filled`. |
| `size` | SizeValue | No |  | Button size |
| `disabled` | boolean | No |  | Whether the button is disabled |
| `loading` | boolean | No |  | Whether button is in loading state (shows loader) |
| `color` | string | No |  | Tint for the button. Accepts raw CSS color OR theme token syntax: - 'primary' (palette key -> uses middle shade 5) - 'primary.6' (palette key + shade index) - '#ff0000' / 'rgb(...)' direct colors `filled`, `secondary` and `outline` tint the container; `ghost` and the neutral `default`/`none` keep their chrome and tint only the icon. `gradient` draws its own overlay and ignores this. |
| `iconColor` | string | No |  | Explicit icon color override (else derived automatically from variant & color) |
| `iconVariant` | IconProps['variant'] | No |  | Icon variant override |
| `iconSize` | IconProps['size'] | No |  | Icon size override (defaults to appropriate size for button size) |
| `tooltip` | TooltipPropValue | No |  | Tooltip shown on hover/focus — wraps the button in a `Tooltip`. Pass a string, or a config object (`{ label, maxWidth, withArrow, … }`) for long labels that need a wider bubble. |
| `tooltipPosition` | TooltipProps['position'] | No |  | Tooltip position when the string form of `tooltip` is used |
| `accessibilityLabel` | string | No |  | Accessibility label - highly recommended for icon-only buttons |
| `transitionDuration` | number | No | 100 | Length of the press scale transition in ms. `0` applies the pressed state instantly. Always 0 under reduced motion. |
| `style` | any | No |  | Style overrides for the button container |
| `testID` | string | No |  | Test ID for testing |
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
| `fullWidth` | boolean | No |  | Makes the component fill the full width of its parent |
| `w` | DimensionValue | No |  | Sets a specific width |
| `h` | DimensionValue | No |  | Sets a specific height |
| `maxW` | DimensionValue | No |  | Sets the maximum width |
| `minW` | DimensionValue | No |  | Sets the minimum width |
| `maxH` | DimensionValue | No |  | Sets the maximum height |
| `minH` | DimensionValue | No |  | Sets the minimum height |
| `radius` | RadiusValue | No |  | Border radius value - supports size tokens, numbers, and special values |
| `shadow` | ShadowValue | No |  | Shadow value - supports size tokens and 'none' |

## Examples

### Basic
ID: `IconButton.basic` • Category: general

```tsx
const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const handlePress = (action: string) => {
    console.log(`IconButton pressed: ${action}`);
  };
  return (
    <Block p="lg">
      <Text variant="h4">IconButton Component Demo</Text>
      <Text color="muted">
        IconButton is designed specifically for displaying icons in square or circular shapes.
        Use radius="xl" for circular buttons.
      </Text>
      {/* Controls */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Controls</Text>
          <Row gap="lg">
            <Switch
              label="Loading state"
              checked={loading}
              onChange={setLoading}
            />
            <Switch
              label="Disabled state"
              checked={disabled}
              onChange={setDisabled}
            />
          </Row>
        </Block>
      </Card>
      {/* Variants */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Variants</Text>
          <Row gap="md" align="center" wrap="wrap">
            <IconButton
              icon="home"
              variant="default"
              onPress={() => handlePress('default')}
              loading={loading}
              disabled={disabled}
              tooltip="Home (Default)"
            />
            <IconButton
              icon="bell"
              variant="filled"
              onPress={() => handlePress('filled')}
              loading={loading}
              disabled={disabled}
              tooltip="Home (Filled)"
            />
            <IconButton
              icon="heart"
              variant="secondary"
              onPress={() => handlePress('secondary')}
              loading={loading}
              disabled={disabled}
              tooltip="Favorite (Secondary)"
            />
            <IconButton
              icon="settings"
              variant="outline"
              onPress={() => handlePress('outline')}
              loading={loading}
              disabled={disabled}
              tooltip="Settings (Outline)"
            />
            <IconButton
              icon="search"
              variant="ghost"
              onPress={() => handlePress('ghost')}
              loading={loading}
              disabled={disabled}
              tooltip="Search (Ghost)"
            />
            <IconButton
              icon="star"
              variant="gradient"
              onPress={() => handlePress('gradient')}
              loading={loading}
              disabled={disabled}
              tooltip="Star (Gradient)"
            />
          </Row>
        </Block>
      </Card>
      {/* Sizes */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Sizes</Text>
          <Row gap="md" align="center" wrap="wrap">
            <IconButton
              icon="plus"
              size="xs"
              onPress={() => handlePress('xs')}
              tooltip="Extra Small"
            />
            <IconButton
              icon="plus"
              size="sm"
              onPress={() => handlePress('sm')}
              tooltip="Small"
            />
            <IconButton
              icon="plus"
              size="md"
              onPress={() => handlePress('md')}
              tooltip="Medium"
            />
            <IconButton
              icon="plus"
              size="lg"
              onPress={() => handlePress('lg')}
              tooltip="Large"
            />
            <IconButton
              icon="plus"
              size="xl"
              onPress={() => handlePress('xl')}
              tooltip="Extra Large"
            />
          </Row>
        </Block>
      </Card>
      {/* Shape: Square vs Circular */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Shape: Square vs Circular</Text>
          <Row gap="md" align="center" wrap="wrap">
            <Block align="center">
              <IconButton
                icon="download"
                radius="sm"
                onPress={() => handlePress('square-sm')}
                tooltip="Small Radius (Square-ish)"
              />
              <Text size="xs" color="muted">radius="sm"</Text>
            </Block>
            <Block align="center">
              <IconButton
                icon="download"
                radius="md"
                onPress={() => handlePress('square-md')}
                tooltip="Medium Radius"
              />
              <Text size="xs" color="muted">radius="md"</Text>
            </Block>
            <Block align="center">
              <IconButton
                icon="download"
                radius="lg"
                onPress={() => handlePress('square-lg')}
                tooltip="Large Radius"
              />
              <Text size="xs" color="muted">radius="lg"</Text>
            </Block>
            <Block align="center">
              <IconButton
                icon="download"
                radius="xl"
                onPress={() => handlePress('circular')}
                tooltip="Circular (XL Radius)"
              />
              <Text size="xs" color="muted">radius="xl" (circular)</Text>
            </Block>
          </Row>
        </Block>
      </Card>
      {/* Custom Colors */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Custom Colors</Text>
          <Row gap="md" align="center" wrap="wrap">
            <IconButton
              icon="heart"
              color="error"
              onPress={() => handlePress('red')}
              tooltip="Red Heart"
            />
            <IconButton
              icon="check"
              color="success"
              onPress={() => handlePress('green')}
              tooltip="Green Check"
            />
            <IconButton
              icon="info"
              color="primary"
              onPress={() => handlePress('blue')}
              tooltip="Blue Info"
            />
            <IconButton
              icon="warning"
              color="warning"
              onPress={() => handlePress('orange')}
              tooltip="Orange Warning"
            />
            <IconButton
              icon="star"
              color="#9333ea"
              radius="xl"
              onPress={() => handlePress('purple')}
              tooltip="Purple Star (Circular)"
            />
          </Row>
        </Block>
      </Card>
      {/* Common Use Cases */}
      <Card p="lg" variant="outline">
        <Block>
          <Text variant="h6">Common Use Cases</Text>
          {/* Toolbar */}
          <Block>
            <Text size="sm" weight="medium">Toolbar Actions</Text>
            <Row gap="xs" align="center">
              <IconButton icon="undo" variant="ghost" size="sm" tooltip="Undo" />
              <IconButton icon="redo" variant="ghost" size="sm" tooltip="Redo" />
              <Divider orientation="vertical" style={{ height: 24 }} />
              <IconButton icon="bold" variant="ghost" size="sm" tooltip="Bold" />
              <IconButton icon="italic" variant="ghost" size="sm" tooltip="Italic" />
              <IconButton icon="underline" variant="ghost" size="sm" tooltip="Underline" />
              <Divider orientation="vertical" style={{ height: 24 }} />
              <IconButton icon="link" variant="ghost" size="sm" tooltip="Add Link" />
              <IconButton icon="image" variant="ghost" size="sm" tooltip="Add Image" />
            </Row>
          </Block>
          {/* Social Actions */}
          <Block>
            <Text size="sm" weight="medium">Social Actions (Circular)</Text>
            <Row gap="xs" align="center">
              <IconButton 
                icon="heart" 
                variant="outline" 
                radius="xl" 
                color="error"
                tooltip="Like" 
              />
              <IconButton 
                icon="message-circle" 
                variant="outline" 
                radius="xl" 
                color="primary"
                tooltip="Comment" 
              />
              <IconButton 
                icon="share" 
                variant="outline" 
                radius="xl" 
                color="success"
                tooltip="Share" 
              />
              <IconButton 
                icon="bookmark" 
                variant="outline" 
                radius="xl" 
                tooltip="Bookmark" 
              />
            </Row>
          </Block>
          {/* Navigation */}
          <Block>
            <Text size="sm" weight="medium">Navigation</Text>
            <Row gap="xs" align="center">
              <IconButton icon="chevron-left" variant="secondary" tooltip="Previous" />
              <IconButton icon="chevron-right" variant="secondary" tooltip="Next" />
              <IconButton icon="chevron-up" variant="secondary" tooltip="Up" />
              <IconButton icon="chevron-down" variant="secondary" tooltip="Down" />
              <IconButton icon="external-link" variant="secondary" tooltip="Open External" />
            </Row>
          </Block>
        </Block>
      </Card>
    </Block>
  );
}
```
