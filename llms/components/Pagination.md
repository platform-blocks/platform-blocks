# Pagination

A comprehensive pagination component that provides intuitive navigation through large datasets. The component offers flexible configuration options and consistent styling across different use cases.

## Metadata

- Canonical name: `Pagination`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { Pagination } from '@platform-blocks/react-ui-library';`
- Status: stable
- Since: 1.0.0
- Category: navigation
- Tags: pagination, navigation, pages, data
- Docs: https://react-ui-library.com/components/Pagination
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/Pagination

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `current` | number | Yes |  | Current page number (1-indexed) |
| `total` | number | Yes |  | Total number of pages |
| `siblings` | number | No | 1 | Number of page items to show on each side of current page |
| `boundaries` | number | No | 1 | Number of page items to show at the boundaries |
| `onChange` | (page: number) => void | Yes |  | Page change handler |
| `size` | ComponentSizeValue | No | 'md' | Size of pagination controls |
| `variant` | 'default' \| 'outline' \| 'subtle' | No | 'default' | Variant style |
| `color` | 'primary' \| 'secondary' \| 'gray' | No | 'primary' | Color scheme |
| `showFirst` | boolean | No | true | Show first/last page buttons |
| `showPrevNext` | boolean | No | true | Show previous/next buttons |
| `labels` | { first?: ReactNode; previous?: ReactNode; next?: ReactNode; last?: ReactNode; } | No | {} | Custom labels for navigation buttons |
| `disabled` | boolean | No | false | Whether pagination is disabled |
| `style` | StyleProp<ViewStyle> | No |  | Custom styles |
| `buttonStyle` | StyleProp<ViewStyle> | No |  | Custom button styles |
| `activeButtonStyle` | StyleProp<ViewStyle> | No |  | Custom active button styles |
| `textStyle` | StyleProp<TextStyle> | No |  | Custom text styles |
| `activeTextStyle` | StyleProp<TextStyle> | No |  | Custom active text styles |
| `hideOnSinglePage` | boolean | No | false | Hide pagination when there's only one page |
| `showSizeChanger` | boolean | No | false | Show page size selector |
| `pageSizeOptions` | number[] | No | [10, 20, 50, 100] | Available page sizes |
| `pageSize` | number | No | 10 | Current page size |
| `onPageSizeChange` | (size: number) => void | No |  | Page size change handler |
| `showTotal` | boolean \| ((total: number, range: [number, number]) => ReactNode) | No | false | Show total count |
| `totalItems` | number | No |  | Total number of items |
| `labelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to every page-button label `<Text>` (style, weight, ff, size, color). |
| `activeLabelProps` | Omit<TextProps, 'children'> | No |  | Override props applied to the active page-button label `<Text>` (merged on top of `labelProps`). |
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

### Basic
ID: `Pagination.basic` • Tags: basic, pagination, navigation • Category: usage • Status: stable • Since: 1.0.0

Provide `current`, `total`, and an `onChange` handler to keep numbered pagination in sync with surrounding state.

```tsx
const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  return (
    <Block>
      <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
      <Text size="xs" color="secondary">
        Page {currentPage} of {totalPages}
      </Text>
    </Block>
  );
}
```

### Variants
ID: `Pagination.variants` • Tags: variants, style, appearance • Category: styling • Status: stable • Since: 1.0.0

Switch the `variant` prop between `default`, `outline`, and `subtle` to align pagination with the surrounding surface treatment.

```tsx
const [defaultPage, setDefaultPage] = useState(5);
  const [outlinePage, setOutlinePage] = useState(5);
  const [subtlePage, setSubtlePage] = useState(5);
  return (
    <Block>
      <Block>
        <Pagination current={defaultPage} total={15} onChange={setDefaultPage} variant="default" />
        <Text size="xs" color="secondary">
          Default variant keeps the control fully filled. Page {defaultPage} of 15.
        </Text>
      </Block>
      <Block>
        <Pagination current={outlinePage} total={15} onChange={setOutlinePage} variant="outline" />
        <Text size="xs" color="secondary">
          Outline keeps the surface quiet while the active page gets a stroke. Page {outlinePage} of 15.
        </Text>
      </Block>
      <Block>
        <Pagination current={subtlePage} total={15} onChange={setSubtlePage} variant="subtle" />
        <Text size="xs" color="secondary">
          Subtle removes backgrounds for tinted surfaces. Page {subtlePage} of 15.
        </Text>
      </Block>
    </Block>
  );
}
```

### Sizes
ID: `Pagination.sizes` • Tags: sizes, scale, responsive • Category: styling • Status: stable • Since: 1.0.0

Use the `size` prop (`xs` through `3xl`) to match pagination density to its container without changing behavior.

```tsx
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
  const [page, setPage] = useState(3);
  return (
    <Block>
      {SIZES.map((size) => (
        <Block key={size}>
          <Text variant="small" color="secondary">{size}</Text>
          <Pagination current={page} total={8} onChange={setPage} size={size} />
        </Block>
      ))}
    </Block>
  );
}
```

### Advanced
ID: `Pagination.advanced` • Tags: advanced, controls, boundaries, siblings • Category: usage • Status: stable • Since: 1.0.0

Combine `showFirst`, `showPrevNext`, `siblings`, and `boundaries` to reveal the right amount of context for long result sets.

```tsx
const [page1, setPage1] = useState(10);
  const [page2, setPage2] = useState(15);
  const [page3, setPage3] = useState(25);
  return (
    <Block>
      <Block>
        <Pagination
          current={page1}
          total={30}
          onChange={setPage1}
          showFirst
          showPrevNext
          siblings={2}
          boundaries={2}
        />
        <Text size="xs" color="secondary">
          Includes first and last buttons. Page {page1} of 30.
        </Text>
      </Block>
      <Block>
        <Pagination
          current={page2}
          total={40}
          onChange={setPage2}
          showPrevNext
          siblings={1}
          boundaries={1}
        />
        <Text size="xs" color="secondary">
          Minimal navigation with prev/next only. Page {page2} of 40.
        </Text>
      </Block>
      <Block>
        <Pagination
          current={page3}
          total={50}
          onChange={setPage3}
          showPrevNext
          siblings={0}
          boundaries={1}
          size="sm"
        />
        <Text size="xs" color="secondary">
          Compact layout with tight siblings. Page {page3} of 50.
        </Text>
      </Block>
    </Block>
  );
}
```

### Total & size changer
ID: `Pagination.size-changer` • Tags: pagination, page-size, total • Category: usage • Status: stable • Since: 1.0.0

Set `showTotal` with `totalItems` to render an "X-Y of N" summary, and `showSizeChanger` with `pageSizeOptions` / `onPageSizeChange` to let users change the rows-per-page. This is the same footer the `DataTable` renders internally.

```tsx
const totalItems = 248;
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState(1);
  const total = Math.max(1, Math.ceil(totalItems / pageSize));
  return (
    <Block>
      <Pagination
        current={current}
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
      <Text size="xs" color="secondary">
        Page {current} of {total} · {pageSize} rows per page
      </Text>
    </Block>
  );
}
```
