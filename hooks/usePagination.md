# usePagination

Headless pagination: the current page, the page numbers to render with ellipses for the gaps, and handlers to move between pages. Build your own pager with it; `Pagination` is built on it.

## Metadata

- Import: `import { usePagination } from '@plocks/ui';`
- Tags: pagination, pager, navigation, headless
- Docs: https://plocks.dev/hooks/usePagination
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/hooks/usePagination/usePagination.ts

## Definition

```ts
export interface UsePaginationOptions {
  /** Total number of pages. */
  total: number;
  /** Current page (1-indexed). Controlled. */
  value?: number;
  /** Initial page when uncontrolled. @default 1 */
  defaultValue?: number;
  /** Called with the new page (1-indexed) whenever it changes. */
  onChange?: (page: number) => void;
  /** Pages shown on each side of the current page. @default 1 */
  siblings?: number;
  /** Pages always shown at the start and at the end. @default 1 */
  boundaries?: number;
}

export interface UsePaginationReturn {
  /** The current page, clamped to `1…total`. */
  page: number;
  /**
   * Pages to render, in order, with `'ellipsis'` for each gap. Always the same
   * length for a given `total`, `siblings` and `boundaries`, so the control
   * doesn't change width as the current page moves.
   */
  range: PaginationRangeItem[];
  /** Go to `page` (clamped to `1…total`). No-op when it's already current. */
  setPage: (page: number) => void;
  next: () => void;
  previous: () => void;
  first: () => void;
  last: () => void;
}

export type PaginationRangeItem = number | 'ellipsis';

export function usePagination(options: UsePaginationOptions): UsePaginationReturn;
```

## Examples

### Build a custom pager

`usePagination({ total, value?, defaultValue?, onChange?, siblings?, boundaries? })` returns `{ page, range, setPage, next, previous, first, last }`. `range` lists the page numbers to render, with `'ellipsis'` for each gap. It is always the same length for a given `total`, so the pager keeps its width as you page through.

`siblings` (default 1) sets how many pages show on each side of the current one, and `boundaries` (default 1) how many at each end. An ellipsis never stands in for a single page: that page is shown instead. Pass `value` + `onChange` to control the page. Out-of-range pages are clamped, and moves to the current page are ignored. The plain `getPaginationRange(page, total, siblings, boundaries)` function is exported too.

```tsx
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
```
