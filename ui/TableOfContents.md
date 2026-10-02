# TableOfContents

TableOfContents builds a navigable outline from page headings.

## Metadata

- Import: `import { TableOfContents } from '@plocks/ui';`
- Docs: https://plocks.dev/components/TableOfContents
- Source: https://github.com/platform-blocks/plocks/tree/main/packages/ui/src/components/TableOfContents

## Props

- `variant`: 'filled' | 'outline' | 'ghost' | 'none' = 'none' — Visual style variant for the table of contents
- `color`: ColorProp — Background color for the filled variant (and the active-item marker): a palette name, a shade (`'primary.6'`) or any CSS color. Falls back to the theme primary color.
- `size`: SizeValue = 'sm' — Text size for table of contents items
- `radius`: RadiusValue = 'md' — Border radius of the container: a radius token, px number, `'none'` or `'full'`.
- `scrollSpyOptions`: ScrollSpyOptions — Configuration options for scroll spy behavior
- `getControlProps`: (payload: { data: TocItem; active: boolean; index: number }) => TableOfContentsControlProps — Function to customize props for each table of contents item control
- `initialData`: TocItem[] — Initial data for table of contents items (useful for SSR or pre-rendering)
- `minDepthToOffset`: number = 1 — Depth from which items are indented: an item is offset by `(depth - minDepthToOffset) × depthOffset` px (never negative).
- `depthOffset`: number = 20 — Pixel offset to apply for each depth level (indentation amount)
- `reinitializeRef`: React.RefObject<(() => void) | null> — Ref to expose the reinitialize function for manually triggering TOC refresh
- `autoContrast`: boolean = false — Automatically adjust text color for contrast when using filled variant
- `onActiveChange`: (id: string | null, item?: TocItem) => void — Callback fired when the active item changes
- `container`: string | HTMLElement = 'main, [role="main"], .main-content, #main-content, article, .content, #content' — CSS selector string or HTMLElement to use as the scroll container
- `accessibilityLabel`: string = 'Table of contents' — Accessible name of the navigation landmark.
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
export type TableOfContentsControlProps = Partial<Omit<PressableProps, 'children'>> & {
  /** Replaces the default label. */
  children?: React.ReactNode;
};
```

## Examples

### Basics

Drop a table of contents beside your main article and it will register headings automatically through the shared title registry.

```tsx
import { Block, Row, TableOfContents, Text, Title, TitleRegistryProvider } from '@plocks/ui';

const SECTIONS = [
  { id: 'intro', title: 'Introduction', summary: 'Set the stage for the walkthrough.' },
  { id: 'setup', title: 'Setup', summary: 'Install dependencies and initialize the provider.' },
  { id: 'usage', title: 'Usage', summary: 'Render headings inside your content area to register them.' },
  { id: 'faq', title: 'FAQ', summary: 'Answer the questions you expect most often.' },
];

export function Demo() {

  return (
    <TitleRegistryProvider>
      <Row gap="xl" align="flex-start">
        <TableOfContents
          container="#toc-basic-content"
          variant="outline"
          size="sm"
          p="sm"
          style={{ width: 240 }}
        />
        <Block id="toc-basic-content" grow={1} style={{ maxWidth: 560 }}>
          {SECTIONS.map((section, index) => (
            <Block key={section.id}>
              <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
              <Text c="secondary">{section.summary}</Text>
            </Block>
          ))}
        </Block>
      </Row>
    </TitleRegistryProvider>
  );
}
```

### Variants

Choose between the `outline`, `ghost`, `filled`, and `none` variants. Pair `filled` with `autoContrast` to keep labels legible against a brand color.

```tsx
import { Row, TableOfContents } from '@plocks/ui';

const ITEMS = [
  { id: 'overview', value: 'Overview', depth: 1 },
  { id: 'tokens', value: 'Color tokens', depth: 2 },
  { id: 'accessibility', value: 'Accessibility', depth: 1 },
];

export function Demo() {
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

Seed the table of contents with `initialData` so servers and prerender jobs can render the navigation before headings mount.

```tsx
import { Block, TableOfContents } from '@plocks/ui';

const INITIAL_ITEMS = [
  { id: 'overview', value: 'Overview', depth: 1 },
  { id: 'setup', value: 'Setup', depth: 2 },
  { id: 'usage', value: 'Usage', depth: 2 },
  { id: 'advanced', value: 'Advanced', depth: 1 },
  { id: 'faq', value: 'FAQ', depth: 1 },
];

export function Demo() {
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

Use `minDepthToOffset` and `depthOffset` to indent nested headings so deep sections are easy to scan.

```tsx
import { Block, TableOfContents } from '@plocks/ui';

const INITIAL_ITEMS = [
  { id: 'intro', value: 'Introduction', depth: 1 },
  { id: 'schedule', value: 'Release schedule', depth: 2 },
  { id: 'api', value: 'API reference', depth: 2 },
  { id: 'hooks', value: 'Hooks', depth: 3 },
  { id: 'migration', value: 'Migration', depth: 1 },
];

export function Demo() {
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

Subscribe to `onActiveChange` to surface the currently highlighted section, perfect for syncing status chips or analytics.

```tsx
import { useState } from 'react';
import { Block, Chip, Row, TableOfContents, Text, Title, TitleRegistryProvider } from '@plocks/ui';

const SECTIONS = [
  { id: 'overview', title: 'Overview', summary: 'Explain when the progress indicator should appear.' },
  { id: 'loading', title: 'Loading States', summary: 'Describe feedback while content is fetching.' },
  { id: 'error', title: 'Error Recovery', summary: 'Clarify what happens if the data fails to load.' },
];

export function Demo() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <TitleRegistryProvider>
      <Block>
        <Chip variant="light" color={activeId ? 'primary' : 'gray'} size="sm">
          Active section: {activeId ?? 'None'}
        </Chip>

        <Row gap="xl" align="flex-start">
          <TableOfContents
            container="#toc-active-callback-content"
            variant="outline"
            size="xs"
            p="sm"
            style={{ width: 240 }}
            onActiveChange={setActiveId}
          />
          <Block id="toc-active-callback-content" grow={1} style={{ maxWidth: 560 }}>
            {SECTIONS.map((section, index) => (
              <Block key={section.id}>
                <Title order={index === 0 ? 1 : 2}>{section.title}</Title>
                <Text c="secondary">{section.summary}</Text>
              </Block>
            ))}
          </Block>
        </Row>
      </Block>
    </TitleRegistryProvider>
  );
}
```
