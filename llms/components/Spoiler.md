# Spoiler

The Spoiler component automatically collapses content that exceeds a specified height, providing a show/hide toggle to reveal the full content.

## Metadata

- Canonical name: `Spoiler`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Spoiler } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: display
- Docs: https://react-ui-library.com/components/Spoiler
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Spoiler

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | React.ReactNode | Yes |  | Content to hide/show |
| `maxHeight` | number | No |  | Max height (in px) when collapsed |
| `initiallyOpen` | boolean | No |  | Whether component starts initially opened |
| `showLabel` | string | No |  | Label for show more |
| `hideLabel` | string | No |  | Label for hide |
| `transitionDuration` | number | No |  | Transition duration ms |
| `size` | SizeValue | No |  | Size token for the show/hide control font size |
| `opened` | boolean | No |  | Optional controlled open state |
| `onToggle` | (opened: boolean) => void | No |  | Callback when toggle |
| `disabled` | boolean | No |  | Disable toggle |
| `style` | any | No |  | Optional style |
| `renderControl` | (args: { opened: boolean; toggle: () => void; showLabel: string; hideLabel: string }) => React.ReactNode | No |  | Render custom control |
| `transparentFade` | boolean | No |  | If true (default) fade bottom of clamped content to transparent using CSS mask on web |
| `fadeColor` | string | No |  | Fallback overlay gradient end color (used only when transparentFade=false) |
| `disableFadeAnimation` | boolean | No |  | Disable gradient fade animation (debug / perf). Default false (animation enabled). |
| `controlProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the show/hide control `<Text>` (style, weight, ff, size, color). |
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

### Basic Usage
ID: `Spoiler.basic` • Tags: spoiler, collapse, content • Category: basics • Status: stable • Since: 1.0.0

Set `maxHeight` to reveal a preview of long copy while the rest stays accessible behind the built-in toggle.

```tsx
const paragraphs = [
  'Spoilers collapse long sections of copy while keeping the content accessible to screen readers and keyboard users.',
  'Use them for optional detail or secondary information that might distract from a primary task. They expand inline, so the surrounding layout stays stable.',
];
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Keep the initial height short to hint that more detail is available without overwhelming the layout.
        </Text>
        <Spoiler maxHeight={96}>
          <Block>
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} size="sm">
                {paragraph}
              </Text>
            ))}
          </Block>
        </Spoiler>
      </Block>
    </Card>
  );
}
```

### Initial State
ID: `Spoiler.initiallyOpen` • Tags: spoiler, state, initially-open • Category: behavior • Status: stable • Since: 1.0.0

Flip the `initiallyOpen` prop to choose whether content renders expanded on mount or waits for user interaction.

```tsx
const examples = [
  {
    key: 'open',
    label: 'Initially open',
    description:
      'Starts expanded by default so the reader sees the full content on first render.',
    props: { initiallyOpen: true },
  },
  {
    key: 'closed',
    label: 'Initially closed',
    description:
      'Keeps the section compact to emphasize surrounding UI until the user opts in.',
    props: {},
  },
];
const bodyCopy =
  'Vivamus fermentum orci eget tortor facilisis, eu egestas eros maximus. Fusce vitae semper libero. Pellentesque habitant morbi tristique senectus et netus.';
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Control whether the content renders expanded on mount or waits for user input. Both states remain accessible to assistive tech.
        </Text>
        <Block>
          {examples.map((example) => (
            <Block key={example.key}>
              <Text size="xs" color="secondary">
                {example.label}
              </Text>
              <Spoiler maxHeight={72} {...example.props}>
                <Text size="sm">{bodyCopy}</Text>
              </Spoiler>
              <Text size="xs" color="muted">
                {example.description}
              </Text>
            </Block>
          ))}
        </Block>
      </Block>
    </Card>
  );
}
```

### Max Heights
ID: `Spoiler.sizes` • Tags: spoiler, layout, sizes • Category: layout • Status: stable • Since: 1.0.0

Dial the `maxHeight` value up or down to control how much content stays visible before the toggle appears.

```tsx
const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Integer tincidunt condimentum risus, sit amet cursus massa fermentum non.';
const examples = [
  { key: 'small', label: '60px height', maxHeight: 60 },
  { key: 'medium', label: '100px height', maxHeight: 100 },
  { key: 'large', label: '150px height', maxHeight: 150 },
];
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Adjust maxHeight to control how much text stays visible before the rest collapses behind the toggle.
        </Text>
        <Block>
          {examples.map((example) => (
            <Block key={example.key}>
              <Text size="xs" color="secondary">
                {example.label}
              </Text>
              <Spoiler maxHeight={example.maxHeight}>
                <Text size="sm">{longText}</Text>
              </Spoiler>
            </Block>
          ))}
        </Block>
      </Block>
    </Card>
  );
}
```

### Custom Control
ID: `Spoiler.customControl` • Tags: spoiler, render-control, controlled • Category: advanced • Status: stable • Since: 1.0.0

Use the `renderControl` callback alongside `opened` and `onToggle` to drive expansion with your own button or analytics hooks.

```tsx
const [isOpen, setIsOpen] = useState(false);
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Drive the spoiler state yourself to sync analytics or a sibling component. Use renderControl when you need a bespoke trigger.
        </Text>
        <Spoiler
          maxHeight={80}
          opened={isOpen}
          onToggle={setIsOpen}
          renderControl={({ opened, toggle }) => (
            <Button size="xs" variant="outline" onPress={toggle}>
              {opened ? 'Collapse content' : 'Expand content'}
            </Button>
          )}
        >
          <Block>
            <Text size="sm">Open state: {String(isOpen)}</Text>
            <Text size="sm">You can render any React node as the control.</Text>
            <Text size="sm">
              Because the component is controlled, you can track expansion analytics or sync other UI elements when content is revealed.
            </Text>
          </Block>
        </Spoiler>
      </Block>
    </Card>
  );
}
```

### Control customization
ID: `Spoiler.control-customization` • Tags: controlProps, customization, slot-props • Category: general • Status: stable • Since: 1.0.0

`controlProps` accepts any `<Text>` props (`ff`, `weight`, `tracking`, `uppercase`, `size`, `color`) and applies them to the show/hide control text — useful when the rest of your design system uses a particular weight or tracking style.

```tsx
const longText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';
  return (
    <Block>
      <Block>
        <Text size="sm" color="muted">Default control</Text>
        <Spoiler maxHeight={60}>
          <Text>{longText}</Text>
        </Spoiler>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Uppercase tracked control
        </Text>
        <Spoiler
          maxHeight={60}
          showLabel="Read more"
          hideLabel="Hide"
          controlProps={{ uppercase: true, tracking: 1.5, weight: '700', size: 'xs' }}
        >
          <Text>{longText}</Text>
        </Spoiler>
      </Block>
      <Block>
        <Text size="sm" color="muted">
          Monospace control
        </Text>
        <Spoiler
          maxHeight={60}
          showLabel="$ expand"
          hideLabel="$ collapse"
          controlProps={{ ff: 'monospace', weight: '600' }}
        >
          <Text>{longText}</Text>
        </Spoiler>
      </Block>
    </Block>
  );
}
```

### Newspaper
ID: `Spoiler.newspaper` • Category: general

Combine imagery with long-form copy to mimic a newspaper-style reveal where the reader can expand to see the full story.

```tsx
const paragraphs = [
  'The coastal morning edition arrived with stories about record tides and neighborhoods working together to reinforce their seawalls. Photographers captured gulls darting between the waves as volunteers stacked sandbags along the promenade.',
  'Hidden inside the fold was a feature about an amateur archivist who discovered a crate of glass negatives documenting life on the waterfront a century ago. Each plate is being digitized so classrooms can study the evolution of the shoreline.',
  'City gardeners are also experimenting with hardy dune grasses to keep wind-swept sand in place during the colder months. The pilot plots stretch for blocks and bring a warm beige tone to an otherwise grey season.',
];
  const isWeb = Platform.OS === 'web';
  return (
    <Card p="md">
      <Spoiler maxHeight={isWeb ? 220 : 260}>
        <View style={{ flexDirection: isWeb ? 'row' : 'column' }}>
          <Image
            source={require('../../../../assets/images/scene-ocean.png')}
            style={{ width: 180, height: 180, borderRadius: 12, marginRight: isWeb ? 16 : 0, marginBottom: isWeb ? 0 : 12 }}
          />
          <View style={{ flex: 1, marginTop: isWeb ? 0 : 8 }}>
            {paragraphs.map((paragraph) => (
              <Text key={paragraph} size="lg" style={{ marginBottom: 12 }}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </Spoiler>
    </Card>
  );
}
```
