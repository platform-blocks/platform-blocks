import { Block, Button, IconButton, Row, Text, usePagination } from '@plocks/ui';

export function Demo() {
  const { page, range, setPage, next, previous } = usePagination({ total: 20, defaultValue: 7 });

  return (
    <Block fullWidth align="center">
      <Row gap="xs" align="center" wrap="wrap">
        <IconButton icon="chevron-left" variant="ghost" accessibilityLabel="Previous page" disabled={page === 1} onPress={previous} />
        {range.map((item, index) =>
          item === 'ellipsis' ? (
            <Text key={`gap-${index}`} c="muted">
              …
            </Text>
          ) : (
            <Button key={item} size="sm" variant={item === page ? 'filled' : 'ghost'} onPress={() => setPage(item)}>
              {item}
            </Button>
          )
        )}
        <IconButton icon="chevron-right" variant="ghost" accessibilityLabel="Next page" disabled={page === 20} onPress={next} />
      </Row>
    </Block>
  );
}
