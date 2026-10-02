# Pagination

Pagination provides controls for moving through pages of content.

## Metadata

- Import: `import { Pagination } from '@plocks/ui';`
- Tags: pagination, navigation, pages, data
- Docs: https://plocks.dev/components/Pagination
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/Pagination

## Props

- `value`: number — Current page number (1-indexed). Controlled.
- `defaultValue`: number = 1 — Initial page when uncontrolled. @default 1
- `total` (required): number — Total number of pages
- `siblings`: number = 1 — Number of page items to show on each side of current page
- `boundaries`: number = 1 — Number of page items to show at the boundaries
- `onChange`: (page: number) => void — Called with the new page number (1-indexed).
- `size`: SizeValue = 'md' — Size of the pagination controls. Page items are compact controls: they render one step below `size` on the shared control scale.
- `variant`: 'default' | 'outline' | 'subtle' = 'default' — Variant style
- `color`: ColorProp = 'primary' — Accent color of the current page: a palette name (`'primary'`), a shade (`'primary.6'`) or any CSS color.
- `showFirst`: boolean = true — Show first/last page buttons
- `showPrevNext`: boolean = true — Show previous/next buttons
- `labels`: { first?: ReactNode; previous?: ReactNode; next?: ReactNode; last?: ReactNode; } — Custom visible content for the navigation buttons (defaults to chevron icons).
- `accessibilityLabels`: PaginationAccessibilityLabels — Accessible names for the landmark and controls (for translation).
- `disabled`: boolean = false — Whether pagination is disabled
- `buttonStyle`: StyleProp<ViewStyle> — Custom button styles
- `activeButtonStyle`: StyleProp<ViewStyle> — Custom active button styles
- `textStyle`: StyleProp<TextStyle> — Custom text styles
- `activeTextStyle`: StyleProp<TextStyle> — Custom active text styles
- `hideOnSinglePage`: boolean = false — Hide pagination when there's only one page
- `showSizeChanger`: boolean = false — Show page size selector
- `pageSizeOptions`: number[] = [10, 20, 50, 100] — Available page sizes
- `pageSize`: number = 10 — Current page size
- `onPageSizeChange`: (size: number) => void — Page size change handler
- `showTotal`: boolean | ((total: number, range: [number, number]) => ReactNode) = false — Show total count
- `totalItems`: number — Total number of items
- `labelProps`: Omit<TextProps, 'children'> — Override props applied to every page-button label `<Text>` (style, fw, ff, size, c).
- `activeLabelProps`: Omit<TextProps, 'children'> — Override props applied to the active page-button label `<Text>` (merged on top of `labelProps`).
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
export interface PaginationAccessibilityLabels {
  /** Label of the `navigation` landmark. @default 'Pagination' */
  root?: string;
  /** @default 'First page' */
  first?: string;
  /** @default 'Previous page' */
  previous?: string;
  /** @default 'Next page' */
  next?: string;
  /** @default 'Last page' */
  last?: string;
  /** Name of a page button. @default (page) => `Page ${page}` */
  page?: (page: number) => string;
}
```

## Examples

### Basics

Provide `value`, `total`, and an `onChange` handler to keep numbered pagination in sync with surrounding state.

```tsx
import { useState } from 'react';

import { Block, Pagination, Text } from '@plocks/ui';

export function Demo() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <Block>
      <Pagination value={currentPage} total={totalPages} onChange={setCurrentPage} />
      <Text size="xs" c="secondary">
        Page {currentPage} of {totalPages}
      </Text>
    </Block>
  );
}
```

### Variants

Switch the `variant` prop between `default`, `outline`, and `subtle` to align pagination with the surrounding surface treatment.

```tsx
import { useState } from 'react';

import { Block, Pagination, Text } from '@plocks/ui';

export function Demo() {
  const [defaultPage, setDefaultPage] = useState(5);
  const [outlinePage, setOutlinePage] = useState(5);
  const [subtlePage, setSubtlePage] = useState(5);

  return (
    <Block>
      <Block>
        <Pagination value={defaultPage} total={15} onChange={setDefaultPage} variant="default" />
        <Text size="xs" c="secondary">
          Default variant keeps the control fully filled. Page {defaultPage} of 15.
        </Text>
      </Block>

      <Block>
        <Pagination value={outlinePage} total={15} onChange={setOutlinePage} variant="outline" />
        <Text size="xs" c="secondary">
          Outline keeps the surface quiet while the active page gets a stroke. Page {outlinePage} of 15.
        </Text>
      </Block>

      <Block>
        <Pagination value={subtlePage} total={15} onChange={setSubtlePage} variant="subtle" />
        <Text size="xs" c="secondary">
          Subtle removes backgrounds for tinted surfaces. Page {subtlePage} of 15.
        </Text>
      </Block>
    </Block>
  );
}
```

### Sizes

Use the `size` prop (`xs` through `3xl`) to match pagination density to its container without changing behavior.

```tsx
import { useState } from 'react';
import { Block, Pagination, Text } from '@plocks/ui';

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function Demo() {
  const [page, setPage] = useState(3);

  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" c="secondary">{size}</Text>
          <Pagination value={page} total={8} onChange={setPage} size={size} />
        </Block>
      ))}
    </Block>
  );
}
```

### Advanced

Combine `showFirst`, `showPrevNext`, `siblings`, and `boundaries` to reveal the right amount of context for long result sets.

```tsx
import { useState } from 'react';

import { Block, Pagination, Text } from '@plocks/ui';

export function Demo() {
  const [page1, setPage1] = useState(10);
  const [page2, setPage2] = useState(15);
  const [page3, setPage3] = useState(25);

  return (
    <Block>
      <Block>
        <Pagination
          value={page1}
          total={30}
          onChange={setPage1}
          showFirst
          showPrevNext
          siblings={2}
          boundaries={2}
        />
        <Text size="xs" c="secondary">
          Includes first and last buttons. Page {page1} of 30.
        </Text>
      </Block>

      <Block>
        <Pagination
          value={page2}
          total={40}
          onChange={setPage2}
          showPrevNext
          siblings={1}
          boundaries={1}
        />
        <Text size="xs" c="secondary">
          Minimal navigation with prev/next only. Page {page2} of 40.
        </Text>
      </Block>

      <Block>
        <Pagination
          value={page3}
          total={50}
          onChange={setPage3}
          showPrevNext
          siblings={0}
          boundaries={1}
          size="sm"
        />
        <Text size="xs" c="secondary">
          Compact layout with tight siblings. Page {page3} of 50.
        </Text>
      </Block>
    </Block>
  );
}
```

### Total & size changer

Set `showTotal` with `totalItems` to render an "X-Y of N" summary, and `showSizeChanger` with `pageSizeOptions` / `onPageSizeChange` to let users change the rows-per-page. This is the same footer the `DataTable` renders internally.

```tsx
import { useState } from 'react';

import { Block, Pagination, Text } from '@plocks/ui';

export function Demo() {
  const totalItems = 248;
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);

  const total = Math.max(1, Math.ceil(totalItems / pageSize));

  return (
    <Block>
      <Pagination
        value={current}
        total={total}
        onChange={setCurrent}
        showTotal
        totalItems={totalItems}
        pageSize={pageSize}
        showSizeChanger
        pageSizeOptions={[10, 20, 50, 100]}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrent(1);
        }}
      />
      <Text size="xs" c="secondary">
        Page {current} of {total} · {pageSize} rows per page
      </Text>
    </Block>
  );
}
```
