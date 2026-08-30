# Masonry

Masonry provides an efficient way to create Pinterest-style layouts where items are arranged in columns with varying heights. Built on FlashList for optimal performance with large datasets, it automatically handles item positioning and provides smooth scrolling even with hundreds of items. The component supports dynamic heights through the heightRatio property on items, custom renderers, and responsive column counts. Perfect for image galleries, card layouts, or any scenario where you need an organic, space-efficient arrangement of content.

## Metadata

- Canonical name: `Masonry`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Masonry } from '@platform-blocks/react-ui-library';`
- Status: stable
- Category: layout
- Docs: https://react-ui-library.com/components/Masonry
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Masonry

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `data` | MasonryItem[] | Yes |  | Array of items to display in masonry layout |
| `numColumns` | number | No |  | Number of columns (default: 2) |
| `gap` | SizeValue | No |  | Spacing between items |
| `optimizeItemArrangement` | boolean | No |  | Whether to optimize for staggered grid layout |
| `renderItem` | (item: MasonryItem, index: number) => ReactNode | No |  | Custom item renderer - receives item and index |
| `contentContainerStyle` | StyleProp<ViewStyle> | No |  | Content container style |
| `style` | StyleProp<ViewStyle> | No |  | Custom styles |
| `testID` | string | No |  | Test ID for testing |
| `loading` | boolean | No |  | Loading state |
| `emptyContent` | ReactNode | No |  | Empty state content |
| `flashListProps` | MasonryFlashListProps | No |  | Flash list props to pass through |
| `onEndReached` | ((info: { distanceFromEnd: number }) => void) \| null | No |  | Callback when the end of the list is reached (for pagination / infinite scroll) |
| `onEndReachedThreshold` | number | No |  | Distance from end (in pixels) to trigger onEndReached (default: FlashList default) |
| `onViewableItemsChanged` | MasonryViewabilityCallback | No |  | Callback when viewable items change |
| `scrollEnabled` | boolean | No |  | Whether scrolling is enabled |
| `ListEmptyComponent` | React.ComponentType<any> \| React.ReactElement \| null | No |  | Component rendered when the list is empty |
| `ListFooterComponent` | React.ComponentType<any> \| React.ReactElement \| null | No |  | Component rendered at the bottom of the list |
| `ListHeaderComponent` | React.ComponentType<any> \| React.ReactElement \| null | No |  | Component rendered at the top of the list |
| `estimatedItemSize` | number | No |  | Estimated size of each item (performance hint) |
| `refreshControl` | React.ReactElement | No |  | Pull-to-refresh control |
| `onScroll` | ScrollViewProps['onScroll'] | No |  | Scroll event callback |
| `scrollEventThrottle` | number | No |  | Throttle interval for scroll events in ms |
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

### Basic Masonry
ID: `Masonry.basic` • Tags: basic, layout, grid, columns, simple • Category: general

Simple masonry layout with uniform item heights arranged in a two-column grid.

```tsx
const theme = useTheme();
  const masonryItems: MasonryItem[] = [
    {
      id: '1',
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Card 1</Text>
          <Text>This is a basic card item in the masonry layout.</Text>
        </Card>
      ),
    },
    {
      id: '2',
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Card 2</Text>
          <Text>Short content.</Text>
        </Card>
      ),
    },
    {
      id: '3',
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Card 3</Text>
          <Text>A third card showing how items are arranged in the masonry grid with longer content that will make this card taller than the others.</Text>
        </Card>
      ),
    },
    {
      id: '4',
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Card 4</Text>
          <Text>Medium length content here.</Text>
        </Card>
      ),
    },
    {
      id: '5',
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Card 5</Text>
          <Text>Fifth card in the masonry layout grid.</Text>
        </Card>
      ),
    },
    {
      id: '6',
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Card 6</Text>
          <Text>Sixth card showing the two-column arrangement.</Text>
        </Card>
      ),
    },
  ];
  return (
    <Masonry
      data={masonryItems}
      numColumns={2}
      gap="md"
      style={{ height: 400 }}
    />
  );
}
```

### Custom Columns
ID: `Masonry.custom-columns` • Tags: columns, responsive, grid, arrangement, configurable • Category: general

Masonry layout with configurable number of columns demonstrating different grid arrangements.

```tsx
const theme = useTheme();
  const [numColumns, setNumColumns] = useState(3);
  const masonryItems: MasonryItem[] = [
    {
      id: '1',
      heightRatio: 1.1,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 1</Text>
          <Text>Content for first item with some extra text.</Text>
        </Card>
      ),
    },
    {
      id: '2',
      heightRatio: 0.8,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 2</Text>
          <Text>Short content.</Text>
        </Card>
      ),
    },
    {
      id: '3',
      heightRatio: 1.3,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 3</Text>
          <Text>Longer content to demonstrate height variation in different column layouts.</Text>
        </Card>
      ),
    },
    {
      id: '4',
      heightRatio: 0.9,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 4</Text>
          <Text>Medium length content.</Text>
        </Card>
      ),
    },
    {
      id: '5',
      heightRatio: 1.5,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 5</Text>
          <Text>Extended content that takes up more space to show how columns adapt.</Text>
        </Card>
      ),
    },
    {
      id: '6',
      heightRatio: 0.7,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 6</Text>
          <Text>Compact.</Text>
        </Card>
      ),
    },
    {
      id: '7',
      heightRatio: 1.2,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 7</Text>
          <Text>Another item with moderate content length for testing.</Text>
        </Card>
      ),
    },
    {
      id: '8',
      heightRatio: 0.9,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 8</Text>
          <Text>Standard content item.</Text>
        </Card>
      ),
    },
    {
      id: '9',
      heightRatio: 1.4,
      content: (
        <Card p={12}>
          <Text variant="strong" style={{ marginBottom: 6 }}>Item 9</Text>
          <Text>Taller content to fill out the grid and show column distribution effects.</Text>
        </Card>
      ),
    },
  ];
  return (
    <>
      <Row gap="sm" style={{ marginBottom: 16 }}>
        <Button
          title="1 Column"
          size="sm"
          variant={numColumns === 1 ? 'filled' : 'outline'}
          onPress={() => setNumColumns(1)}
        />
        <Button
          title="2 Columns"
          size="sm"
          variant={numColumns === 2 ? 'filled' : 'outline'}
          onPress={() => setNumColumns(2)}
        />
        <Button
          title="3 Columns"
          size="sm"
          variant={numColumns === 3 ? 'filled' : 'outline'}
          onPress={() => setNumColumns(3)}
        />
        <Button
          title="4 Columns"
          size="sm"
          variant={numColumns === 4 ? 'filled' : 'outline'}
          onPress={() => setNumColumns(4)}
        />
      </Row>
      <Masonry
        data={masonryItems}
        numColumns={numColumns}
        gap="md"
        style={{ height: 400 }}
      />
    </>
  );
}
```

### Variable Heights
ID: `Masonry.variable-heights` • Tags: heights, staggered, organic, pinterest, variable • Category: general

Masonry layout with items of different heights creating an organic, Pinterest-style staggered appearance.

```tsx
const theme = useTheme();
  const masonryItems: MasonryItem[] = [
    {
      id: '1',
      heightRatio: 1.2,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Tall Card</Text>
          <Text>
            This is a taller card with more content to demonstrate the variable height 
            functionality. It shows how items with different heights are arranged in 
            the masonry layout to create an organic, staggered appearance.
          </Text>
        </Card>
      ),
    },
    {
      id: '2',
      heightRatio: 0.7,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Short Card</Text>
          <Text>A shorter card with minimal content.</Text>
        </Card>
      ),
    },
    {
      id: '3',
      heightRatio: 1.8,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Very Tall Card</Text>
          <Text>
            This card is extra tall to showcase the masonry layout's ability to handle 
            significant height variations. Lorem ipsum dolor sit amet, consectetur 
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna 
            aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
          </Text>
          <Text style={{ marginTop: 8 }}>
            Additional paragraph to make it even taller and show how the layout adapts 
            to content of different sizes naturally.
          </Text>
        </Card>
      ),
    },
    {
      id: '4',
      heightRatio: 1.0,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Regular Card</Text>
          <Text>A standard height card with regular content length.</Text>
        </Card>
      ),
    },
    {
      id: '5',
      heightRatio: 0.9,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Medium Card</Text>
          <Text>Medium height card with moderate content.</Text>
        </Card>
      ),
    },
    {
      id: '6',
      heightRatio: 1.5,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Extended Card</Text>
          <Text>
            An extended card that demonstrates how the masonry layout handles 
            items that are taller than average, creating natural flow patterns.
          </Text>
        </Card>
      ),
    },
    {
      id: '7',
      heightRatio: 0.6,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Compact</Text>
          <Text>Compact card.</Text>
        </Card>
      ),
    },
    {
      id: '8',
      heightRatio: 2.0,
      content: (
        <Card p={16}>
          <Text variant="strong" style={{ marginBottom: 8 }}>Extra Tall Card</Text>
          <Text>
            This is the tallest card in the set, demonstrating the maximum height 
            variation supported by the masonry layout. It shows how very tall items 
            are positioned while maintaining good visual balance.
          </Text>
          <Text style={{ marginTop: 8 }}>
            The masonry layout algorithm ensures that even with extreme height 
            differences, the overall composition remains visually pleasing and 
            well-balanced across columns.
          </Text>
          <Text style={{ marginTop: 8 }}>
            This extra content makes the card significantly taller than others to 
            really showcase the variable height capabilities.
          </Text>
        </Card>
      ),
    },
  ];
  return (
    <Masonry
      data={masonryItems}
      numColumns={2}
      gap="lg"
      optimizeItemArrangement={true}
      style={{ height: 600 }}
    />
  );
}
```
