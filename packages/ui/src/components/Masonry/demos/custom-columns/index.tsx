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
