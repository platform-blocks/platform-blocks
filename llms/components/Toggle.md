# Toggle

Toggle provides an intuitive way to select between multiple options. It supports both single and multi-selection modes with various visual styles and orientations for different use cases.

## Metadata

- Canonical name: `Toggle`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Toggle } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: input
- Docs: https://react-ui-library.com/components/Toggle
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Toggle

## Props

_No documented props yet._

## Examples

### Basic Group
ID: `Toggle.basic` • Tags: toggle, alignment • Category: basics • Status: stable • Since: 1.0.0

Render a simple `ToggleGroup` and listen for `onChange` to track the active value.

```tsx
const [alignment, setAlignment] = useState('center');
  const handleChange = (nextValue: string | number | (string | number)[]) => {
    if (typeof nextValue === 'string' || typeof nextValue === 'number') {
      setAlignment(String(nextValue));
    }
  };
  return (
    <Block>
      <ToggleGroup value={alignment} exclusive onChange={handleChange}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleGroup>
      <Text size="xs" color="secondary">
        Selected alignment: {alignment}
      </Text>
    </Block>
  );
}
```

### Exclusive Mode
ID: `Toggle.exclusive` • Tags: toggle, exclusive • Category: behavior • Status: stable • Since: 1.0.0

Enable the `exclusive` prop so the group behaves like radio buttons with a single active value.

```tsx
const [alignment, setAlignment] = useState('center');
  const handleChange = (value: string | number | (string | number)[]) => {
    // For exclusive mode, value should be a single string or number
    if (typeof value === 'string' || typeof value === 'number') {
      setAlignment(String(value));
    }
  };
  return (
    <Block>
      <Block>
        <Text weight="semibold">Exclusive selection</Text>
        <Text size="xs" color="secondary">
          Set `exclusive` to enforce a single active value at a time.
        </Text>
      </Block>
      <ToggleGroup value={alignment} exclusive onChange={handleChange}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
        <ToggleButton value="justify">Justify</ToggleButton>
      </ToggleGroup>
      <Text size="xs" color="secondary">
        Active option: {alignment}
      </Text>
    </Block>
  );
}
```

### Multiple Values
ID: `Toggle.multiple` • Tags: toggle, multi-select • Category: behavior • Status: stable • Since: 1.0.0

Read the array returned by `onChange` to keep several toggles activated together.

```tsx
const [formats, setFormats] = useState(['bold']);
  const handleChange = (value: string | number | (string | number)[]) => {
    if (Array.isArray(value)) {
      setFormats(value.map(String));
    }
  };
  return (
    <Block>
      <Block>
        <Text weight="semibold">Multiple selection</Text>
        <Text size="xs" color="secondary">
          The default mode returns an array of selected values.
        </Text>
      </Block>
      <ToggleGroup value={formats} onChange={handleChange}>
        <ToggleButton value="bold">Bold</ToggleButton>
        <ToggleButton value="italic">Italic</ToggleButton>
        <ToggleButton value="underline">Underline</ToggleButton>
        <ToggleButton value="color">Color</ToggleButton>
      </ToggleGroup>
      <Text size="xs" color="secondary">
        Active formatting: {formats.length > 0 ? formats.join(', ') : 'none'}
      </Text>
    </Block>
  );
}
```

### Orientation
ID: `Toggle.orientation` • Tags: toggle, orientation • Category: layout • Status: stable • Since: 1.0.0

Use the `orientation` prop to switch between horizontal rows and vertical stacks of toggle buttons.

```tsx
const [view, setView] = useState('list');
  const handleChange = (value: string | number | (string | number)[]) => {
    if (typeof value === 'string') {
      setView(value);
    }
  };
  return (
    <Block>
      <Block>
        <Text weight="semibold">Toggle orientations</Text>
        <Text size="xs" color="secondary">
          Swap the `orientation` prop to lay buttons out horizontally or vertically.
        </Text>
      </Block>
      <Row gap="lg" align="flex-start" wrap="wrap">
        <Block>
          <Text size="sm" weight="semibold">
            Horizontal (default)
          </Text>
          <ToggleGroup value={view} exclusive onChange={handleChange} orientation="horizontal">
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="card">Card</ToggleButton>
          </ToggleGroup>
        </Block>
        <Block>
          <Text size="sm" weight="semibold">
            Vertical
          </Text>
          <ToggleGroup value={view} exclusive onChange={handleChange} orientation="vertical">
            <ToggleButton value="list">List</ToggleButton>
            <ToggleButton value="grid">Grid</ToggleButton>
            <ToggleButton value="card">Card</ToggleButton>
          </ToggleGroup>
        </Block>
      </Row>
      <Text size="xs" color="secondary">
        Selected view: {view}
      </Text>
    </Block>
  );
}
```

### Size Variants
ID: `Toggle.sizes` • Tags: toggle, size • Category: appearance • Status: stable • Since: 1.0.0

Set the `size` prop (`xs` through `3xl`) to match the footprint of surrounding controls.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" color="secondary">{size}</Text>
          <ToggleGroup size={size}>
            <ToggleButton value="left">Left</ToggleButton>
            <ToggleButton value="center">Center</ToggleButton>
            <ToggleButton value="right">Right</ToggleButton>
          </ToggleGroup>
        </Block>
      ))}
    </Block>
  );
}
```

### Standalone Toggle
ID: `Toggle.standalone` • Tags: toggle, standalone • Category: basics • Status: stable • Since: 1.0.0

Drive a single toggle by managing its `selected` state without a surrounding group.

```tsx
const [selected, setSelected] = useState(false);
  return (
    <Block>
      <Block>
        <Text weight="semibold">Standalone toggle</Text>
        <Text size="xs" color="secondary">
          Control an individual toggle by pairing `selected` with `onPress`.
        </Text>
      </Block>
      <Row gap="sm" align="center">
        <ToggleButton
          value="favorite"
          selected={selected}
          onPress={() => setSelected((current) => !current)}
        >
          Mark favorite
        </ToggleButton>
        <Text size="xs" color="secondary">
          Status: {selected ? 'Favorited' : 'Not favorited'}
        </Text>
      </Row>
    </Block>
  );
}
```
