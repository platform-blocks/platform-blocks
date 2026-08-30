# TableOfContents

The `TableOfContents` component automatically discovers headings on the page (h1–h6) and renders a navigable outline with active section tracking. It supports scroll‑spy highlighting, deep-link copying, custom initial data (SSR / virtual docs), indentation control, appearance variants, and external active state notifications.

## Metadata

- Canonical name: `TableOfContents`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { TableOfContents } from '@platform-blocks/react-ui-library';`
- Since: 1.0.0
- Category: navigation
- Docs: https://react-ui-library.com/components/TableOfContents
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/components/TableOfContents

## Props

| Name | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `variant` | 'filled' \| 'outline' \| 'ghost' \| 'none' | No | 'none' | Visual style variant for the table of contents |
| `color` | string | No |  | Background color for filled variant. Falls back to theme primary color if not specified |
| `size` | SizeValue | No | 'sm' | Text size for table of contents items |
| `radius` | any | No |  | Border radius value for the container |
| `scrollSpyOptions` | ScrollSpyOptions | No |  | Configuration options for scroll spy behavior |
| `getControlProps` | (payload: { data: TocItem; active: boolean; index: number }) => any | No |  | Function to customize props for each table of contents item control |
| `initialData` | TocItem[] | No |  | Initial data for table of contents items (useful for SSR or pre-rendering) |
| `minDepthToOffset` | number | No | 1 | Minimum depth level at which to start applying depth offset indentation |
| `depthOffset` | number | No | 20 | Pixel offset to apply for each depth level (indentation amount) |
| `reinitializeRef` | React.RefObject<() => void> | No |  | Ref to expose the reinitialize function for manually triggering TOC refresh |
| `autoContrast` | boolean | No | false | Automatically adjust text color for contrast when using filled variant |
| `style` | any | No |  | Additional styles to apply to the container |
| `onActiveChange` | (id: string \| null, item?: TocItem) => void | No |  | Callback fired when the active item changes |
| `container` | string \| HTMLElement | No | 'main, [role="main"], .main-content, #main-content, article, .content, #content' | CSS selector string or HTMLElement to use as the scroll container |
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

### Basics
ID: `TableOfContents.basic` • Tags: navigation • Category: basics • Status: stable • Since: 0.3.0

Drop a table of contents beside your main article and it will register headings automatically through the shared title registry.

```tsx
const SECTIONS = [
  { id: 'intro', title: 'Introduction', summary: 'Set the stage for the walkthrough.' },
  { id: 'setup', title: 'Setup', summary: 'Install dependencies and initialize the provider.' },
  { id: 'usage', title: 'Usage', summary: 'Render headings inside your content area to register them.' },
  { id: 'faq', title: 'FAQ', summary: 'Answer the questions you expect most often.' },
];
  const contentRef = useRef<HTMLDivElement | null>(null);
  return (
    <TitleRegistryProvider>
      <Row gap="xl" align="flex-start">
        <TableOfContents
          container={contentRef.current ?? undefined}
          variant="outline"
          size="sm"
          p="sm"
          style={{ width: 240 }}
        />
        <Block ref={contentRef} component="div" grow={1} style={{ maxWidth: 560 }}>
          {SECTIONS.map((section, index) => (
            <Block key={section.id}>
              <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
              <Text color="secondary">{section.summary}</Text>
            </Block>
          ))}
        </Block>
      </Row>
    </TitleRegistryProvider>
  );
}
```

### Variants
ID: `TableOfContents.variants` • Tags: variants, color • Category: theming • Status: stable • Since: 0.3.0

Choose between the `outline`, `ghost`, `filled`, and `none` variants. Pair `filled` with `autoContrast` to keep labels legible against a brand color.

```tsx
const ITEMS = [
  { id: 'overview', value: 'Overview', depth: 1 },
  { id: 'tokens', value: 'Color tokens', depth: 2 },
  { id: 'accessibility', value: 'Accessibility', depth: 1 },
];
  return (
    <Row gap="md" align="flex-start" wrap="wrap">
      <TableOfContents initialData={ITEMS} variant="outline" size="xs" style={{ width: 200 }} />
      <TableOfContents initialData={ITEMS} variant="ghost" size="xs" style={{ width: 200 }} />
      <TableOfContents
        initialData={ITEMS}
        variant="filled"
        color="primary.6"
        autoContrast
        size="xs"
        style={{ width: 200 }}
      />
    </Row>
  );
}
```

### Preloaded data
ID: `TableOfContents.custom-initial` • Tags: ssr • Category: basics • Status: stable • Since: 0.3.0

Seed the table of contents with `initialData` so servers and prerender jobs can render the navigation before headings mount.

```tsx
const INITIAL_ITEMS = [
  { id: 'overview', value: 'Overview', depth: 1 },
  { id: 'setup', value: 'Setup', depth: 2 },
  { id: 'usage', value: 'Usage', depth: 2 },
  { id: 'advanced', value: 'Advanced', depth: 1 },
  { id: 'faq', value: 'FAQ', depth: 1 },
];
  return (
    <Block align="flex-start">
      <TableOfContents
        initialData={INITIAL_ITEMS}
        variant="outline"
        depthOffset={16}
        radius="sm"
        size="sm"
        p="sm"
        style={{ width: 240 }}
      />
    </Block>
  );
}
```

### Depth offset
ID: `TableOfContents.depth-offset` • Tags: indentation • Category: theming • Status: stable • Since: 0.3.0

Use `minDepthToOffset` and `depthOffset` to indent nested headings so deep sections are easy to scan.

```tsx
const INITIAL_ITEMS = [
  { id: 'intro', value: 'Introduction', depth: 1 },
  { id: 'schedule', value: 'Release schedule', depth: 2 },
  { id: 'api', value: 'API reference', depth: 2 },
  { id: 'hooks', value: 'Hooks', depth: 3 },
  { id: 'migration', value: 'Migration', depth: 1 },
];
  return (
    <Block align="flex-start">
      <TableOfContents
        initialData={INITIAL_ITEMS}
        variant="outline"
        minDepthToOffset={2}
        depthOffset={28}
        size="xs"
        p="sm"
        style={{ width: 240 }}
      />
    </Block>
  );
}
```

### Active callbacks
ID: `TableOfContents.active-callback` • Tags: navigation • Category: advanced • Status: stable • Since: 0.3.0

Subscribe to `onActiveChange` to surface the currently highlighted section, perfect for syncing status chips or analytics.

```tsx
const SECTIONS = [
  { id: 'overview', title: 'Overview', summary: 'Explain when the progress indicator should appear.' },
  { id: 'loading', title: 'Loading States', summary: 'Describe feedback while content is fetching.' },
  { id: 'error', title: 'Error Recovery', summary: 'Clarify what happens if the data fails to load.' },
];
  const [activeId, setActiveId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  return (
    <TitleRegistryProvider>
      <Block>
        <Chip variant="light" color={activeId ? 'primary' : 'gray'} size="sm">
          Active section: {activeId ?? 'None'}
        </Chip>
        <Row gap="xl" align="flex-start">
          <TableOfContents
            container={contentRef.current ?? undefined}
            variant="outline"
            size="xs"
            p="sm"
            style={{ width: 240 }}
            onActiveChange={setActiveId}
          />
          <Block ref={contentRef} component="div" grow={1} style={{ maxWidth: 560 }}>
            {SECTIONS.map((section, index) => (
              <Block key={section.id}>
                <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
                <Text color="secondary">{section.summary}</Text>
              </Block>
            ))}
          </Block>
        </Row>
      </Block>
    </TitleRegistryProvider>
  );
}
```
