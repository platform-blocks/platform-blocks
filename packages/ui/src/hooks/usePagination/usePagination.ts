import { useCallback, useMemo, useRef } from 'react';

import { useControllableState } from '../useControllableState';

/** A page number, or a gap in the range that stands for hidden pages. */
export type PaginationRangeItem = number | 'ellipsis';

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

/** Inclusive integer range; empty when `end < start`. */
function span(start: number, end: number): number[] {
  const length = end - start + 1;
  return length > 0 ? Array.from({ length }, (_, index) => start + index) : [];
}

/**
 * The page items for `page` out of `total`: `boundaries` pages at each end,
 * `siblings` pages on either side of the current one, and an ellipsis for
 * each gap. When an ellipsis would hide a single page, the page is shown
 * instead, and the edges fill up with extra pages so the item count stays
 * fixed.
 */
export function getPaginationRange(
  page: number,
  total: number,
  siblings: number = 1,
  boundaries: number = 1
): PaginationRangeItem[] {
  const pageCount = Math.max(0, Math.trunc(total));
  const siblingCount = Math.max(0, Math.trunc(siblings));
  const boundaryCount = Math.max(0, Math.trunc(boundaries));

  // Boundaries at both ends, the current page with its siblings, and two gaps.
  const itemCount = siblingCount * 2 + 3 + boundaryCount * 2;
  if (itemCount >= pageCount) return span(1, pageCount);

  const current = Math.min(Math.max(1, Math.trunc(page)), pageCount);
  const leftSibling = Math.max(current - siblingCount, boundaryCount);
  const rightSibling = Math.min(current + siblingCount, pageCount - boundaryCount);
  const showLeftGap = leftSibling > boundaryCount + 2;
  const showRightGap = rightSibling < pageCount - (boundaryCount + 1);

  if (!showLeftGap && showRightGap) {
    const leftCount = siblingCount * 2 + boundaryCount + 2;
    return [...span(1, leftCount), 'ellipsis', ...span(pageCount - boundaryCount + 1, pageCount)];
  }

  if (showLeftGap && !showRightGap) {
    const rightCount = boundaryCount + 1 + siblingCount * 2;
    return [...span(1, boundaryCount), 'ellipsis', ...span(pageCount - rightCount, pageCount)];
  }

  return [
    ...span(1, boundaryCount),
    'ellipsis',
    ...span(leftSibling, rightSibling),
    'ellipsis',
    ...span(pageCount - boundaryCount + 1, pageCount),
  ];
}

/**
 * Headless pagination: the current page, the page items to render (numbers
 * with ellipses for the gaps) and handlers to move between pages. Use it to
 * build a custom pager; `Pagination` is built on it.
 *
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 * The handlers are stable while `total` is unchanged.
 *
 * @example
 * const { page, range, setPage, next, previous } = usePagination({ total: 20 });
 * range.map((item, index) =>
 *   item === 'ellipsis' ? <Text key={`gap-${index}`}>…</Text> : (
 *     <Button key={item} variant={item === page ? 'filled' : 'ghost'} onPress={() => setPage(item)}>
 *       {item}
 *     </Button>
 *   )
 * );
 */
export function usePagination(options: UsePaginationOptions): UsePaginationReturn {
  const { total, value, defaultValue, onChange, siblings = 1, boundaries = 1 } = options;

  const [storedPage, setStoredPage] = useControllableState<number>({
    value,
    defaultValue,
    finalValue: 1,
    onChange,
  });

  const lastPage = Math.max(1, Math.trunc(total));
  const page = Math.min(Math.max(1, storedPage), lastPage);

  // Latest page for the stable handlers. Advanced on every move, so several
  // calls in one event (`next(); next();`) compose instead of repeating.
  const pageRef = useRef(page);
  pageRef.current = page;

  const setPage = useCallback(
    (next: number) => {
      if (!Number.isFinite(next)) return;
      const clamped = Math.min(Math.max(1, Math.trunc(next)), lastPage);
      if (clamped === pageRef.current) return;
      pageRef.current = clamped;
      setStoredPage(clamped);
    },
    [lastPage, setStoredPage]
  );

  const range = useMemo(
    () => getPaginationRange(page, total, siblings, boundaries),
    [page, total, siblings, boundaries]
  );

  const handlers = useMemo(
    () => ({
      next: () => setPage(pageRef.current + 1),
      previous: () => setPage(pageRef.current - 1),
      first: () => setPage(1),
      last: () => setPage(lastPage),
    }),
    [lastPage, setPage]
  );

  return useMemo(
    () => ({ page, range, setPage, ...handlers }),
    [page, range, setPage, handlers]
  );
}
