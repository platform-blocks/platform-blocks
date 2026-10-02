# Masonry

Masonry arranges items of varying heights in responsive columns.

## Metadata

- Import: `import { Masonry } from '@plocks/ui';`
- Docs: https://plocks.dev/components/Masonry
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Masonry

## Props

- `data` (required): MasonryItem[] = [] — Array of items to display in masonry layout
- `numColumns`: number = 2 — Number of columns (default: 2)
- `gap`: SizeValue = 'sm' — Spacing between items (spacing token or px) — applied by the default item renderer
- `optimizeItemArrangement`: boolean = true — Whether to optimize for staggered grid layout
- `renderItem`: (item: MasonryItem, index: number) => ReactNode — Custom item renderer - receives item and index
- `contentContainerStyle`: StyleProp<ViewStyle> — Content container style
- `contentProps`: StyleProps — Named spacing and sizing props for the scrollable content.
- `loading`: boolean = false — Loading state
- `emptyContent`: ReactNode — Empty state content
- `flashListProps`: MasonryFlashListProps — Flash list props to pass through
- `onEndReached`: ((info: { distanceFromEnd: number }) => void) | null — Callback when the end of the list is reached (for pagination / infinite scroll)
- `onEndReachedThreshold`: number — Distance from end (in pixels) to trigger onEndReached (default: FlashList default)
- `onViewableItemsChanged`: ((info: { viewableItems: MasonryViewToken<MasonryItem>[]; changed: MasonryViewToken<MasonryItem>[] }) => void) | null — Callback when viewable items change
- `scrollEnabled`: boolean — Whether scrolling is enabled
- `ListEmptyComponent`: React.ComponentType | React.ReactElement | null — Component rendered when the list is empty
- `ListFooterComponent`: React.ComponentType | React.ReactElement | null — Component rendered at the bottom of the list
- `ListHeaderComponent`: React.ComponentType | React.ReactElement | null — Component rendered at the top of the list
- `estimatedItemSize`: number — Estimated size of each item (performance hint)
- `refreshControl`: ScrollViewProps['refreshControl'] — Pull-to-refresh control
- `onScroll`: ScrollViewProps['onScroll'] — Scroll event callback
- `scrollEventThrottle`: number — Throttle interval for scroll events in ms
- `w`: DimensionProp — Width
- `h`: DimensionProp — Height
- `miw`: DimensionProp — Minimum width
- `maw`: DimensionProp — Maximum width
- `mih`: DimensionProp — Minimum height
- `mah`: DimensionProp — Maximum height
- `bg`: ThemeColor — Background: a `theme.backgrounds` token (`'surface'`, `'subtle'`, `'elevated'`…), a palette name (its subtle tint), `'primary.5'` shade syntax, or any CSS color.
- `opacity`: number — Opacity, `0`–`1`

Also accepts the shared props — base (`style` `testID`), spacing (`m` `mt` `mr` `mb` `ml` `mx` `my` `p` `pt` `pr` `pb` `pl` `px` `py`), visibility (`lightHidden` `darkHidden` `hiddenFrom` `visibleFrom`): https://plocks.dev/llms/guides/shared-props.md

## Types

```ts
export interface MasonryItem {
  /** Unique identifier for the item */
  id: string;
  /** Content to render inside the item */
  content: ReactNode;
  /** Optional custom height ratio (default: 1) */
  heightRatio?: number;
  /** Optional custom styling for the item */
  style?: StyleProp<ViewStyle>;
}

export type MasonryFlashListProps = Partial<ScrollViewProps> & Record<string, unknown>;

export interface MasonryViewToken<T = MasonryItem> {
  item: T;
  key: string;
  index: number | null;
  isViewable: boolean;
  timestamp?: number;
}
```

## Examples

### Basics

Simple masonry layout with uniform item heights arranged in a two-column grid.

```tsx
import { Card, Masonry, Text } from '@plocks/ui';
import type { MasonryItem } from '@plocks/ui';

export function Demo() {
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
      gap="md"
      style={{ height: 400 }}
    />
  );
}
```

### Custom Columns

Masonry layout with configurable number of columns demonstrating different grid arrangements.

```tsx
import { useState } from 'react';
import { Block, Button, Card, Masonry, Row, Text } from '@plocks/ui';
import type { MasonryItem } from '@plocks/ui';

const COLUMN_OPTIONS = [1, 2, 3, 4];

export function Demo() {
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
    <Block fullWidth>
      <Row gap="sm" wrap="wrap">
        {COLUMN_OPTIONS.map((count) => (
          <Button
            key={count}
            title={count === 1 ? '1 Column' : `${count} Columns`}
            size="sm"
            variant={numColumns === count ? 'filled' : 'outline'}
            onPress={() => setNumColumns(count)}
          />
        ))}
      </Row>

      <Masonry
        data={masonryItems}
        numColumns={numColumns}
        gap="md"
        style={{ height: 400 }}
      />
    </Block>
  );
}
```

### Variable Heights

Masonry layout with items of different heights creating an organic, Pinterest-style staggered appearance.

```tsx
import { Card, Masonry, Text } from '@plocks/ui';
import type { MasonryItem } from '@plocks/ui';

export function Demo() {
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
      gap="lg"
      style={{ height: 600 }}
    />
  );
}
```
